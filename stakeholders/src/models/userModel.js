const fs = require('fs');
const path = require('path');

// Shared database with Auth service
const dataFile = path.join(__dirname, '..', '..', '..', 'backend', 'data', 'users.json');

const loadUsers = () => {
  try {
    if (fs.existsSync(dataFile)) {
      const raw = fs.readFileSync(dataFile);
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Could not load users.json:', err.message);
  }
  return [];
};

const persist = (users) => {
  try {
    const dir = path.dirname(dataFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Failed to persist users.json:', err.message);
  }
};

exports.getAll = async () => {
  const users = loadUsers();
  return users.map(u => {
    const safe = { ...u };
    delete safe.passwordHash;
    return safe;
  });
};

exports.findById = async (id) => {
  const users = loadUsers();
  const user = users.find(u => u.id === id || String(u.id) === String(id));
  if (!user) return null;
  
  const safe = { ...user };
  delete safe.passwordHash;
  return safe;
};

exports.update = async (id, payload) => {
  const users = loadUsers();
  const idx = users.findIndex(u => u.id === id || String(u.id) === String(id));
  if (idx === -1) return null;
  
  const user = users[idx];
  const allowed = ['name', 'email', 'bio', 'motto', 'interests', 'languages', 'certifications'];
  for (const k of Object.keys(payload)) {
    if (allowed.includes(k)) user[k] = payload[k];
  }
  
  users[idx] = user;
  persist(users);
  
  const safe = { ...user };
  delete safe.passwordHash;
  return safe;
};

exports.setStatus = async (id, status) => {
  const users = loadUsers();
  const idx = users.findIndex(u => u.id === id || String(u.id) === String(id));
  if (idx === -1) return null;
  
  users[idx].status = status;
  persist(users);
  
  const safe = { ...users[idx] };
  delete safe.passwordHash;
  return safe;
};
