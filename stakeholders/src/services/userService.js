const userModel = require('../models/userModel');

exports.getAllUsers = () => {
  return userModel.getAll();
};

exports.getUserById = (id) => {
  return userModel.findById(id);
};

exports.updateUser = (id, payload) => {
  return userModel.update(id, payload);
};

exports.setUserStatus = (id, status) => {
  if (!['ACTIVE', 'BANNED'].includes(status)) {
    throw new Error('status must be ACTIVE or BANNED');
  }
  return userModel.setStatus(id, status);
};
