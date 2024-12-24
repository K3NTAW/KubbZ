const jwt = require('jsonwebtoken');
const pool = require('../db');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [users] = await pool.execute(
            'SELECT id, username, email FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = users[0];
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
};

module.exports = auth;
