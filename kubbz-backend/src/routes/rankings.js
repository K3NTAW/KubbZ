const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Get overall rankings
router.get('/', async (req, res) => {
    try {
        const [users] = await pool.execute(`
            SELECT 
                id AS userId,
                username AS userName,
                COALESCE(points, 0) AS points,
                COALESCE(avatar, '') AS avatar,
                (@row_number := @row_number + 1) AS ranking
            FROM users,
            (SELECT @row_number := 0) AS r
            ORDER BY COALESCE(points, 0) DESC
        `);

        res.json(users);
    } catch (error) {
        console.error('Error fetching rankings:', error);
        res.status(500).json({ message: 'Error fetching rankings', error: error.message });
    }
});

// Get season rankings
router.get('/season', async (req, res) => {
    try {
        const [users] = await pool.execute(`
            SELECT 
                id AS userId,
                username AS userName,
                COALESCE(season_points, 0) AS points,
                COALESCE(avatar, '') AS avatar,
                (@row_number := @row_number + 1) AS ranking
            FROM users,
            (SELECT @row_number := 0) AS r
            ORDER BY COALESCE(season_points, 0) DESC
        `);

        res.json(users);
    } catch (error) {
        console.error('Error fetching season rankings:', error);
        res.status(500).json({ message: 'Error fetching season rankings', error: error.message });
    }
});

module.exports = router;
