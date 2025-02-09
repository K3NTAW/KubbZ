-- Create gallery table
CREATE TABLE IF NOT EXISTS gallery_images (
    id VARCHAR(255) NOT NULL DEFAULT (UUID()),
    url TEXT NOT NULL,
    caption TEXT,
    uploaded_by VARCHAR(255) NOT NULL,
    created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    file_name TEXT NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
