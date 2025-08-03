const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "ws:", "wss:"]
        }
    }
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Import routes
const aiRoutes = require('./routes/ai');
const buildRoutes = require('./routes/build');
const languagesRoutes = require('./routes/languages');
const authRoutes = require('./routes/auth');
const projectsRoutes = require('./routes/projects');
const codeRoutes = require('./routes/code');
const frameworksRoutes = require('./routes/frameworks');

// API Routes
app.use('/api/ai', aiRoutes);
app.use('/api/build', buildRoutes);
app.use('/api/languages', languagesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/frameworks', frameworksRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        features: [
            '100,000+ Programming Languages',
            'AI Code Generation',
            'Desktop App Builder (.exe)',
            'Mobile App Builder (.ipa/.apk)',
            'Real-time Collaboration',
            'Project Templates',
            'Debug Tools',
            'Theme Management'
        ]
    });
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Socket.IO for real-time features
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join collaboration room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-joined', socket.id);
    });

    // Handle code changes
    socket.on('code-change', (data) => {
        socket.to(data.roomId).emit('code-updated', {
            code: data.code,
            language: data.language,
            userId: socket.id
        });
    });

    // Handle build progress
    socket.on('build-request', (data) => {
        socket.to(data.roomId).emit('build-started', {
            type: data.type,
            project: data.project
        });
    });

    // Handle AI generation progress
    socket.on('ai-generation', (data) => {
        socket.to(data.roomId).emit('ai-progress', {
            progress: data.progress,
            message: data.message
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        availableRoutes: [
            '/api/ai',
            '/api/build',
            '/api/languages',
            '/api/auth',
            '/api/projects',
            '/api/code',
            '/api/frameworks',
            '/api/health'
        ]
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`
    🚀 AI Tani Complete Server Running!
    
    📍 Server: http://localhost:${PORT}
    🔧 Environment: ${process.env.NODE_ENV || 'development'}
    📊 Health Check: http://localhost:${PORT}/api/health
    
    ✨ Features Available:
    - 100,000+ Programming Languages Support
    - AI Code Generation & Assistance
    - Desktop App Builder (.exe)
    - Mobile App Builder (.ipa/.apk)
    - Real-time Collaboration
    - Project Templates
    - Debug Tools
    - Theme Management
    
    🌐 Open your browser and navigate to: http://localhost:${PORT}
    `);
});

module.exports = { app, server, io }; 