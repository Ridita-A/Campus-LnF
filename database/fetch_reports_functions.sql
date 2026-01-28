-- Function to fetch all found reports with user and location details
CREATE OR REPLACE FUNCTION get_found_reports()
RETURNS TABLE (
    found_id INT,
    creator_id INT,
    creator_name VARCHAR(100),
    found_location_id INT,
    location_name VARCHAR(100),
    title VARCHAR(50),
    description TEXT,
    found_at TIMESTAMP,
    status report_status_enum,
    tags TEXT[],
    image_urls TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        fr.found_id,
        fr.creator_id,
        u.name AS creator_name,
        fr.found_location_id,
        l.name AS location_name,
        fr.title,
        fr.description,
        fr.found_at,
        fr.status,
        ARRAY(SELECT t.name::TEXT FROM Tags t JOIN Found_Report_Tags frt ON t.tag_id = frt.category_id WHERE frt.found_id = fr.found_id) AS tags,
        ARRAY(SELECT fri.image_url FROM Found_Report_Images fri WHERE fri.found_id = fr.found_id) AS image_urls
    FROM
        Found_Report fr
    JOIN Users u ON fr.creator_id = u.user_id
    JOIN Location l ON fr.found_location_id = l.location_id;
END;
$$ LANGUAGE plpgsql;

-- Function to fetch all lost reports with user and location details
CREATE OR REPLACE FUNCTION get_lost_reports()
RETURNS TABLE (
    lost_id INT,
    creator_id INT,
    creator_name VARCHAR(100),
    last_location_id INT,
    location_name VARCHAR(100),
    title VARCHAR(50),
    description TEXT,
    lost_at TIMESTAMP,
    status report_status_enum,
    tags TEXT[],
    image_urls TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lr.lost_id,
        lr.creator_id,
        u.name AS creator_name,
        lr.last_location_id,
        l.name AS location_name,
        lr.title,
        lr.description,
        lr.lost_at,
        lr.status,
        ARRAY(SELECT t.name::TEXT FROM Tags t JOIN Lost_Report_Tags lrt ON t.tag_id = lrt.category_id WHERE lrt.lost_id = lr.lost_id) AS tags,
        ARRAY(SELECT lri.image_url FROM Lost_Report_Images lri WHERE lri.lost_id = lr.lost_id) AS image_urls
    FROM
        Lost_Report lr
    JOIN Users u ON lr.creator_id = u.user_id
    JOIN Location l ON lr.last_location_id = l.location_id;
END;
$$ LANGUAGE plpgsql;
