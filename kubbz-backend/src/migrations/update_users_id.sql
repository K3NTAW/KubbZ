-- First, drop foreign key constraints from related tables
ALTER TABLE tournament_participants DROP FOREIGN KEY tournament_participants_ibfk_2;
ALTER TABLE tournament_results DROP FOREIGN KEY tournament_results_ibfk_2;

-- Modify the users table id column
ALTER TABLE users MODIFY COLUMN id VARCHAR(255);

-- Recreate the foreign key constraints
ALTER TABLE tournament_participants 
ADD CONSTRAINT tournament_participants_ibfk_2 
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE tournament_results 
ADD CONSTRAINT tournament_results_ibfk_2 
FOREIGN KEY (user_id) REFERENCES users(id);
