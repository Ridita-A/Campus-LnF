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
