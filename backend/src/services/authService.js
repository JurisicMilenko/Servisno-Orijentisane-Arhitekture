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
  const token = jwt.sign({ 
    sub: user.id, 
    username: user.username, 
    role: user.role || 'tourist' 
  }, JWT_SECRET, { expiresIn: '2h' });
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

exports.getAllUsers = async () => {
  if (!userModel.getAll) throw new Error('getAll not supported by user model');
  const users = await userModel.getAll();
  // remove passwordHash from each
  return users.map(u => {
    const safe = { ...u };
    delete safe.passwordHash;
    return safe;
  });
};

exports.setUserStatus = async (id, status) => {
  if (!userModel.update) throw new Error('update not supported by user model');
  const updated = await userModel.update(id, { status });
  if (updated) delete updated.passwordHash;
  return updated;
};
