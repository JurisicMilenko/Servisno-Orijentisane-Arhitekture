const service = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const { username, password, email, role, first_name, last_name, avatar_url, bio, motto } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    // role should be either 'guide' or 'tourist' (admins are added directly in DB)
    const normalizedRole = role && role.toLowerCase() === 'guide' ? 'guide' : 'tourist';
    const user = await service.register({ username, password, email, role: normalizedRole, first_name, last_name, avatar_url, bio, motto });
    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const token = await service.login({ username, password });
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const userId = req.user && req.user.sub;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const profile = await service.getProfile(userId);
    // don't return passwordHash
    if (!profile) return res.status(404).json({ error: 'not found' });
    delete profile.passwordHash;
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user && req.user.sub;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const allowed = ['email','first_name','last_name','avatar_url','bio','motto','role'];
    const payload = {};
    for (const k of allowed) if (k in req.body) payload[k] = req.body[k];
    const updated = await service.updateProfile(userId, payload);
    if (!updated) return res.status(404).json({ error: 'not found' });
    delete updated.passwordHash;
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
