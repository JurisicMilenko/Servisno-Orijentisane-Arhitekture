const service = require('../services/userService');

/**
 * User Controller - Stakeholders Service
 * Handles user profile operations:
 * - KT 4: View user profile (first_name, last_name, avatar_url, bio, motto)
 * - KT 5: Update user profile information
 */

// Middleware to check if user is admin (expects token validation done by authenticate middleware)
const requireAdmin = (req, res, next) => {
  const userRole = req.user?.role || req.headers['x-user-role'];
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'forbidden: admin only' });
  }
  next();
};

exports.listUsers = async (req, res) => {
  try {
    const users = await service.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await service.getUserById(id);
    if (!user) return res.status(404).json({ error: 'user not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const payload = req.body;
    // Remove internal fields
    delete payload._userRole;
    
    const updated = await service.updateUser(id, payload);
    if (!updated) return res.status(404).json({ error: 'user not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'status required (ACTIVE or BANNED)' });
    }
    const updated = await service.setUserStatus(id, status);
    if (!updated) return res.status(404).json({ error: 'user not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.requireAdmin = requireAdmin;
