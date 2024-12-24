-- First, add the new is_admin column with default value 0
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0;

-- Update is_admin based on existing role values (assuming 'admin' role should be set to 1)
UPDATE users SET is_admin = 1 WHERE role = 'admin';

-- Remove the old role column
ALTER TABLE users DROP COLUMN role;
