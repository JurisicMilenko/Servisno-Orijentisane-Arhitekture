// Initialize tracing first
require('soa-shared-monitoring/tracing');
const logger = require('soa-shared-monitoring/logger');
const { register, metricsMiddleware } = require('soa-shared-monitoring/metrics');

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
app.use(metricsMiddleware);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/tours', toursRouter);
app.use('/api/tours', ratingRoutes);


// Health check
app.get('/health', (req, res) => {
  logger.info('Health check - tours service');
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
  logger.error({ err, path: req.path, method: req.method }, 'Error occurred');
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`🚀 Tours service running on http://localhost:${PORT}`);
  logger.info('Metrics available at /metrics');
  logger.info('Tracing enabled - sending to Jaeger');
});
