-- Add 'archived' status to the existing report_status_enum
-- This allows items to be archived and removed from the main feed

-- Step 1: Add 'archived' to the enum type
ALTER TYPE report_status_enum ADD VALUE IF NOT EXISTS 'archived';

-- Note: The Lost_Report and Found_Report tables already use report_status_enum
-- No schema changes needed, just need to update the enum values
