-- Drop existing tables if they exist
DROP TABLE IF EXISTS winners;

-- Create winners table
CREATE TABLE winners (
  `id` binary(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
  `user_id` binary(16) NOT NULL,
  `tournament_id` int,
  `season_number` int,
  `win_date` date NOT NULL,
  `picture_url` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `winners_ibfk_1` (`user_id`),
  KEY `winners_ibfk_2` (`tournament_id`),
  CONSTRAINT `winners_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `winners_ibfk_2` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
