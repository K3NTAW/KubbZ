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
            'SELECT BIN_TO_UUID(id) as id, username, email, is_admin FROM users WHERE id = UUID_TO_BIN(?)',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        const user = users[0];
        
        // Only check admin privileges for admin-specific routes
        const adminRoutes = [
            '/api/tournaments/create',
            '/api/tournaments/update',
            '/api/tournaments/delete',
            '/api/admin'
        ];
        
        if (adminRoutes.some(route => req.path.includes(route)) && !user.is_admin) {
            return res.status(403).json({ message: 'Admin privileges required' });
        }

        req.user = {
            ...user,
            is_admin: user.is_admin === 1
        };
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
};

module.exports = auth;
