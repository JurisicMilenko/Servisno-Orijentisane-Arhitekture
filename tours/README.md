# Tours Service

Mikroservis za upravljanje turama i ključnim tačkama.

## Funkcionalnosti

- Kreiranje tura (status: draft, cena: 0)
- Upravljanje ključnim tačkama ture (koordinate, naziv, opis, slika)
- Crtanje tura na mapi na osnovu ključnih tačaka
- CRUD operacije za ture i ključne tačke

## Tehnologije

- Node.js + Express
- MongoDB (NoSQL baza)
- Mongoose ODM

## Instalacija

```bash
npm install
```

## Pokretanje

```bash
npm start
```

## Environment Variables

- `PORT` - Port na kojem radi servis (default: 3002)
- `JWT_SECRET` - Secret za JWT token validaciju
- `MONGO_URI` - MongoDB connection string

## API Endpoints

### Tours
- `GET /api/tours` - Lista svih tura
- `GET /api/tours/author/:authorId` - Ture određenog autora
- `GET /api/tours/:id` - Detalji ture
- `POST /api/tours` - Kreiranje nove ture
- `PUT /api/tours/:id` - Ažuriranje ture
- `DELETE /api/tours/:id` - Brisanje ture
- `PATCH /api/tours/:id/publish` - Objavljivanje ture (draft -> published)

### Key Points (Ključne tačke)
- `GET /api/tours/:tourId/keypoints` - Ključne tačke ture
- `POST /api/tours/:tourId/keypoints` - Dodavanje ključne tačke
- `PUT /api/keypoints/:id` - Ažuriranje ključne tačke
- `DELETE /api/keypoints/:id` - Brisanje ključne tačke
