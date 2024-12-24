-- Add points and season_points columns if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS season_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avatar VARCHAR(255) DEFAULT NULL;
