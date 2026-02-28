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
    p_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_claim_id INT;
    v_found_creator_id INT;
    v_item_title VARCHAR(50);
    v_requester_name VARCHAR(100);
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

    -- Create notification for the found item creator
    INSERT INTO Notification (user_id, claim_id, message)
    VALUES (
        v_found_creator_id,
        v_claim_id,
        v_requester_name || ' has requested to claim your found item: ' || v_item_title
    );
END;
$$;

CREATE OR REPLACE PROCEDURE create_claim_request_lost(
    p_requester_id INT,
    p_lost_report_id INT,
    p_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_claim_id INT;
    v_lost_creator_id INT;
    v_item_title VARCHAR(50);
    v_requester_name VARCHAR(100);
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
    INSERT INTO Claim_Request (
        requester_id, 
        lost_report_id, 
        message, 
        claimed_at, 
        status
    )
    VALUES (
        p_requester_id, 
        p_lost_report_id, 
        p_message, 
        NOW(), 
        'pending'
    )
    RETURNING claim_id INTO v_claim_id;

    -- Create notification for the lost item creator
    INSERT INTO Notification (user_id, claim_id, message)
    VALUES (
        v_lost_creator_id,
        v_claim_id,
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
