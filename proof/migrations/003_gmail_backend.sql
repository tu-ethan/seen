-- Apply only to a database created by the earlier Outlook-backed demo.
-- The application performs these renames automatically on startup.
ALTER TABLE outlook_connections RENAME TO gmail_connections;
ALTER TABLE gmail_connections RENAME COLUMN microsoft_user_id TO google_user_id;
ALTER TABLE gmail_connections RENAME COLUMN microsoft_email TO gmail_email;
ALTER TABLE gmail_connections RENAME COLUMN microsoft_display_name TO gmail_display_name;
-- Microsoft tokens cannot authorize Gmail. Force a one-time reconnect through Google.
DELETE FROM gmail_connections;
ALTER TABLE processed_email_sources RENAME COLUMN microsoft_message_id TO gmail_message_id;
