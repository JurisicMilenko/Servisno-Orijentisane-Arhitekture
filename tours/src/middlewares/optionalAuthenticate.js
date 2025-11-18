const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// Optional authentication - sets req.user if token is valid, but doesn't reject if missing
module.exports = (req, res, next) => {
  const auth = req.headers.authorization || req.headers.Authorization;
  
  if (!auth || !auth.startsWith('Bearer ')) {
    // No token provided - continue without user
    req.user = null;
    return next();
  }
  
  const token = auth.slice(7);
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    // Invalid token - continue without user
    req.user = null;
    next();
  }
};
