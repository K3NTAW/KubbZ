const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

// Get all images
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                BIN_TO_UUID(gi.id) as id,
                gi.url,
                gi.caption,
                BIN_TO_UUID(gi.uploaded_by) as uploaded_by,
                gi.created_at,
                gi.file_name,
                gi.mime_type,
                u.username as uploader_name
            FROM gallery_images gi
            JOIN users u ON gi.uploaded_by = u.id
            ORDER BY gi.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Full error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch gallery images',
            details: error.message,
            code: error.code
        });
    }
});

// Get a single image
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                BIN_TO_UUID(gi.id) as id,
                gi.url,
                gi.caption,
                BIN_TO_UUID(gi.uploaded_by) as uploaded_by,
                gi.created_at,
                gi.file_name,
                gi.mime_type,
                u.username as uploader_name
            FROM gallery_images gi
            JOIN users u ON gi.uploaded_by = u.id
            WHERE gi.id = UUID_TO_BIN(?)
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Full error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch image',
            details: error.message,
            code: error.code
        });
    }
});

// Upload a new image
router.post('/upload', auth, async (req, res) => {
    const { url, caption, fileName, fileSize, mimeType } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        await pool.query('START TRANSACTION');

        const [result] = await pool.query(`
            INSERT INTO gallery_images (url, caption, uploaded_by, file_name, file_size, mime_type)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [url, caption, req.user.id, fileName, fileSize, mimeType]);

        const [newImage] = await pool.query(`
            SELECT 
                BIN_TO_UUID(gi.id) as id,
                gi.url,
                gi.caption,
                BIN_TO_UUID(gi.uploaded_by) as uploaded_by,
                gi.created_at,
                gi.file_name,
                gi.mime_type,
                u.username as uploader_name
            FROM gallery_images gi
            JOIN users u ON gi.uploaded_by = u.id
            WHERE gi.id = LAST_INSERT_ID()
        `);

        await pool.query('COMMIT');
        res.status(201).json(newImage[0]);
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Full error:', error);
        res.status(500).json({ 
            error: 'Failed to create image',
            details: error.message,
            code: error.code
        });
    }
});

// Delete an image
router.delete('/:id', auth, async (req, res) => {
    try {
        await pool.query('START TRANSACTION');

        const [image] = await pool.query(
            'SELECT * FROM gallery_images WHERE id = UUID_TO_BIN(?)',
            [req.params.id]
        );

        if (image.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ error: 'Image not found' });
        }

        // Check if user owns the image or is admin
        if (!Buffer.compare(image[0].uploaded_by, req.user.id) !== 0 && !req.user.is_admin) {
            await pool.query('ROLLBACK');
            return res.status(403).json({ error: 'Not authorized to delete this image' });
        }

        await pool.query(
            'DELETE FROM gallery_images WHERE id = UUID_TO_BIN(?)',
            [req.params.id]
        );

        await pool.query('COMMIT');
        res.status(204).send();
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Full error:', error);
        res.status(500).json({ 
            error: 'Failed to delete image',
            details: error.message,
            code: error.code
        });
    }
});

module.exports = router;
