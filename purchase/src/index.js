// Initialize tracing first
require('soa-shared-monitoring/tracing');
const logger = require('soa-shared-monitoring/logger');
const { register, metricsMiddleware } = require('soa-shared-monitoring/metrics');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const purchaseRoutes = require('./routes/purchaseRoutes');

const app = express();
const PORT = process.env.PORT || 3004;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/purchase_db';

logger.info('Starting purchase service...');
logger.info({ port: PORT, mongoUri: MONGO_URI });

// Middleware
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health check
app.get('/health', (req, res) => {
  logger.info('Health check - purchase service');
  res.json({ 
    status: 'OK', 
    service: 'purchase',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/purchase', purchaseRoutes);

// Error handler
app.use((err, req, res, next) => {
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
});

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    logger.info('✅ Connected to MongoDB (purchase_db)');
    app.listen(PORT, () => {
      logger.info(`🚀 Purchase service running on port ${PORT}`);
      logger.info('Metrics available at /metrics');
      logger.info('Tracing enabled - sending to Jaeger');
    });
  })
  .catch((err) => {
    logger.error({ err }, '❌ MongoDB connection error');
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing MongoDB connection...');
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});
