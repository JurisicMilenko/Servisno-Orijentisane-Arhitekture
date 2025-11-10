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
