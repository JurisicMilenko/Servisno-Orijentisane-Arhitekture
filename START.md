# 🚀 SOA Microservices Application - Quick Start

## 📋 Preduslovi

- **Docker Desktop** instaliran i pokrenut
- Minimum **8GB RAM** (preporučeno 16GB)
- **20GB** slobodnog prostora na disku

## ⚡ Brzo pokretanje - SVE ODJEDNOM

### 1️⃣ Pokreni kompletnu aplikaciju sa monitoringom

```bash
docker compose up -d
```

Ova jedna komanda pokreće:
- ✅ **Baze podataka**: PostgreSQL, MongoDB, Neo4j
- ✅ **Backend servise**: backend, stakeholders, tours, purchase, gateway
- ✅ **Frontend**: nginx web server
- ✅ **Monitoring stack**: Jaeger, Prometheus, Grafana, Loki, Promtail, cAdvisor, node-exporter

### 2️⃣ Proveri status

```bash
docker compose ps
```

Trebalo bi da vidiš sve servise sa statusom "Up" ili "Up (healthy)".

### 3️⃣ Pristup aplikaciji

| Servis | URL | Opis |
|--------|-----|------|
| **Frontend** | http://localhost:8080 | Glavna web aplikacija |
| **API Gateway** | http://localhost:4000 | REST API pristupna tačka |
| **Jaeger UI** | http://localhost:16686 | Distributed tracing |
| **Grafana** | http://localhost:3003 | Dashboards (admin/admin) |
| **Prometheus** | http://localhost:9090 | Metrics explorer |
| **cAdvisor** | http://localhost:8081 | Container metrics |

---

## 🎯 Testiranje sistema

### Generiši saobraćaj (traffic)

```bash
# Health check na sve servise
for i in {1..5}; do
  curl http://localhost:4000/health
  sleep 1
done

# Testiraj tours endpoint
for i in {1..5}; do
  curl http://localhost:4000/api/tours
  sleep 1
done
```

### Proveri Tracing (Jaeger)

1. Otvori http://localhost:16686
2. Izaberi servis: **gateway** ili **tours-service**
3. Klikni **Find Traces**
4. Vidi complete trace kroz servise

### Proveri Logove (Grafana + Loki)

1. Otvori http://localhost:3003 (admin/admin)
2. Klikni **Explore** (kompas ikona)
3. Izaberi **Loki** data source
4. Query: `{service="gateway"}`
5. Run query

### Proveri Metrike (Prometheus)

1. Otvori http://localhost:9090
2. Queries:
   - CPU: `node_cpu_seconds_total`
   - Container CPU: `rate(container_cpu_usage_seconds_total{name=~".+"}[5m])`
   - HTTP requests: `http_requests_total`

### Proveri Grafana Dashboard

1. Otvori http://localhost:3003
2. **Dashboards** → **Browse**
3. Otvori **SOA Infrastructure Monitoring**

---

## 🛑 Zaustavljanje

### Zaustavi sve servise

```bash
docker compose down
```

### Zaustavi i obriši volumes (baze podataka)

```bash
docker compose down -v
```

---

## 🔧 Napredne komande

### Vidi logove svih servisa

```bash
docker compose logs -f
```

### Vidi logove specifičnog servisa

```bash
docker compose logs -f gateway
docker compose logs -f tours
docker compose logs -f jaeger
```

### Rebuild servisa

```bash
docker compose up -d --build gateway
```

### Zaustavi samo monitoring

```bash
docker compose stop jaeger prometheus grafana loki promtail cadvisor node-exporter
```

### Pokreni samo monitoring

```bash
docker compose up -d jaeger prometheus grafana loki promtail cadvisor node-exporter
```

---

## 📊 Monitoring & Observability

### ✅ Šta je implementirano:

#### 1. **Distributed Tracing** (Jaeger)
- OpenTelemetry instrumentacija u svim Node.js servisima
- Trace propagation između servisa
- UI za vizualizaciju: http://localhost:16686

#### 2. **Centralized Logging** (Loki + Promtail)
- JSON structured logs sa Pino
- Trace ID korelacija u logovima
- Log aggregation i pretraga u Grafana

#### 3. **Metrics Collection** (Prometheus)
- **Application metrics**: HTTP requests, latency, errors
- **Host OS metrics**: CPU, RAM, Disk, Network (node-exporter)
- **Container metrics**: Per-container CPU, RAM, Disk, Network (cAdvisor)
- **Process metrics**: Node.js memory, event loop

#### 4. **Visualization** (Grafana)
- Pre-built dashboards
- Log explorer (Loki)
- Trace explorer (Jaeger data source)
- Metrics explorer (Prometheus)

---

## 🐛 Troubleshooting

### Problem: Servis neće da se pokrene

```bash
# Proveri logs
docker compose logs <service_name>

# Restart servisa
docker compose restart <service_name>
```

### Problem: Port već zauzet

```bash
# Proveri šta koristi port
lsof -i :4000

# Zaustavi lokalne servise
killall node
```

### Problem: Out of memory

```bash
# Podigni Docker Desktop memoriju na 8GB+
# Ili pokreni samo određene servise:
docker compose up -d postgres mongodb backend gateway frontend
```

### Problem: .NET servisi ne rade (blog-service, followers)

**Uzrok**: gRPC protoc kompilator ima bug na Apple Silicon (ARM64).

**Workaround**: Ovi servisi nisu neophodni za osnovnu funkcionalnost. Aplikacija radi bez njih.

---

## 📁 Struktura projekta

```
.
├── backend/          # Node.js backend (Auth + Attractions)
├── frontend/         # HTML/CSS/JS frontend
├── gateway/          # API Gateway sa routing
├── stakeholders/     # Stakeholders mikroservis
├── tours/            # Tours mikroservis (MongoDB)
├── purchase/         # Purchase mikroservis (MongoDB)
├── shared/           # Shared monitoring libraries
├── monitoring/       # Monitoring konfiguracije
│   ├── prometheus.yml
│   ├── loki-config.yml
│   ├── promtail-config.yml
│   └── grafana/
├── BlogService/      # .NET blog servis (problem na ARM64)
├── FollowerService/  # .NET followers servis (problem na ARM64)
└── docker-compose.yml # GLAVNI FAJL - pokreće SVE
```

---

## 🎓 Za predaju projekta

### Screenshots koji treba da napravite:

1. **Jaeger UI** - trace koji ide kroz više servisa
2. **Grafana Logs** - logovi sa trace_id korelacijom
3. **Prometheus** - host metrics (CPU, RAM, Network, Disk)
4. **cAdvisor** ili **Prometheus** - container metrics
5. **Grafana Dashboard** - kompletan dashboard sa svim panelima

### Kako generisati podatke za screenshots:

```bash
# 1. Pokreni sve
docker compose up -d

# 2. Sačekaj 30 sekundi da se sve pokrene
sleep 30

# 3. Generiši saobraćaj
for i in {1..20}; do
  curl http://localhost:4000/api/tours
  curl http://localhost:4000/api/stakeholders
  curl http://localhost:4000/health
  sleep 1
done

# 4. Sada napravi screenshots
```

---

## 📞 Dodatne informacije

- **Dokumentacija**: Vidi README.md fajlove u svakom folderu
- **Monitoring detalji**: monitoring/README.md
- **API dokumentacija**: api/openapi.yaml

**Napomena**: Blog i Follower servisi (.NET) imaju problem sa gRPC na Apple Silicon Mac-ovima. Aplikacija je potpuno funkcionalna bez njih.
