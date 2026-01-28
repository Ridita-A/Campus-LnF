-- Alter Claim_Request table to support both lost and found item claims
-- This migration makes found_report_id nullable and adds lost_report_id

-- Step 1: Make found_report_id nullable
ALTER TABLE Claim_Request 
ALTER COLUMN found_report_id DROP NOT NULL;

-- Step 2: Add lost_report_id column
ALTER TABLE Claim_Request 
ADD COLUMN lost_report_id INT;

-- Step 3: Add foreign key constraint for lost_report_id
ALTER TABLE Claim_Request 
ADD CONSTRAINT fk_claim_request_lost_report 
FOREIGN KEY (lost_report_id) REFERENCES Lost_Report(lost_id) ON DELETE CASCADE;

-- Step 4: Add constraint to ensure either found_report_id or lost_report_id is set (not both, not neither)
ALTER TABLE Claim_Request 
ADD CONSTRAINT check_claim_type 
CHECK (
    (found_report_id IS NOT NULL AND lost_report_id IS NULL) OR
    (found_report_id IS NULL AND lost_report_id IS NOT NULL)
);
