-- View for fetching all lost reports with user and location details
CREATE OR REPLACE VIEW vw_lost_reports AS
SELECT
    lr.lost_id,
    lr.creator_id,
    lr.title,
    lr.description,
    lr.lost_at,
    lr.status,
    l.name AS location_name,
    u.name AS user_name,
    u.student_id AS user_student_id,
    u.contact_number AS user_contact_number,
    ARRAY(SELECT t.name FROM Tags t JOIN Lost_Report_Tags lrt ON t.tag_id = lrt.category_id WHERE lrt.lost_id = lr.lost_id)::text[] AS tags,
    ARRAY(SELECT lri.image_url FROM Lost_Report_Images lri WHERE lri.lost_id = lr.lost_id) AS image_urls
FROM
    Lost_Report lr
JOIN
    Users u ON lr.creator_id = u.user_id
JOIN
    Location l ON lr.last_location_id = l.location_id;

-- View for fetching all found reports with user and location details
CREATE OR REPLACE VIEW vw_found_reports AS
SELECT
    fr.found_id,
    fr.creator_id,
    fr.title,
    fr.description,
    fr.found_at,
    fr.status,
    l.name AS location_name,
    u.name AS user_name,
    u.student_id AS user_student_id,
    u.contact_number AS user_contact_number,
    ARRAY(SELECT t.name FROM Tags t JOIN Found_Report_Tags frt ON t.tag_id = frt.category_id WHERE frt.found_id = fr.found_id)::text[] AS tags,
    ARRAY(SELECT fri.image_url FROM Found_Report_Images fri WHERE fri.found_id = fr.found_id) AS image_urls
FROM
    Found_Report fr
JOIN
    Users u ON fr.creator_id = u.user_id
JOIN
    Location l ON fr.found_location_id = l.location_id;