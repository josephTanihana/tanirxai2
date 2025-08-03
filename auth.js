const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock user database (in production, use a real database)
const users = [];

// Register user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                error: 'Missing required fields: username, email, password'
            });
        }

        // Check if user already exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists with this email'
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = {
            id: users.length + 1,
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            projects: [],
            preferences: {
                defaultLanguage: 'javascript',
                theme: 'light',
                notifications: true
            }
        };

        users.push(user);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'ai-tani-secret',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                preferences: user.preferences
            },
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Failed to register user',
            message: error.message
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Missing required fields: email, password'
            });
        }

        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'ai-tani-secret',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                preferences: user.preferences
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Failed to login',
            message: error.message
        });
    }
});

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
    try {
        const user = users.find(u => u.id === req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                preferences: user.preferences,
                projects: user.projects
            }
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            error: 'Failed to get profile',
            message: error.message
        });
    }
});

// Update user preferences
router.put('/preferences', authenticateToken, (req, res) => {
    try {
        const { defaultLanguage, theme, notifications } = req.body;
        const user = users.find(u => u.id === req.user.userId);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Update preferences
        if (defaultLanguage) user.preferences.defaultLanguage = defaultLanguage;
        if (theme) user.preferences.theme = theme;
        if (notifications !== undefined) user.preferences.notifications = notifications;

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            preferences: user.preferences
        });

    } catch (error) {
        console.error('Preferences update error:', error);
        res.status(500).json({
            error: 'Failed to update preferences',
            message: error.message
        });
    }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'ai-tani-secret', (err, user) => {
        if (err) {
            return res.status(403).json({
                error: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
}

module.exports = router; 