const fs = require('fs');
const path = require('path');

// If DATABASE_URL or PGHOST is set, use Postgres; otherwise fallback to file storage
const USE_PG = !!(process.env.DATABASE_URL || process.env.PGHOST);

const dataFile = path.join(__dirname, '..', '..', 'data', 'users.json');

if (USE_PG) {
  // lazy require pg to avoid adding runtime dep if not used
  const { Pool } = require('pg');
  // prefer DATABASE_URL, otherwise use individual PG_* env vars
  const poolConfig = process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : {
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  };
  const pool = new Pool(poolConfig);

  exports.findByUsername = async (username) => {
    const res = await pool.query('SELECT id, username, password_hash, email, role, first_name, last_name, avatar_url, bio, motto FROM users WHERE username = $1 LIMIT 1', [username]);
    if (!res.rows.length) return null;
    const r = res.rows[0];
    return { id: r.id, username: r.username, passwordHash: r.password_hash, email: r.email, role: r.role, first_name: r.first_name, last_name: r.last_name, avatar_url: r.avatar_url, bio: r.bio, motto: r.motto };
  };

  exports.findById = async (id) => {
    const res = await pool.query('SELECT id, username, password_hash, email, role, first_name, last_name, avatar_url, bio, motto FROM users WHERE id = $1 LIMIT 1', [id]);
    if (!res.rows.length) return null;
    const r = res.rows[0];
    return { id: r.id, username: r.username, passwordHash: r.password_hash, email: r.email, role: r.role, first_name: r.first_name, last_name: r.last_name, avatar_url: r.avatar_url, bio: r.bio, motto: r.motto };
  };

  exports.create = async ({ username, passwordHash, email, role, first_name, last_name, avatar_url, bio, motto }) => {
    const res = await pool.query(
      'INSERT INTO users (username, password_hash, email, role, first_name, last_name, avatar_url, bio, motto) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, username, email, role, first_name, last_name, avatar_url, bio, motto',
      [username, passwordHash, email || null, role || 'tourist', first_name || null, last_name || null, avatar_url || null, bio || null, motto || null]
    );
    const r = res.rows[0];
    return { id: r.id, username: r.username, email: r.email, role: r.role, first_name: r.first_name, last_name: r.last_name, avatar_url: r.avatar_url, bio: r.bio, motto: r.motto, passwordHash };
  };

  exports.update = async (id, payload) => {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const k of Object.keys(payload)) {
      // map to DB column names
      const col = k === 'passwordHash' ? 'password_hash' : k;
      fields.push(`${col} = $${idx++}`);
      values.push(payload[k]);
    }
    if (!fields.length) return await exports.findById(id);
    values.push(id);
    const q = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, username, email, role, first_name, last_name, avatar_url, bio, motto, password_hash`;
    const res = await pool.query(q, values);
    if (!res.rows.length) return null;
    const r = res.rows[0];
    return { id: r.id, username: r.username, passwordHash: r.password_hash, email: r.email, role: r.role, first_name: r.first_name, last_name: r.last_name, avatar_url: r.avatar_url, bio: r.bio, motto: r.motto };
  };

  exports._pool = pool; // exported for possible use (e.g., migrations)

} else {
  // File-based storage mode
  const loadUsers = () => {
    try {
      if (fs.existsSync(dataFile)) {
        const raw = fs.readFileSync(dataFile);
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not load users.json:', err.message);
    }
    return [];
  };

  const persist = (users) => {
    try {
      fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
    } catch (err) {
      console.error('Failed to persist users.json:', err.message);
    }
  };

  exports.findByUsername = (username) => {
    const users = loadUsers();
    return users.find(u => u.username === username);
  };

  exports.findById = (id) => {
    const users = loadUsers();
    return users.find(u => u.id === id);
  };

  exports.getAll = () => loadUsers();

  exports.create = ({ username, passwordHash, email, role, first_name, last_name, avatar_url, bio, motto }) => {
    const users = loadUsers();
    const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const user = { id, username, passwordHash, email: email || null, role: role || 'tourist', first_name: first_name || null, last_name: last_name || null, avatar_url: avatar_url || null, bio: bio || null, motto: motto || null };
    users.push(user);
    persist(users);
    return user;
  };

  exports.update = (id, payload) => {
    const users = loadUsers();
    const idx = users.findIndex(u => u.id === id || String(u.id) === String(id));
    if (idx === -1) return null;
    const user = users[idx];
    const allowed = ['email','first_name','last_name','avatar_url','bio','motto','role','passwordHash'];
    for (const k of Object.keys(payload)) {
      if (allowed.includes(k)) user[k] = payload[k];
    }
    users[idx] = user;
    persist(users);
    return user;
  };
}
