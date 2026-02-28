-- ============================================
-- AUTHENTICATION FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION user_login(
    user_email VARCHAR(255),
    user_password TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    user_id INT,
    message TEXT
) AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Auth WHERE email = user_email AND password = crypt(user_password, password)) THEN
        RETURN QUERY SELECT FALSE, CAST(NULL AS INT), 'Incorrect email or password.';
    ELSE
        UPDATE Auth
        SET last_login = NOW()
        WHERE email = user_email;

        RETURN QUERY
        SELECT TRUE, a.user_id, 'Login successful!'
        FROM Auth a 
        WHERE a.email = user_email;
    END IF;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION user_signup(
    user_name VARCHAR(100),
    user_contact BIGINT,
    user_email VARCHAR(255),
    user_student_id NUMERIC(9, 0),
    user_password TEXT
)
RETURNS VOID AS $$
DECLARE
    new_user_id INT;
BEGIN
    IF EXISTS (SELECT 1 FROM Auth WHERE email = user_email) THEN
        RAISE EXCEPTION 'Email already registered.';
    END IF;

    IF EXISTS (SELECT 1 FROM Users WHERE student_id = user_student_id) THEN
        RAISE EXCEPTION 'Student ID already registered.';
    END IF;

    INSERT INTO Users (name, student_id, contact_number)
    VALUES (user_name, user_student_id, user_contact)
    RETURNING user_id INTO new_user_id;

    INSERT INTO Auth (user_id, email, password, last_login)
    VALUES (new_user_id, user_email, crypt(user_password, gen_salt('bf')), NOW());
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- LOOKUP FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_locations()
RETURNS TABLE (
    location_id INT,
    name VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.location_id,
        l.name
    FROM
        Location l;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_tags()
RETURNS TABLE (
    tag_id INT,
    name VARCHAR(30)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.tag_id,
        t.name
    FROM
        Tags t;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- NOTIFICATION FUNCTIONS
-- ============================================

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


-- ============================================
-- CLAIM & RETURN REQUEST FUNCTIONS
-- ============================================

-- Get claims for my FOUND items
CREATE OR REPLACE FUNCTION get_user_claim_requests(p_user_id INT)
RETURNS TABLE (
    claim_id INT,
    requester_id INT,
    requester_name VARCHAR(100),
    found_report_id INT,
    item_title VARCHAR(50),
    message TEXT,
    claimed_at TIMESTAMP,
    status request_status_enum,
    image_urls TEXT[]
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
        cr.status,
        ARRAY(SELECT cri.image_url FROM Claim_Request_Images cri WHERE cri.claim_id = cr.claim_id) as image_urls
    FROM Claim_Request cr
    JOIN Found_Report fr ON cr.found_report_id = fr.found_id
    JOIN Users u ON cr.requester_id = u.user_id
    WHERE fr.creator_id = p_user_id
    ORDER BY cr.claimed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get returns for my LOST items
CREATE OR REPLACE FUNCTION get_user_return_requests(p_user_id INT)
RETURNS TABLE (
    return_id INT,
    requester_id INT,
    requester_name VARCHAR(100),
    lost_report_id INT,
    item_title VARCHAR(50),
    message TEXT,
    returned_at TIMESTAMP,
    status request_status_enum,
    image_urls TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rr.return_id,
        rr.requester_id,
        u.name as requester_name,
        rr.lost_report_id,
        lr.title as item_title,
        rr.message,
        rr.returned_at,
        rr.status,
        ARRAY(SELECT rri.image_url FROM Return_Request_Images rri WHERE rri.return_id = rr.return_id) as image_urls
    FROM Return_Request rr
    JOIN Lost_Report lr ON rr.lost_report_id = lr.lost_id
    JOIN Users u ON rr.requester_id = u.user_id
    WHERE lr.creator_id = p_user_id
    ORDER BY rr.returned_at DESC;
END;
$$ LANGUAGE plpgsql;
