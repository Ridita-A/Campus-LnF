-- Reusable timestamp trigger for Notification inserts.
-- Requires Notification.created_at to exist in the schema.
CREATE OR REPLACE FUNCTION set_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_at IS NULL THEN
        NEW.created_at = NOW() AT TIME ZONE 'UTC';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_timestamps_notification ON Notification;

CREATE TRIGGER trg_set_timestamps_notification
BEFORE INSERT ON Notification
FOR EACH ROW
EXECUTE FUNCTION set_timestamps();
