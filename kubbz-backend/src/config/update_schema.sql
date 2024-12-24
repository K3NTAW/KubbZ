-- Add points field to users table
ALTER TABLE users
ADD COLUMN points INT DEFAULT 0;
