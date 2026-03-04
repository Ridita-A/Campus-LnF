-- ============================================
-- LOST AND FOUND TIMESTAMP TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION set_created_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_lost_created_at ON Lost_Report;
CREATE TRIGGER trigger_set_lost_created_at
BEFORE INSERT ON Lost_Report
FOR EACH ROW
EXECUTE FUNCTION set_created_at_timestamp();

DROP TRIGGER IF EXISTS trigger_set_found_created_at ON Found_Report;
CREATE TRIGGER trigger_set_found_created_at
BEFORE INSERT ON Found_Report
FOR EACH ROW
EXECUTE FUNCTION set_created_at_timestamp();

-- ============================================
-- NOTIFICATION TRIGGERS
-- ============================================

-- Trigger to notify found item creators when a claim request is made
CREATE OR REPLACE FUNCTION notify_claim_request()
RETURNS TRIGGER AS $$
DECLARE
    v_found_creator_id INT;
    v_item_title VARCHAR(50);
    v_requester_name VARCHAR(100);
BEGIN
    SELECT creator_id, title INTO v_found_creator_id, v_item_title
    FROM Found_Report
    WHERE found_id = NEW.found_report_id;

    SELECT name INTO v_requester_name
    FROM Users
    WHERE user_id = NEW.requester_id;

    INSERT INTO Notification (user_id, claim_id, message, created_at)
    VALUES (
        v_found_creator_id,
        NEW.claim_id,
        v_requester_name || ' has requested to claim your found item: ' || v_item_title,
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_claim_request ON Claim_Request;
CREATE TRIGGER trigger_notify_claim_request
AFTER INSERT ON Claim_Request
FOR EACH ROW
EXECUTE FUNCTION notify_claim_request();


-- Trigger to notify lost item creators when a return request is made
CREATE OR REPLACE FUNCTION notify_return_request()
RETURNS TRIGGER AS $$
DECLARE
    v_lost_creator_id INT;
    v_item_title VARCHAR(50);
    v_requester_name VARCHAR(100);
BEGIN
    SELECT creator_id, title INTO v_lost_creator_id, v_item_title
    FROM Lost_Report
    WHERE lost_id = NEW.lost_report_id;

    SELECT name INTO v_requester_name
    FROM Users
    WHERE user_id = NEW.requester_id;

    INSERT INTO Notification (user_id, return_id, message, created_at)
    VALUES (
        v_lost_creator_id,
        NEW.return_id,
        v_requester_name || ' says they found your lost item: ' || v_item_title,
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_return_request ON Return_Request;
CREATE TRIGGER trigger_notify_return_request
AFTER INSERT ON Return_Request
FOR EACH ROW
EXECUTE FUNCTION notify_return_request();


-- Trigger to notify requesters when their claim request status is updated (accepted/rejected)
CREATE OR REPLACE FUNCTION notify_claim_status_update()
RETURNS TRIGGER AS $$
DECLARE
    v_item_title VARCHAR(50);
    v_owner_name VARCHAR(100);
    v_status_action VARCHAR(20);
BEGIN
    -- Only trigger if status changed from pending to accepted/rejected
    IF OLD.status = 'pending' AND NEW.status IN ('accepted', 'rejected') THEN
        -- Get item title and owner name
        -- Note: Claim_Request foreign key is to found_report_id natively now
        SELECT title, u.name INTO v_item_title, v_owner_name
        FROM Found_Report fr
        JOIN Users u ON fr.creator_id = u.user_id
        WHERE fr.found_id = NEW.found_report_id;

        IF NEW.status = 'accepted' THEN
            v_status_action := 'accepted';
        ELSE
            v_status_action := 'rejected';
        END IF;

        INSERT INTO Notification (user_id, claim_id, message, created_at)
        VALUES (
            NEW.requester_id,
            NEW.claim_id,
            v_owner_name || ' has ' || v_status_action || ' your claim for: ' || v_item_title,
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_claim_status_update ON Claim_Request;
CREATE TRIGGER trigger_notify_claim_status_update
AFTER UPDATE OF status ON Claim_Request
FOR EACH ROW
EXECUTE FUNCTION notify_claim_status_update();


-- Trigger to notify requesters when their return request status is updated (accepted/rejected)
CREATE OR REPLACE FUNCTION notify_return_status_update()
RETURNS TRIGGER AS $$
DECLARE
    v_item_title VARCHAR(50);
    v_owner_name VARCHAR(100);
    v_status_action VARCHAR(20);
BEGIN
    -- Only trigger if status changed from pending to accepted/rejected
    IF OLD.status = 'pending' AND NEW.status IN ('accepted', 'rejected') THEN
        -- Get item title and owner name
        SELECT title, u.name INTO v_item_title, v_owner_name
        FROM Lost_Report lr
        JOIN Users u ON lr.creator_id = u.user_id
        WHERE lr.lost_id = NEW.lost_report_id;

        IF NEW.status = 'accepted' THEN
            v_status_action := 'accepted';
        ELSE
            v_status_action := 'rejected';
        END IF;

        INSERT INTO Notification (user_id, return_id, message, created_at)
        VALUES (
            NEW.requester_id,
            NEW.return_id,
            v_owner_name || ' has ' || v_status_action || ' your return request for: ' || v_item_title,
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_return_status_update ON Return_Request;
CREATE TRIGGER trigger_notify_return_status_update
AFTER UPDATE OF status ON Return_Request
FOR EACH ROW
EXECUTE FUNCTION notify_return_status_update();
