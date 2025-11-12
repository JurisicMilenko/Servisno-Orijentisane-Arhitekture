const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

module.exports = async (req, res, next) => {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Check if user is banned
    const user = await userModel.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'user not found' });
    if (user.status === 'BANNED') return res.status(403).json({ error: 'user is banned' });
    // Attach user data including role for admin checks
    req.user = { ...payload, role: user.role, status: user.status };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
};
