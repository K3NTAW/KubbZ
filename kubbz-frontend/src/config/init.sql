-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS kubbz_db;
USE kubbz_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('TODO', 'IN_PROGRESS', 'DONE') DEFAULT 'TODO',
    priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
    project_id INT NOT NULL,
    assigned_to INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    date DATETIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    entry_fee DECIMAL(10, 2) NOT NULL,
    max_participants INT NOT NULL,
    current_participants INT DEFAULT 0,
    registration_deadline DATETIME NOT NULL,
    prize_pool DECIMAL(10, 2) NOT NULL,
    status ENUM('upcoming', 'in_progress', 'completed', 'cancelled') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create tournament_participants table
CREATE TABLE IF NOT EXISTS tournament_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id VARCHAR(36) NOT NULL,
    participant_name VARCHAR(255) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status ENUM('pending', 'completed', 'refunded') DEFAULT 'pending',
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

-- Insert mock data for tournaments
INSERT INTO tournaments (
    id, name, description, date, location, entry_fee,
    max_participants, current_participants, registration_deadline,
    prize_pool, status
) VALUES
(
    'tour-001',
    'Spring Championship 2024',
    'Annual spring tournament featuring top players from around the region',
    '2024-04-15 10:00:00',
    'Sports Complex Arena',
    50.00,
    32,
    12,
    '2024-04-10 23:59:59',
    5000.00,
    'upcoming'
),
(
    'tour-002',
    'Summer Series Finals',
    'The culmination of our summer tournament series',
    '2024-06-20 14:00:00',
    'Central Stadium',
    75.00,
    16,
    8,
    '2024-06-15 23:59:59',
    7500.00,
    'upcoming'
),
(
    'tour-003',
    'Winter Classic 2024',
    'Experience the thrill of winter competition',
    '2024-12-28 12:00:00',
    'Winter Sports Center',
    60.00,
    24,
    5,
    '2024-12-24 23:59:59',
    6000.00,
    'upcoming'
);
