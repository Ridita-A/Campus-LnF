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
$$
