const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const [existingUsers] = await pool.execute(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            const existingUser = existingUsers[0];
            if (existingUser.email === email) {
                return res.status(400).json({ 
                    message: 'Registration failed',
                    error: 'This email is already registered. Please use a different email or try logging in.' 
                });
            } else {
                return res.status(400).json({ 
                    message: 'Registration failed',
                    error: 'This username is already taken. Please choose a different username.' 
                });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create new user with UUID
        const [result] = await pool.execute(
            'INSERT INTO users (id, username, email, password_hash, points, is_admin) VALUES (UUID_TO_BIN(UUID()), ?, ?, ?, 0, 0)',
            [username, email, password_hash]
        );

        // Get the inserted user
        const [newUser] = await pool.execute(
            'SELECT BIN_TO_UUID(id) as id, username, email, points, is_admin, avatar FROM users WHERE email = ?',
            [email]
        );

        // Generate token
        const token = jwt.sign(
            { userId: newUser[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: newUser[0].id,
                username,
                email,
                points: 0,
                is_admin: newUser[0].is_admin === 1 || newUser[0].is_admin === true,
                avatar: newUser[0].avatar
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const [users] = await pool.execute(
            'SELECT BIN_TO_UUID(id) as id, username, email, password_hash, points, is_admin, avatar FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        console.log('Raw database values:', {
            username: user.username,
            is_admin: user.is_admin,
            is_admin_type: typeof user.is_admin,
            raw_value: user.is_admin
        });

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                points: user.points || 0,
                is_admin: Boolean(user.is_admin),
                avatar: user.avatar
            }
        });
        console.log('Response sent:', {
            username: user.username,
            is_admin: Boolean(user.is_admin),
            raw_value: user.is_admin
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Update profile
router.patch('/profile', auth, async (req, res) => {
    try {
        const { username, email, currentPassword, newPassword, bio, phone, avatar } = req.body;
        
        // Get current user data
        const [users] = await pool.execute(
            'SELECT BIN_TO_UUID(id) as id, password_hash FROM users WHERE id = UUID_TO_BIN(?)',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // If changing password, verify current password
        if (newPassword) {
            const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }
        }

        // Build update query dynamically
        let updateFields = [];
        let queryParams = [];
        
        if (username) {
            updateFields.push('username = ?');
            queryParams.push(username);
        }
        if (email) {
            updateFields.push('email = ?');
            queryParams.push(email);
        }
        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(newPassword, salt);
            updateFields.push('password_hash = ?');
            queryParams.push(password_hash);
        }
        if (bio !== undefined) {
            updateFields.push('bio = ?');
            queryParams.push(bio);
        }
        if (phone !== undefined) {
            updateFields.push('phone = ?');
            queryParams.push(phone);
        }
        if (avatar !== undefined) {
            // Validate base64 image format
            if (!avatar.startsWith('data:image/')) {
                return res.status(400).json({ message: 'Invalid image format' });
            }
            updateFields.push('avatar = ?');
            queryParams.push(avatar);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Add user ID to query params
        queryParams.push(req.user.id);

        // Update user
        await pool.execute(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = UUID_TO_BIN(?)`,
            queryParams
        );

        // Get updated user data
        const [updatedUser] = await pool.execute(
            'SELECT BIN_TO_UUID(id) as id, username, email, points, is_admin, avatar FROM users WHERE id = UUID_TO_BIN(?)',
            [req.user.id]
        );

        res.json(updatedUser[0]);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Delete account
router.delete('/profile', auth, async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.user.id;

        // Get user from database
        const [users] = await pool.execute(
            'SELECT BIN_TO_UUID(id) as id, password_hash FROM users WHERE id = UUID_TO_BIN(?)',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Delete user's tournament registrations
        await pool.execute(
            'DELETE FROM tournament_registrations WHERE user_id = UUID_TO_BIN(?)',
            [userId]
        );

        // Delete the user
        await pool.execute(
            'DELETE FROM users WHERE id = UUID_TO_BIN(?)',
            [userId]
        );

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Error deleting account' });
    }
});

module.exports = router;