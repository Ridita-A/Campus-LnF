-- ============================================
-- REPORT CREATION PROCEDURES
-- ============================================

CREATE OR REPLACE PROCEDURE create_lost_report(
    p_creator_id INT,
    p_last_location_id INT,
    p_title VARCHAR(50),
    p_description TEXT,
    p_lost_at TIMESTAMP,
    p_tags INT[],
    p_image_urls TEXT[]
)
LANGUAGE plpgsql
AS $$
DECLARE
    new_lost_id INT;
    tag_id INT;
    image_url TEXT;
BEGIN
    -- Insert main lost report
    INSERT INTO Lost_Report (
        creator_id, last_location_id, title, description, lost_at, status
    )
    VALUES (
        p_creator_id, p_last_location_id, p_title, p_description, p_lost_at, 'active'
    )
    RETURNING lost_id INTO new_lost_id;

    -- Insert tags
    FOREACH tag_id IN ARRAY p_tags
    LOOP
        INSERT INTO Lost_Report_Tags (lost_id, category_id)
        VALUES (new_lost_id, tag_id);
    END LOOP;

    -- Insert images
    FOREACH image_url IN ARRAY p_image_urls
    LOOP
        INSERT INTO Lost_Report_Images (lost_id, image_url)
        VALUES (new_lost_id, image_url);
    END LOOP;
END;
$$;

CREATE OR REPLACE PROCEDURE create_found_report(
    p_creator_id INT,
    p_found_location_id INT,
    p_title VARCHAR(50),
    p_description TEXT,
    p_found_at TIMESTAMP,
    p_tags INT[],
    p_image_urls TEXT[]
)
LANGUAGE plpgsql
AS $$
DECLARE
    new_found_id INT;
    tag_id INT;
    image_url TEXT;
BEGIN
    -- Insert main found report
    INSERT INTO Found_Report (
        creator_id, found_location_id, title, description, found_at, status
    )
    VALUES (
        p_creator_id, p_found_location_id, p_title, p_description, p_found_at, 'active'
    )
    RETURNING found_id INTO new_found_id;

    -- Insert tags
    FOREACH tag_id IN ARRAY p_tags
    LOOP
        INSERT INTO Found_Report_Tags (found_id, category_id)
        VALUES (new_found_id, tag_id);
    END LOOP;

    -- Insert images
    FOREACH image_url IN ARRAY p_image_urls
    LOOP
        INSERT INTO Found_Report_Images (found_id, image_url)
        VALUES (new_found_id, image_url);
    END LOOP;
END;
$$;


-- ============================================
-- CLAIM REQUEST PROCEDURES
-- ============================================

