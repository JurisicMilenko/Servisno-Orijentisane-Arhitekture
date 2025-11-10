# Backend — Kako pokrenuti

1. Otvori terminal u `backend/` direktorijumu.
2. Instaliraj zavisnosti:

```bash
npm install
```

3. Pokreni server:

```bash
npm start
```

Server će podići REST API na `http://localhost:3000`.

Dostupni endpoint-i:
- `GET /api/attractions` — vraća listu sample atrakcija
- `GET /api/attractions/{id}` — vraća detalje atrakcije po ID

Sample podaci se nalaze u `data/sample-data.json`.

Razvoj (automatsko restartovanje):

```bash
npm run dev
```

Authentication endpoints (added):
- `POST /api/auth/register` — body: { "username": "...", "password": "..." }  (creates user)
- `POST /api/auth/login` — body: { "username": "...", "password": "..." }  (returns { token })

Users are stored in `data/users.json` (simple file-based storage for the demo). JWT secret defaults to an internal development value; set `JWT_SECRET` in env for production.

Optional: use PostgreSQL for persistent storage
------------------------------------------------
If you want the backend to store users in a real database, you can connect it to PostgreSQL. To enable Postgres support set either `DATABASE_URL` (e.g. postgres://user:pass@host:port/dbname) or the individual env vars `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`.

1) Create database and table (example using psql):

```bash
# create database (if needed)
createdb soa_demo

# run schema (from project root)
psql -d soa_demo -f backend/data/schema.sql
```

2) Start the server with env vars (example):

```bash
export PGHOST=localhost
export PGUSER=youruser
export PGPASSWORD=yourpass
export PGDATABASE=soa_demo
export PGPORT=5432
# optional: export JWT_SECRET="change-this-to-a-secret"
npm start
```

When these env vars are present the backend will use Postgres for users storage. If not present it will fall back to `data/users.json`.

Note: for quick testing you can also set `DATABASE_URL` instead of individual PG_* vars:

```bash
export DATABASE_URL="postgres://user:pass@localhost:5432/soa_demo"
npm start
```

