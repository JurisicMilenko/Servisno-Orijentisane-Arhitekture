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

  exports.create = async ({ username, passwordHash, email, role, first_name, last_name, avatar_url, bio, motto }) => {
    const res = await pool.query(
      'INSERT INTO users (username, password_hash, email, role, first_name, last_name, avatar_url, bio, motto) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, username, email, role, first_name, last_name, avatar_url, bio, motto',
      [username, passwordHash, email || null, role || 'tourist', first_name || null, last_name || null, avatar_url || null, bio || null, motto || null]
    );
    const r = res.rows[0];
    return { id: r.id, username: r.username, email: r.email, role: r.role, first_name: r.first_name, last_name: r.last_name, avatar_url: r.avatar_url, bio: r.bio, motto: r.motto, passwordHash };
  };

  exports._pool = pool; // exported for possible use (e.g., migrations)

} else {
  let users = [];

  // load existing users if file exists
  try {
    if (fs.existsSync(dataFile)) {
      const raw = fs.readFileSync(dataFile);
      users = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Could not load users.json:', err.message);
  }

  const persist = () => {
    try {
      fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
    } catch (err) {
      console.error('Failed to persist users.json:', err.message);
    }
  };

  exports.findByUsername = (username) => users.find(u => u.username === username);

  exports.findById = (id) => users.find(u => u.id === id);

  exports.getAll = () => users.slice();

  exports.create = ({ username, passwordHash, email, role, first_name, last_name, avatar_url, bio, motto }) => {
    const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const user = { id, username, passwordHash, email: email || null, role: role || 'tourist', first_name: first_name || null, last_name: last_name || null, avatar_url: avatar_url || null, bio: bio || null, motto: motto || null };
    users.push(user);
    persist();
    return user;
  };
}
