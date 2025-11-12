const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

module.exports = (req, res, next) => {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    // For endpoints that don't require auth, you can skip this
    // For now, attach empty user
    req.user = null;
    return next();
  }
  
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Attach user info to request
    req.user = payload;
    // Also set header for downstream use
    req.headers['x-user-role'] = payload.role || 'tourist';
    req.headers['x-user-id'] = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
};
