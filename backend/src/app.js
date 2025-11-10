const express = require('express');
const path = require('path');
const cors = require('cors');

const createLogger = () => (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
};

const attractionsRouter = require('./routes/attractions');
const authRouter = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use(createLogger());

app.use('/api/attractions', attractionsRouter);
app.use('/api/auth', authRouter);

// basic health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = app;
