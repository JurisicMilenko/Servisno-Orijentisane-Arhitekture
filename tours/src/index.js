const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./models/db');
const toursRouter = require('./routes/tours');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/tours', toursRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'tours service ok',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Tours service running on http://localhost:${PORT}`);
});
