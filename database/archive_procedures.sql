-- Procedures to archive lost and found items

-- Archive a lost report
CREATE OR REPLACE PROCEDURE archive_lost_report(p_lost_id INT)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Lost_Report
    SET status = 'archived'
    WHERE lost_id = p_lost_id;
END;
$$;

-- Archive a found report
CREATE OR REPLACE PROCEDURE archive_found_report(p_found_id INT)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Found_Report
    SET status = 'archived'
    WHERE found_id = p_found_id;
END;
$$;