CREATE OR REPLACE PROCEDURE create_claim_request_found(
    p_requester_id INT,
    p_found_report_id INT,
    p_message TEXT,
    p_image_urls TEXT[]
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_claim_id INT;
    v_found_creator_id INT;
    v_item_title VARCHAR(50);
    v_requester_name VARCHAR(100);
    image_url TEXT;
BEGIN
    -- Get the creator of the found report and item title
    SELECT creator_id, title INTO v_found_creator_id, v_item_title
    FROM Found_Report
    WHERE found_id = p_found_report_id;

    -- Get requester name
    SELECT name INTO v_requester_name
    FROM Users
    WHERE user_id = p_requester_id;

    -- Insert claim request
    INSERT INTO Claim_Request (
        requester_id, 
        found_report_id, 
        message, 
        claimed_at, 
        status
    )
    VALUES (
        p_requester_id, 
        p_found_report_id, 
        p_message, 
        NOW(), 
        'pending'
    )
    RETURNING claim_id INTO v_claim_id;

    -- Insert images
    FOREACH image_url IN ARRAY COALESCE(p_image_urls, ARRAY[]::TEXT[])
    LOOP
        INSERT INTO Claim_Request_Images (claim_id, image_url)
        VALUES (v_claim_id, image_url);
    END LOOP;

    -- Create notification for the found item creator
    INSERT INTO Notification (user_id, claim_id, message)
    VALUES (
        v_found_creator_id,
        v_claim_id,
        v_requester_name || ' has requested to claim your found item: ' || v_item_title
    );
END;
$$;

CREATE OR REPLACE PROCEDURE create_return_request_lost(
    p_requester_id INT,
    p_lost_report_id INT,
    p_message TEXT,
    p_image_urls TEXT[]
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_lost_creator_id INT;
    v_item_title VARCHAR(50);
    v_requester_name VARCHAR(100);
    v_return_id INT;
    image_url TEXT;
BEGIN
    -- Get the creator of the lost report and item title
    SELECT creator_id, title INTO v_lost_creator_id, v_item_title
    FROM Lost_Report
    WHERE lost_id = p_lost_report_id;

    -- Get requester name
    SELECT name INTO v_requester_name
    FROM Users
    WHERE user_id = p_requester_id;

    -- Insert claim request for lost item
    INSERT INTO Return_Request (
        requester_id, 
        lost_report_id, 
        message, 
        returned_at, 
        status
    )
    VALUES (
        p_requester_id, 
        p_lost_report_id, 
        p_message, 
        NOW(), 
        'pending'
    )
    RETURNING return_id INTO v_return_id;

    -- Insert images
    FOREACH image_url IN ARRAY COALESCE(p_image_urls, ARRAY[]::TEXT[])
    LOOP
        INSERT INTO Return_Request_Images (return_id, image_url)
        VALUES (v_return_id, image_url);
    END LOOP;

    -- Create notification for the lost item creator
    INSERT INTO Notification (user_id, return_id, message)
    VALUES (
        v_lost_creator_id,
        v_return_id,
        v_requester_name || ' says they found your lost item: ' || v_item_title
    );
END;
$$;


-- ============================================
-- NOTIFICATION PROCEDURES
-- ============================================

CREATE OR REPLACE PROCEDURE delete_notification(p_notification_id INT)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM Notification WHERE notification_id = p_notification_id;
END;
$$;

CREATE OR REPLACE PROCEDURE mark_notification_as_read(
    p_notification_id INT,
    p_user_id INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Notification
    SET
        is_read = TRUE,
        read_at = COALESCE(read_at, NOW() AT TIME ZONE 'UTC')
    WHERE notification_id = p_notification_id
      AND user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Notification not found for this user.';
    END IF;
END;
$$;


-- ============================================
-- CLAIM & RETURN ACTION PROCEDURES
-- ============================================

CREATE OR REPLACE PROCEDURE accept_claim_request(p_claim_id INT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_requester_id INT;
    v_found_id INT;
    v_lost_id INT;
    v_item_title VARCHAR(50);
    v_owner_name VARCHAR(100);
BEGIN
    -- Get request details
    SELECT requester_id, found_report_id, lost_report_id INTO v_requester_id, v_found_id, v_lost_id
    FROM Claim_Request
    WHERE claim_id = p_claim_id;

    -- Update request status
    UPDATE Claim_Request SET status = 'accepted' WHERE claim_id = p_claim_id;

    -- Update report status and get title/owner
    IF v_found_id IS NOT NULL THEN
        UPDATE Found_Report SET status = 'completed' WHERE found_id = v_found_id;
        SELECT title, u.name INTO v_item_title, v_owner_name 
        FROM Found_Report fr JOIN Users u ON fr.creator_id = u.user_id WHERE found_id = v_found_id;
    ELSIF v_lost_id IS NOT NULL THEN
        UPDATE Lost_Report SET status = 'completed' WHERE lost_id = v_lost_id;
        SELECT title, u.name INTO v_item_title, v_owner_name 
        FROM Lost_Report lr JOIN Users u ON lr.creator_id = u.user_id WHERE lost_id = v_lost_id;
    END IF;

    -- Notify requester
    INSERT INTO Notification (user_id, claim_id, message)
    VALUES (v_requester_id, p_claim_id, v_owner_name || ' has accepted your claim for: ' || v_item_title);
END;
$$;

CREATE OR REPLACE PROCEDURE reject_claim_request(p_claim_id INT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_requester_id INT;
    v_item_title VARCHAR(50);
    v_owner_name VARCHAR(100);
BEGIN
    -- Get request details
    SELECT requester_id, COALESCE(fr.title, lr.title), u.name 
    INTO v_requester_id, v_item_title, v_owner_name
    FROM Claim_Request cr
    LEFT JOIN Found_Report fr ON cr.found_report_id = fr.found_id
    LEFT JOIN Lost_Report lr ON cr.lost_report_id = lr.lost_id
    JOIN Users u ON COALESCE(fr.creator_id, lr.creator_id) = u.user_id
    WHERE claim_id = p_claim_id;

    -- Update request status
    UPDATE Claim_Request SET status = 'rejected' WHERE claim_id = p_claim_id;

    -- Notify requester
    INSERT INTO Notification (user_id, claim_id, message)
    VALUES (v_requester_id, p_claim_id, v_owner_name || ' has rejected your claim for: ' || v_item_title);
END;
$$;

CREATE OR REPLACE PROCEDURE accept_return_request(p_return_id INT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_requester_id INT;
    v_lost_id INT;
    v_item_title VARCHAR(50);
    v_owner_name VARCHAR(100);
BEGIN
    -- Get request details
    SELECT requester_id, lost_report_id INTO v_requester_id, v_lost_id
    FROM Return_Request
    WHERE return_id = p_return_id;

    -- Update request status
    UPDATE Return_Request SET status = 'accepted' WHERE return_id = p_return_id;

    -- Update report status
    UPDATE Lost_Report SET status = 'completed' WHERE lost_id = v_lost_id;

    -- Get item details
    SELECT title, u.name INTO v_item_title, v_owner_name 
    FROM Lost_Report lr JOIN Users u ON lr.creator_id = u.user_id WHERE lost_id = v_lost_id;

    -- Notify requester (the finder)
    INSERT INTO Notification (user_id, return_id, message)
    VALUES (v_requester_id, p_return_id, v_owner_name || ' has accepted your return request for: ' || v_item_title);
END;
$$;

CREATE OR REPLACE PROCEDURE reject_return_request(p_return_id INT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_requester_id INT;
    v_item_title VARCHAR(50);
    v_owner_name VARCHAR(100);
BEGIN
    -- Get request details
    SELECT requester_id, lr.title, u.name 
    INTO v_requester_id, v_item_title, v_owner_name
    FROM Return_Request rr
    JOIN Lost_Report lr ON rr.lost_report_id = lr.lost_id
    JOIN Users u ON lr.creator_id = u.user_id
    WHERE return_id = p_return_id;

    -- Update request status
    UPDATE Return_Request SET status = 'rejected' WHERE return_id = p_return_id;

    -- Notify requester
    INSERT INTO Notification (user_id, return_id, message)
    VALUES (v_requester_id, p_return_id, v_owner_name || ' has rejected your return request for: ' || v_item_title);
END;
$$;


-- ============================================
-- ARCHIVE PROCEDURES
-- ============================================

CREATE OR REPLACE PROCEDURE archive_lost_report(p_lost_id INT)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Lost_Report
    SET status = 'archived'
    WHERE lost_id = p_lost_id;
END;
$$;

CREATE OR REPLACE PROCEDURE archive_found_report(p_found_id INT)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Found_Report
    SET status = 'archived'
    WHERE found_id = p_found_id;
END;
$$;
