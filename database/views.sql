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