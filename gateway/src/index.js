const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const blogRatingClient = require('./blogRatingClient');

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
const BLOG_RATING_SERVICE = process.env.BLOG_RATING_GRPC || 'blog-service:50051';
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

//grpc cringe

app.use('/api/blogratings', express.json());

app.get('/api/blogratings', (req, res) => {
  const pageNumber = parseInt(req.query.pageNumber) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  blogRatingClient.GetBlogRatingsPaged({ pageNumber, pageSize }, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response);
  });
});

app.post('/api/blogratings', (req, res) => {
  const { blogId, userId, voteType } = req.body;
  if (!blogId || !userId || !voteType) return res.status(400).json({ error: 'blogId, userId, voteType required' });

  blogRatingClient.CreateBlogRating({ blogId, userId, voteType }, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response);
  });
});

app.put('/api/blogratings/:id', (req, res) => {
  const { id } = req.params;
  const { blogId, userId, voteType } = req.body;
  if (!blogId || !userId || !voteType) {
    return res.status(400).json({ error: 'blogId, userId, voteType required' });
  }

  blogRatingClient.UpdateBlogRating({ id: parseInt(id), blogId, userId, voteType }, (err, response) => {
    if (err) {
      console.error('gRPC error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(response);
  });
});

app.delete('/api/blogratings/:id', (req, res) => {
  const { id } = req.params;

  blogRatingClient.DeleteBlogRating({ id: parseInt(id) }, (err, response) => {
    if (err) {
      console.error('gRPC error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(response);
  });
});
//grpc cringe

// Proxy /api/followers
app.use('/api/followers', createProxyMiddleware({
  target: FOLLOWERS_SERVICE,
  changeOrigin: true,
  logLevel: 'info',
  onProxyReq: (proxyReq, req, res) => {
    // Forward JWT to Followers service
    if (req.headers.authorization) {
      //proxyReq.setHeader('Authorization', req.headers.authorization);
    }
  }
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
