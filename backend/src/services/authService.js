const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

exports.register = async ({ username, password, email, role, first_name, last_name, avatar_url, bio, motto }) => {
  const existing = await userModel.findByUsername(username);
  if (existing) throw new Error('username already exists');
  const hash = await bcrypt.hash(password, 10);
  const user = await userModel.create({ username, passwordHash: hash, email, role, first_name, last_name, avatar_url, bio, motto });
  return user;
};

exports.login = async ({ username, password }) => {
  const user = await userModel.findByUsername(username);
  if (!user || !user.passwordHash) throw new Error('invalid credentials');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('invalid credentials');
  const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
  return token;
};

exports.getProfile = async (id) => {
  // assume userModel has method to find by id
  if (userModel.findById) return await userModel.findById(id);
  // fallback: find all and find
  if (userModel.getAll) {
    const all = await userModel.getAll();
    return all.find(u => u.id === id);
  }
  return null;
};

exports.updateProfile = async (id, payload) => {
  if (!userModel.update) throw new Error('update not supported by user model');
  // ensure id type matches stored id format
  const updated = await userModel.update(id, payload);
  return updated;
};
