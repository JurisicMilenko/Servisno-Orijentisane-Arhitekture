# Purchase Service

Servis za upravljanje korpom i kupljenim turama.

## Funkcionalnosti

- **Shopping Cart**: Dodavanje/uklanjanje tura u korpu
- **Checkout**: Kupovina svih tura iz korpe
- **Purchase Tokens**: Generisanje tokena za kupljene ture
- **Purchase Verification**: Provera da li je korisnik kupio turu

## API Endpoints

### Shopping Cart
- `GET /api/purchase/cart` - Prikaži korpu korisnika
- `POST /api/purchase/cart` - Dodaj turu u korpu
  ```json
  {
    "tourId": "tour123",
    "tourName": "Obilazak Beograda",
    "price": 2000
  }
  ```
- `DELETE /api/purchase/cart/:tourId` - Ukloni turu iz korpe
- `DELETE /api/purchase/cart` - Isprazni korpu

### Checkout
- `POST /api/purchase/checkout` - Kupi sve ture iz korpe

### Purchase History
- `GET /api/purchase/purchased` - Lista svih kupljenih tura
- `GET /api/purchase/check/:tourId` - Proveri da li je tura kupljena
- `GET /api/purchase/purchase/:tourId` - Detaljne informacije o kupljnoj turi
- `GET /api/purchase/verify/:token` - Verifikuj purchase token

## Environment Variables

- `PORT`: Port servisa (default: 3004)
- `MONGO_URI`: MongoDB connection string (default: mongodb://mongodb:27017/purchase_db)
- `JWT_SECRET`: Secret za JWT verifikaciju

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm install --production
npm start
```
