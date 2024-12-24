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

        // Create new user
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password_hash, points, role) VALUES (?, ?, ?, ?, ?)',
            [username, email, password_hash, 0, 'user']
        );

        // Generate token
        const token = jwt.sign(
            { userId: result.insertId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: result.insertId,
                username,
                email,
                points: 0,
                role: 'user'
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
            'SELECT id, username, email, password_hash, points, role FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

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
                points: user.points,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, username, email, points, role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: users[0].id,
            username: users[0].username,
            email: users[0].email,
            points: users[0].points,
            role: users[0].role
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
    try {
        const { username, email, currentPassword, newPassword, bio, phone, avatar } = req.body;
        console.log('Received profile update request:', { 
            username, 
            email, 
            hasCurrentPassword: !!currentPassword,
            hasNewPassword: !!newPassword,
            hasBio: !!bio,
            hasPhone: !!phone,
            hasAvatar: !!avatar,
            avatarLength: avatar ? avatar.length : 0
        });
        
        const updates = [];
        const values = [];

        if (username) {
            // Check if username is taken
            const [existingUsers] = await pool.execute(
                'SELECT * FROM users WHERE username = ? AND id != ?',
                [username, req.user.id]
            );
            if (existingUsers.length > 0) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            updates.push('username = ?');
            values.push(username);
        }

        if (email) {
            // Check if email is taken
            const [existingUsers] = await pool.execute(
                'SELECT * FROM users WHERE email = ? AND id != ?',
                [email, req.user.id]
            );
            if (existingUsers.length > 0) {
                return res.status(400).json({ message: 'Email already taken' });
            }
            updates.push('email = ?');
            values.push(email);
        }

        if (bio !== undefined) {
            updates.push('bio = ?');
            values.push(bio);
        }

        if (phone !== undefined) {
            updates.push('phone = ?');
            values.push(phone);
        }

        if (avatar !== undefined) {
            updates.push('avatar = ?');
            values.push(avatar);
        }

        if (currentPassword && newPassword) {
            // Verify current password
            const [users] = await pool.execute(
                'SELECT password_hash FROM users WHERE id = ?',
                [req.user.id]
            );
            const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(newPassword, salt);
            updates.push('password_hash = ?');
            values.push(password_hash);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No updates provided' });
        }

        values.push(req.user.id);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        console.log('Executing query:', query);
        console.log('With values:', values.map(v => v === avatar ? 'AVATAR_DATA' : v));

        try {
            await pool.execute(query, values);
        } catch (dbError) {
            console.error('Database error:', dbError);
            return res.status(500).json({ message: 'Database error', error: dbError.message });
        }

        // Get updated user data
        const [updatedUser] = await pool.execute(
            'SELECT id, username, email, points, bio, phone, avatar, role FROM users WHERE id = ?',
            [req.user.id]
        );

        res.json({
            id: updatedUser[0].id,
            username: updatedUser[0].username,
            email: updatedUser[0].email,
            points: updatedUser[0].points,
            bio: updatedUser[0].bio,
            phone: updatedUser[0].phone,
            avatar: updatedUser[0].avatar,
            role: updatedUser[0].role
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Delete user account
router.delete('/profile', auth, async (req, res) => {
    try {
        await pool.execute(
            'DELETE FROM users WHERE id = ?',
            [req.user.id]
        );

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Error deleting account', error: error.message });
    }
});

module.exports = router;
