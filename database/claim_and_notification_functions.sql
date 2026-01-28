-- Create claim request procedure for FOUND items
CREATE OR REPLACE PROCEDURE create_claim_request_found(
    p_requester_id INT,
    p_found_report_id INT,
    p_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
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
    );

    -- Create notification for the found item creator
    INSERT INTO Notification (user_id, message)
    VALUES (
        v_found_creator_id,
        v_requester_name || ' has requested to claim your found item: ' || v_item_title
    );
END;
$$;

-- Create claim request procedure for LOST items
CREATE OR REPLACE PROCEDURE create_claim_request_lost(
    p_requester_id INT,
    p_lost_report_id INT,
    p_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
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
    );

    -- Create notification for the lost item creator
    INSERT INTO Notification (user_id, message)
    VALUES (
        v_lost_creator_id,
        v_requester_name || ' says they found your lost item: ' || v_item_title
    );
END;
$$;

-- Function to get user notifications
CREATE OR REPLACE FUNCTION get_user_notifications(p_user_id INT)
RETURNS TABLE (
    notification_id INT,
    message TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.notification_id,
        n.message,
        LOCALTIMESTAMP as created_at
    FROM Notification n
    WHERE n.user_id = p_user_id
    ORDER BY n.notification_id DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get claim requests for a user's found items
CREATE OR REPLACE FUNCTION get_user_claim_requests(p_user_id INT)
RETURNS TABLE (
    claim_id INT,
    requester_id INT,
    requester_name VARCHAR(100),
    found_report_id INT,
    item_title VARCHAR(50),
    message TEXT,
    claimed_at TIMESTAMP,
    status request_status_enum
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cr.claim_id,
        cr.requester_id,
        u.name as requester_name,
        cr.found_report_id,
        fr.title as item_title,
        cr.message,
        cr.claimed_at,
        cr.status
    FROM Claim_Request cr
    JOIN Found_Report fr ON cr.found_report_id = fr.found_id
    JOIN Users u ON cr.requester_id = u.user_id
    WHERE fr.creator_id = p_user_id
    ORDER BY cr.claimed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Procedure to delete/mark notification as read
CREATE OR REPLACE PROCEDURE delete_notification(p_notification_id INT)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM Notification WHERE notification_id = p_notification_id;
END;
$$;
