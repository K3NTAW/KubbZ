-- First, add UUID function if not exists
DELIMITER $$
CREATE FUNCTION IF NOT EXISTS UUID_TO_BIN(_uuid BINARY(36))
    RETURNS BINARY(16)
    LANGUAGE SQL  DETERMINISTIC  CONTAINS SQL
    RETURN UNHEX(REPLACE(_uuid,'-',''));
$$

CREATE FUNCTION IF NOT EXISTS BIN_TO_UUID(_bin BINARY(16))
    RETURNS BINARY(36)
    LANGUAGE SQL  DETERMINISTIC  CONTAINS SQL
    RETURN INSERT(INSERT(INSERT(INSERT(HEX(_bin),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-');
$$
DELIMITER ;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Modify users table
ALTER TABLE users 
ADD COLUMN new_id BINARY(16) AFTER id;

UPDATE users 
SET new_id = UUID_TO_BIN(UUID());

-- Update foreign keys in tournament_registrations
ALTER TABLE tournament_registrations 
ADD COLUMN new_user_id BINARY(16) AFTER user_id;

UPDATE tournament_registrations tr 
JOIN users u ON tr.user_id = u.id 
SET tr.new_user_id = u.new_id;

-- Update foreign keys in tasks
ALTER TABLE tasks 
ADD COLUMN new_assigned_to BINARY(16) AFTER assigned_to;

UPDATE tasks t 
JOIN users u ON t.assigned_to = u.id 
SET t.new_assigned_to = u.new_id;

-- Update foreign keys in projects
ALTER TABLE projects 
ADD COLUMN new_owner_id BINARY(16) AFTER owner_id;

UPDATE projects p 
JOIN users u ON p.owner_id = u.id 
SET p.new_owner_id = u.new_id;

-- Drop old columns and constraints
ALTER TABLE tournament_registrations 
DROP FOREIGN KEY tournament_registrations_ibfk_2,
DROP COLUMN user_id,
CHANGE new_user_id user_id BINARY(16) NOT NULL;

ALTER TABLE tasks 
DROP FOREIGN KEY tasks_ibfk_2,
DROP COLUMN assigned_to,
CHANGE new_assigned_to assigned_to BINARY(16);

ALTER TABLE projects 
DROP FOREIGN KEY projects_ibfk_1,
DROP COLUMN owner_id,
CHANGE new_owner_id owner_id BINARY(16) NOT NULL;

-- Update users table primary key
ALTER TABLE users 
DROP PRIMARY KEY,
DROP COLUMN id,
CHANGE new_id id BINARY(16) NOT NULL,
ADD PRIMARY KEY (id);

-- Recreate foreign key constraints
ALTER TABLE tournament_registrations 
ADD CONSTRAINT tournament_registrations_ibfk_2 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE tasks 
ADD CONSTRAINT tasks_ibfk_2 
FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE projects 
ADD CONSTRAINT projects_ibfk_1 
FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
