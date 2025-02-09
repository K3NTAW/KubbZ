const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const tournamentRoutes = require('./routes/tournaments');
const rankingRoutes = require('./routes/rankings');
const winnersRoutes = require('./routes/winners');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:8080'], // Frontend ports
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Kubbz API' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Tournament routes
app.use('/api/tournaments', tournamentRoutes);

// Rankings routes
app.use('/api/rankings', rankingRoutes);

// Winners routes
app.use('/api/winners', winnersRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
