const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Get all tournaments
router.get('/', async (req, res) => {
    try {
        const [tournaments] = await pool.execute(
            'SELECT * FROM tournaments ORDER BY start_date DESC'
        );
        res.json(tournaments);
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        res.status(500).json({ message: 'Error fetching tournaments' });
    }
});

// Get tournament by ID
router.get('/:id', async (req, res) => {
    try {
        const [tournaments] = await pool.execute(
            'SELECT * FROM tournaments WHERE id = ?',
            [req.params.id]
        );

        if (tournaments.length === 0) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        res.json(tournaments[0]);
    } catch (error) {
        console.error('Error fetching tournament:', error);
        res.status(500).json({ message: 'Error fetching tournament' });
    }
});

// Create tournament (admin only)
router.post('/', auth, async (req, res) => {
    try {
        const { 
            name, description, location, maps_link,
            start_date, end_date, max_participants, 
            registration_deadline, fee 
        } = req.body;

        // Format dates for MySQL
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toISOString().slice(0, 19).replace('T', ' ');
        };

        const [result] = await pool.execute(
            `INSERT INTO tournaments (
                name, description, location, maps_link,
                start_date, end_date, max_participants, 
                registration_deadline, fee
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, 
                description, 
                location, 
                maps_link,
                formatDate(start_date), 
                formatDate(end_date), 
                max_participants,
                formatDate(registration_deadline), 
                fee
            ]
        );

        const [newTournament] = await pool.execute(
            'SELECT * FROM tournaments WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newTournament[0]);
    } catch (error) {
        console.error('Error creating tournament:', error);
        res.status(500).json({ 
            message: 'Error creating tournament',
            error: error.message
        });
    }
});

// Update tournament (admin only)
router.patch('/:id', auth, async (req, res) => {
    try {
        const allowedUpdates = [
            'name', 'description', 'location', 'maps_link',
            'start_date', 'end_date', 'max_participants',
            'registration_deadline', 'fee'
        ];
        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid updates provided' });
        }

        const setClause = Object.keys(updates)
            .map(key => `${key} = ?`)
            .join(', ');
        const values = [...Object.values(updates), req.params.id];

        await pool.execute(
            `UPDATE tournaments SET ${setClause} WHERE id = ?`,
            values
        );

        const [updatedTournament] = await pool.execute(
            'SELECT * FROM tournaments WHERE id = ?',
            [req.params.id]
        );

        if (updatedTournament.length === 0) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        res.json(updatedTournament[0]);
    } catch (error) {
        console.error('Error updating tournament:', error);
        res.status(500).json({ message: 'Error updating tournament' });
    }
});

// Delete tournament (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const [result] = await pool.execute(
            'DELETE FROM tournaments WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        res.status(200).json({ message: 'Tournament deleted successfully' });
    } catch (error) {
        console.error('Error deleting tournament:', error);
        res.status(500).json({ message: 'Error deleting tournament' });
    }
});

// Register for tournament
router.post('/:id/register', auth, async (req, res) => {
    try {
        const { team_name } = req.body;
        const tournament_id = req.params.id;
        const user_id = req.user.id;

        // Check if tournament exists and is open for registration
        const [tournaments] = await pool.execute(
            'SELECT * FROM tournaments WHERE id = ? AND registration_deadline > NOW() AND current_participants < max_participants',
            [tournament_id]
        );

        if (tournaments.length === 0) {
            return res.status(400).json({ message: 'Tournament not found or registration closed' });
        }

        // Check if user is already registered
        const [existingRegistrations] = await pool.execute(
            'SELECT * FROM tournament_registrations WHERE tournament_id = ? AND user_id = ?',
            [tournament_id, user_id]
        );

        if (existingRegistrations.length > 0) {
            return res.status(400).json({ message: 'Already registered for this tournament' });
        }

        // Register user
        await pool.execute(
            'INSERT INTO tournament_registrations (tournament_id, user_id, team_name, status) VALUES (?, ?, ?, "approved")',
            [tournament_id, user_id, team_name]
        );

        // Update participant count
        await pool.execute(
            'UPDATE tournaments SET current_participants = current_participants + 1 WHERE id = ?',
            [tournament_id]
        );

        res.status(201).json({ message: 'Successfully registered for tournament' });
    } catch (error) {
        console.error('Error registering for tournament:', error);
        res.status(500).json({ message: 'Error registering for tournament' });
    }
});

// Drop out from tournament
router.delete('/:id/register', auth, async (req, res) => {
    try {
        const tournament_id = req.params.id;
        const user_id = req.user.id;

        // Check if user is registered
        const [existingRegistrations] = await pool.execute(
            'SELECT * FROM tournament_registrations WHERE tournament_id = ? AND user_id = ?',
            [tournament_id, user_id]
        );

        if (existingRegistrations.length === 0) {
            return res.status(404).json({ message: 'Not registered for this tournament' });
        }

        // Remove registration
        await pool.execute(
            'DELETE FROM tournament_registrations WHERE tournament_id = ? AND user_id = ?',
            [tournament_id, user_id]
        );

        // Update participant count
        await pool.execute(
            'UPDATE tournaments SET current_participants = current_participants - 1 WHERE id = ?',
            [tournament_id]
        );

        res.status(200).json({ message: 'Successfully dropped out from tournament' });
    } catch (error) {
        console.error('Error dropping out from tournament:', error);
        res.status(500).json({ message: 'Error dropping out from tournament' });
    }
});

// Get tournament participants
router.get('/:id/participants', auth, async (req, res) => {
    try {
        console.log('Getting participants for tournament:', req.params.id);
        
        // First check if tournament exists
        const [tournaments] = await pool.execute(
            'SELECT * FROM tournaments WHERE id = ?',
            [req.params.id]
        );

        if (tournaments.length === 0) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Get participants with user info
        const [participants] = await pool.execute(
            `SELECT tr.id, tr.team_name, tr.registration_date, u.username 
             FROM tournament_registrations tr
             LEFT JOIN users u ON tr.user_id = u.id
             WHERE tr.tournament_id = ? AND tr.status = 'approved'`,
            [req.params.id]
        );

        console.log('Found participants:', participants);
        res.json(participants);
    } catch (error) {
        console.error('Error in GET /:id/participants:', error);
        res.status(500).json({ 
            message: 'Error fetching participants', 
            error: error.message,
            stack: error.stack 
        });
    }
});

// Remove participant from tournament
router.delete('/:tournamentId/participants/:participantId', auth, async (req, res) => {
    try {
        console.log('Removing participant:', req.params.participantId, 'from tournament:', req.params.tournamentId);
        
        // First check if the tournament exists
        const [tournaments] = await pool.execute(
            'SELECT * FROM tournaments WHERE id = ?',
            [req.params.tournamentId]
        );

        if (tournaments.length === 0) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Check if the participant exists and is part of this tournament
        const [participants] = await pool.execute(
            'SELECT * FROM tournament_registrations WHERE id = ? AND tournament_id = ?',
            [req.params.participantId, req.params.tournamentId]
        );

        if (participants.length === 0) {
            return res.status(404).json({ message: 'Participant not found in this tournament' });
        }

        // Remove the participant
        await pool.execute(
            'DELETE FROM tournament_registrations WHERE id = ? AND tournament_id = ?',
            [req.params.participantId, req.params.tournamentId]
        );

        // Update current_participants count
        await pool.execute(
            'UPDATE tournaments SET current_participants = (SELECT COUNT(*) FROM tournament_registrations WHERE tournament_id = ? AND status = "approved") WHERE id = ?',
            [req.params.tournamentId, req.params.tournamentId]
        );

        console.log('Successfully removed participant');
        res.status(200).json({ message: 'Participant removed successfully' });
    } catch (error) {
        console.error('Error in DELETE /:tournamentId/participants/:participantId:', error);
        res.status(500).json({ 
            message: 'Error removing participant', 
            error: error.message,
            stack: error.stack 
        });
    }
});

// Get user's registered tournaments
router.get('/user/registered', auth, async (req, res) => {
    try {
        const [registeredTournaments] = await pool.execute(
            `SELECT t.*, tr.team_name, tr.registration_date, tr.status
             FROM tournaments t
             INNER JOIN tournament_registrations tr ON t.id = tr.tournament_id
             WHERE tr.user_id = ?
             ORDER BY t.start_date DESC`,
            [req.user.id]
        );
        res.json(registeredTournaments);
    } catch (error) {
        console.error('Error fetching user tournaments:', error);
        res.status(500).json({ message: 'Error fetching user tournaments' });
    }
});

module.exports = router;
