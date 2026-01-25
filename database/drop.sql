-- DROP TABLES (reverse dependency order)
DROP TABLE IF EXISTS Found_Report_Tags;
DROP TABLE IF EXISTS Lost_Report_Tags;

DROP TABLE IF EXISTS Return_Request_Images;
DROP TABLE IF EXISTS Claim_Request_Images;
DROP TABLE IF EXISTS Found_Report_Images;
DROP TABLE IF EXISTS Lost_Report_Images;

DROP TABLE IF EXISTS Return_Request;
DROP TABLE IF EXISTS Claim_Request;

DROP TABLE IF EXISTS Found_Report;
DROP TABLE IF EXISTS Lost_Report;

DROP TABLE IF EXISTS Location;
DROP TABLE IF EXISTS Notification;
DROP TABLE IF EXISTS Auth;
DROP TABLE IF EXISTS Users;

DROP TABLE IF EXISTS Tags;

-- DROP ENUM TYPES
DROP TYPE IF EXISTS request_status_enum;
DROP TYPE IF EXISTS report_status_enum;
DROP TYPE IF EXISTS gender_enum;
