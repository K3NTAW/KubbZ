import express from 'express';
import { pool } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all rankings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id as "userId",
        u.username as "userName",
        COALESCE(u.points, 0) as points,
        u.avatar
      FROM users u
      ORDER BY points DESC
    `);
    
    // Add rank to each user
    const rankings = result.rows.map((row, index) => ({
      ...row,
      rank: index + 1
    }));

    res.json(rankings);
  } catch (error) {
    console.error('Error fetching rankings:', error);
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
});

// Update user points
router.post('/:userId/points', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { points } = req.body;

  try {
    await pool.query(
      'UPDATE users SET points = COALESCE(points, 0) + $1 WHERE id = $2',
      [points, userId]
    );
    res.json({ message: 'Points updated successfully' });
  } catch (error) {
    console.error('Error updating points:', error);
    res.status(500).json({ error: 'Failed to update points' });
  }
});

export default router;
