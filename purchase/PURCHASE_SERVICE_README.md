# Purchase Service - Kompletna Implementacija

## 📋 Pregled

Purchase servis omogućava turistima da dodaju ture u korpu i kupuju ih. Servis koristi MongoDB za čuvanje podataka o korpama i kupljenim turama.

## 🏗️ Arhitektura

### Backend (Purchase Service)
- **Port**: 3004
- **Database**: MongoDB (purchase_db)
- **Modeli**:
  - `ShoppingCart` - Korpa za svakog korisnika
  - `OrderItem` - Stavka u korpi (tourId, tourName, price)
  - `TourPurchaseToken` - Token koji potvrđuje da je tura kupljena

### Integracija
- **Gateway**: Rutira `/api/purchase/*` ka purchase servisu
- **Docker**: Pokreće se kao poseban kontejner sa MongoDB konekcijom

## 🔌 API Endpoints

### Korpa (Shopping Cart)

#### Prikaži korpu
```http
GET /api/purchase/cart
Headers: Authorization: Bearer <token>
```

#### Dodaj turu u korpu
```http
POST /api/purchase/cart
Headers: 
  Authorization: Bearer <token>
  Content-Type: application/json
Body:
{
  "tourId": "675c8af...",
  "tourName": "Obilazak Beograda",
  "price": 2000
}
```

#### Ukloni turu iz korpe
```http
DELETE /api/purchase/cart/:tourId
Headers: Authorization: Bearer <token>
```

#### Isprazni korpu
```http
DELETE /api/purchase/cart
Headers: Authorization: Bearer <token>
```

### Kupovina (Checkout)

#### Kupi sve ture iz korpe
```http
POST /api/purchase/checkout
Headers: Authorization: Bearer <token>
```
**Odgovor:**
```json
{
  "message": "Checkout successful",
  "purchasedCount": 2,
  "tokens": [
    {
      "userId": "123",
      "tourId": "675c8af...",
      "tourName": "Obilazak Beograda",
      "price": 2000,
      "token": "abc123...",
      "status": "active",
      "purchasedAt": "2025-11-26T..."
    }
  ]
}
```

### Provera Kupljenih Tura

#### Lista svih kupljenih tura
```http
GET /api/purchase/purchased
Headers: Authorization: Bearer <token>
```

#### Proveri da li je tura kupljena
```http
GET /api/purchase/check/:tourId
Headers: Authorization: Bearer <token>
```
**Odgovor:**
```json
{
  "purchased": true
}
```

#### Detalji o kupovini specifične ture
```http
GET /api/purchase/purchase/:tourId
Headers: Authorization: Bearer <token>
```

#### Verifikuj purchase token
```http
GET /api/purchase/verify/:token
Headers: Authorization: Bearer <token>
```

## 💻 Frontend

### Shopping Cart Page (`shopping-cart.html`)
- Prikaz svih stavki u korpi
- Ukupna cena
- Dugme za uklanjanje pojedinačne ture
- Dugme za checkout (kupovina)
- Dugme za pražnjenje korpe

### Home Page Integracija
- **Dugme "Korpa"** u navigaciji sa badge-om koji pokazuje broj stavki
- **Dugme "Dodaj u korpu"** na svakoj karti ture
- Automatsko ažuriranje broja stavki nakon dodavanja

### Ključne Funkcije (home.js)

```javascript
// Učitaj broj stavki u korpi
async function loadCartCount()

// Dodaj turu u korpu
async function addToCart(event, tourId, tourName, price)

// Ažuriraj badge sa brojem stavki
function updateCartBadge(count)
```

## 🚀 Pokretanje

### Sa Docker Compose
```bash
docker-compose up -d purchase
```

### Lokalno (Development)
```bash
cd purchase
npm install
npm run dev
```

**Environment Variables:**
```env
PORT=3004
MONGO_URI=mongodb://localhost:27017/purchase_db
JWT_SECRET=change-me-in-prod
NODE_ENV=development
```

## 📊 MongoDB Kolekcije

