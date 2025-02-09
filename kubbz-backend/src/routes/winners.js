const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Get all winners
router.get('/', async (req, res) => {
    try {
        const [winners] = await pool.execute(`
            SELECT 
                BIN_TO_UUID(w.id) as id,
                BIN_TO_UUID(w.user_id) as user_id,
                w.tournament_id,
                w.season_number,
                DATE_FORMAT(w.win_date, '%Y-%m-%d') as win_date,
                w.picture_url,
                u.username,
                u.avatar,
                t.name as tournament_name
            FROM winners w
            LEFT JOIN users u ON w.user_id = u.id
            LEFT JOIN tournaments t ON w.tournament_id = t.id
            ORDER BY w.win_date DESC
        `);
        res.json(winners);
    } catch (error) {
        console.error('Error fetching winners:', error);
        res.status(500).json({ message: 'Error fetching winners', error: error.message });
    }
});

// Add a winner (admin only)
router.post('/', auth, async (req, res) => {
    if (!req.user.is_admin) {
        return res.status(403).json({ message: 'Only administrators can add winners' });
    }

    const { user_id, tournament_id, season_number, win_date, picture_url } = req.body;

    try {
        const [result] = await pool.execute(`
            INSERT INTO winners (
                user_id,
                tournament_id,
                season_number,
                win_date,
                picture_url
            ) VALUES (
                UUID_TO_BIN(?),
                ?,
                ?,
                STR_TO_DATE(?, '%Y-%m-%d'),
                ?
            )
        `, [
            user_id,
            tournament_id || null,
            season_number || null,
            win_date,
            picture_url || null
        ]);

        const [winner] = await pool.execute(`
            SELECT 
                BIN_TO_UUID(w.id) as id,
                BIN_TO_UUID(w.user_id) as user_id,
                w.tournament_id,
                w.season_number,
                DATE_FORMAT(w.win_date, '%Y-%m-%d') as win_date,
                w.picture_url,
                u.username,
                u.avatar,
                t.name as tournament_name
            FROM winners w
            LEFT JOIN users u ON w.user_id = u.id
            LEFT JOIN tournaments t ON w.tournament_id = t.id
            WHERE w.id = LAST_INSERT_ID()
        `);

        res.status(201).json(winner[0]);
    } catch (error) {
        console.error('Error adding winner:', error);
        res.status(500).json({ message: 'Error adding winner', error: error.message });
    }
});

// Delete a winner (admin only)
router.delete('/:id', auth, async (req, res) => {
    if (!req.user.is_admin) {
        return res.status(403).json({ message: 'Only administrators can delete winners' });
    }

    try {
        await pool.execute('DELETE FROM winners WHERE id = UUID_TO_BIN(?)', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting winner:', error);
        res.status(500).json({ message: 'Error deleting winner', error: error.message });
    }
});

module.exports = router;
