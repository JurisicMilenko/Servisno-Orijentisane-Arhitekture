const userModel = require('../models/userModel');

/**
 * User Service - Business logic for user profile management
 * Implements:
 * - KT 4: Retrieve user profile with extended information
 * - KT 5: Update user profile (first_name, last_name, email, avatar_url, bio, motto)
 */

exports.getAllUsers = () => {
  return userModel.getAll();
};

// KT 4: Get user profile by ID
exports.getUserById = (id) => {
  return userModel.findById(id);
};

// KT 5: Update user profile information
exports.updateUser = (id, payload) => {
  return userModel.update(id, payload);
};

exports.setUserStatus = (id, status) => {
  if (!['ACTIVE', 'BANNED'].includes(status)) {
    throw new Error('status must be ACTIVE or BANNED');
  }
  return userModel.setStatus(id, status);
};
