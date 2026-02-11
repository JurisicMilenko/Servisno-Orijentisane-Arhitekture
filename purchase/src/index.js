// Initialize tracing first
require('../shared/tracing'); // just initialize OpenTelemetry
const { register, metricsMiddleware } = require('../shared/tracing');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const purchaseRoutes = require('./routes/purchaseRoutes');

const app = express();
const PORT = process.env.PORT || 3004;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/purchase_db';

console.log('Starting purchase service...');
console.log({ port: PORT, mongoUri: MONGO_URI });

// Middleware
app.use(cors());
app.use(express.json());
if (typeof metricsMiddleware === 'function') {
  app.use(metricsMiddleware);
}

// Metrics endpoint
if (register) {
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
}

// Health check
app.get('/health', (req, res) => {
  console.log('Health check - purchase service');
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
  console.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
});

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB (purchase_db)');
    app.listen(PORT, () => {
      console.log(`🚀 Purchase service running on port ${PORT}`);
      console.log('Metrics available at /metrics');
      console.log('Tracing enabled - sending to Jaeger');
    });
  })
  .catch((err) => {
    console.log({ err }, '❌ MongoDB connection error');
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing MongoDB connection...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});
