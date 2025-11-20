const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
app.use(cors());
// Don't use express.json() before proxy - it consumes the body
// app.use(express.json());

const PORT = process.env.PORT || 4000;

// Service URLs (adjust with env vars if needed)
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3000';
const ATTRACTIONS_SERVICE = process.env.ATTRACTIONS_SERVICE_URL || 'http://localhost:3000';
const STAKEHOLDERS_SERVICE = process.env.STAKEHOLDERS_SERVICE_URL || 'http://localhost:3001';
const TOURS_SERVICE = process.env.TOURS_SERVICE_URL || 'http://localhost:3002';
const BLOG_SERVICE = process.env.BLOG_SERVICE_URL || 'http://blog-service:80';
const FOLLOWERS_SERVICE = process.env.FOLLOWERS_SERVICE_URL || 'http://followers:80';

// Proxy /api/auth to auth service
app.use('/api/auth', createProxyMiddleware({
  target: AUTH_SERVICE,
  changeOrigin: true,
  logLevel: 'info'
}));

// Proxy /api/attractions (or other APIs) to attractions service
app.use('/api/attractions', createProxyMiddleware({
  target: ATTRACTIONS_SERVICE,
  changeOrigin: true,
  logLevel: 'info'
}));

// Proxy /api/stakeholders to stakeholders service
app.use('/api/stakeholders', createProxyMiddleware({
  target: STAKEHOLDERS_SERVICE,
  changeOrigin: true,
  logLevel: 'info',
  onProxyReq: (proxyReq, req, res) => {
    // Forward user role from JWT token if authenticated
    if (req.headers.authorization) {
      // In production, decode JWT and extract role, then add as header
      // For now, we'll let stakeholders service handle auth via shared logic
      // or you can decode token here and add x-user-role header
    }
  }
}));

// Proxy /api/tours to tours service
app.use('/api/tours', createProxyMiddleware({
  target: TOURS_SERVICE,
  changeOrigin: true,
  logLevel: 'info'
}));

// Proxy /api/touristOrAuthor to blog service
app.use('/api/touristOrAuthor', createProxyMiddleware({
  target: BLOG_SERVICE,
  changeOrigin: true,
  logLevel: 'info'
}));

// Proxy /api/blogratings to blog service
app.use('/api/blogratings', createProxyMiddleware({
  target: BLOG_SERVICE,
  changeOrigin: true,
  logLevel: 'info'
}));

// Proxy /api/followers
app.use('/api/followers', createProxyMiddleware({
  target: FOLLOWERS_SERVICE,
  changeOrigin: true,
  logLevel: 'info'
}));

// Example: route for gateway health
app.get('/health', (req, res) => res.json({ status: 'gateway ok' }));

app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
  console.log(`Proxying /api/auth -> ${AUTH_SERVICE}`);
  console.log(`Proxying /api/attractions -> ${ATTRACTIONS_SERVICE}`);
  console.log(`Proxying /api/stakeholders -> ${STAKEHOLDERS_SERVICE}`);
  console.log(`Proxying /api/tours -> ${TOURS_SERVICE}`);
  console.log(`Proxying /api/blog -> ${BLOG_SERVICE}`);
  console.log(`Proxying /api/followers -> ${FOLLOWERS_SERVICE}`);
});