### `shoppingcarts`
```javascript
{
  userId: "123",
  items: [
    {
      tourId: "675c8af...",
      tourName: "Obilazak Beograda",
      price: 2000,
      addedAt: ISODate("2025-11-26...")
    }
  ],
  totalPrice: 2000,
  updatedAt: ISODate("2025-11-26..."),
  createdAt: ISODate("2025-11-26...")
}
```

### `tourpurchasetokens`
```javascript
{
  userId: "123",
  tourId: "675c8af...",
  tourName: "Obilazak Beograda",
  price: 2000,
  token: "abc123def456...",
  status: "active", // "active" | "expired" | "refunded"
  purchasedAt: ISODate("2025-11-26..."),
  createdAt: ISODate("2025-11-26..."),
  updatedAt: ISODate("2025-11-26...")
}
```

**Indeksi:**
- `userId` (index)
- `tourId` (index)
- `token` (unique index)
- Compound index: `{userId: 1, tourId: 1}` (unique) - sprečava duplo kupovanje iste ture

## 🔐 Sigurnost

1. **Autentifikacija**: Svi endpoint-i zahtevaju JWT token
2. **User Isolation**: Korisnik vidi samo svoju korpu i svoje kupovine
3. **Duplicate Prevention**: 
   - Tura se ne može dodati u korpu ako je već u korpi
   - Tura se ne može dodati u korpu ako je već kupljena
   - Compound unique index sprečava duplo kupovanje

## 🧪 Testiranje

### Dodavanje u korpu
```bash
curl -X POST http://localhost:4000/api/purchase/cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tourId": "675c8af123",
    "tourName": "Test Tura",
    "price": 1500
  }'
```

### Prikaži korpu
```bash
curl http://localhost:4000/api/purchase/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Checkout
```bash
curl -X POST http://localhost:4000/api/purchase/checkout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📝 Biznis Logika

### Dodavanje u Korpu
1. Proveri da li je tura već u korpi → error ako jeste
2. Proveri da li je tura već kupljena → error ako jeste
3. Dodaj stavku u korpu
4. Izračunaj novu ukupnu cenu

### Checkout Proces
1. Proveri da li je korpa prazna → error ako jeste
2. Za svaku stavku u korpi:
   - Proveri da li je već kupljena (skip ako jeste)
   - Generiši unique purchase token
   - Kreiraj TourPurchaseToken zapis
3. Isprazni korpu
4. Vrati listu kreiranih tokena

### Prikaz Tura Turistima
- **Nekupljene ture**: Vide opis, cenu, dužinu, recenzije, početnu tačku
- **Kupljene ture**: Vide sve ključne tačke (kontrolne tačke sa detaljima)

## 🔄 Integracija sa Tours Service

Purchase servis čuva samo purchase token i osnovne informacije. Za prikaz tura:

```javascript
// 1. Dobavi kupljene ture
const purchased = await fetch('/api/purchase/purchased');

// 2. Za svaku kupljenu turu, dobavi detalje sa Tours servisa
for (const purchase of purchased) {
  const tourDetails = await fetch(`/api/tours/${purchase.tourId}`);
  // tourDetails.keyPoints će biti dostupne za kupljene ture
}
```

## 🎯 Features

✅ Shopping cart sa automatskim računanjem ukupne cene
✅ Checkout sa generisanjem purchase tokena
✅ Provera da li je tura već kupljena
✅ Badge sa brojem stavki u korpi
✅ "Dodaj u korpu" dugme na home stranici
✅ Dedikovan Cart view sa mogućnošću uklanjanja stavki
✅ Sprečavanje duplih kupovina
✅ JWT autentifikacija
✅ MongoDB perzistencija
✅ Docker kontejner sa MongoDB konekcijom
✅ Gateway integracija

## 📚 Sledeći Koraci

Za potpunu implementaciju zahteva, dodaj:
1. **Tours Service integracija**: Ograniči prikaz keyPoints dok tura nije kupljena
2. **Purchase History Page**: Frontend za prikaz kupljenih tura
3. **Refund funkcionalnost**: Opcija za vraćanje novca (status: "refunded")
4. **Archived Tours Check**: Provera da li je tura arhivirana pre dodavanja u korpu
