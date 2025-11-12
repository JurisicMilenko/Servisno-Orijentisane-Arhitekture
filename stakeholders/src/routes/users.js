const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');

// Apply authentication middleware to all routes
router.use(authenticate);

// Admin-only: list all users
router.get('/', controller.requireAdmin, controller.listUsers);

// Get user details by ID (could be restricted or public depending on requirements)
router.get('/:id', controller.getUser);

// Update user profile
router.put('/:id', controller.updateUser);

// Ban/unban user (admin-only)
router.patch('/:id/status', controller.requireAdmin, controller.banUser);

module.exports = router;
