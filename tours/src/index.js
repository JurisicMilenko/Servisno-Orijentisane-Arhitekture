// Initialize tracing first
require('../shared/tracing');

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./models/db');
const toursRouter = require('./routes/tours');
const ratingRoutes = require('./routes/tourRatingRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Metrics endpoint (if register is exported)
const { register, metricsMiddleware } = require('../shared/tracing');
if (typeof metricsMiddleware === 'function') {
  app.use(metricsMiddleware);
}

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/tours', toursRouter);
app.use('/api/tours', ratingRoutes);

// Health check
app.get('/health', (req, res) => {
  console.log('Health check - tours service'); // ← use console if logger undefined
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
  console.error({ err, path: req.path, method: req.method }, 'Error occurred'); // ← use console.error
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Tours service running on http://localhost:${PORT}`);
  console.log('Metrics available at /metrics');
  console.log('Tracing enabled - sending to Jaeger');
});
