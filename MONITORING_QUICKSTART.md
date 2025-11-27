# SOA Monitoring - Quick Start Guide

## 🚀 Setup in 3 Steps

### 1. Install Dependencies
```bash
cd monitoring
./setup.sh
```

This will:
- Install monitoring libraries in shared folder
- Link libraries to gateway, tours, purchase services
- Start monitoring stack (Jaeger, Prometheus, Grafana, Loki, etc.)

### 2. Start Application
```bash
docker-compose up -d
```

### 3. Verify Everything Works
```bash
# Generate some traffic
for i in {1..5}; do
  curl http://localhost:4000/api/tours
  sleep 1
done

# Open monitoring tools
open http://localhost:16686      # Jaeger (traces)
open http://localhost:3001       # Grafana (logs + dashboards)
open http://localhost:9090       # Prometheus (metrics)
```

## 📊 What You Get

### Distributed Tracing (Jaeger)
- See request flow: gateway → tours → MongoDB
- Measure latency of each operation
- Find bottlenecks
- **URL**: http://localhost:16686

### Centralized Logging (Loki + Grafana)
- All service logs in one place
- Structured JSON with trace IDs
- Search by service, trace ID, or keywords
- **URL**: http://localhost:3001 → Explore → Loki

### Metrics & Dashboards
- **Host metrics**: CPU, RAM, disk, network of your machine
- **Container metrics**: CPU, RAM, disk, network per Docker container
- **Application metrics**: Request rate, latency, errors
- **URL**: http://localhost:3001 → Dashboards → "SOA Infrastructure Monitoring"

## 🎯 Quick Checks

### ✅ Is tracing working?
```bash
curl http://localhost:4000/api/tours
# Then go to Jaeger → select "gateway" → Find Traces
# You should see traces
```

### ✅ Are logs aggregated?
```bash
# In Grafana → Explore → Loki, query:
{service="gateway"}
# You should see JSON logs with trace_id
```

### ✅ Are metrics collected?
```bash
curl http://localhost:4000/metrics
# Should return Prometheus metrics
# Also check Prometheus → Status → Targets (all should be UP)
```

### ✅ Are host/container metrics working?
```bash
# In Prometheus, query:
node_cpu_seconds_total
container_cpu_usage_seconds_total
# Should return data
```

## 🔗 URLs Summary

| Tool | URL | Purpose |
|------|-----|---------|
| Jaeger | http://localhost:16686 | View distributed traces |
| Grafana | http://localhost:3001 | View logs and dashboards (admin/admin) |
| Prometheus | http://localhost:9090 | Query metrics |
| cAdvisor | http://localhost:8081 | Container stats |

## 📖 Documentation

- **Full README**: `monitoring/README.md` - Complete guide
- **Verification Guide**: `monitoring/VERIFICATION.md` - Step-by-step verification for demo
- **Architecture**: See README for detailed explanation

## 💡 Key Features

1. **Auto-instrumentation**: No manual span creation needed
2. **Trace-Log correlation**: Logs include trace IDs
3. **Pre-built dashboards**: Infrastructure monitoring out of the box
4. **Production-ready**: Based on industry-standard tools (OpenTelemetry, Prometheus, Grafana)

## 🛠️ Common Commands

```bash
# Stop monitoring
cd monitoring
docker-compose -f docker-compose.monitoring.yml down

# Restart monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# View monitoring logs
docker-compose -f docker-compose.monitoring.yml logs -f

# Check monitoring status
docker-compose -f docker-compose.monitoring.yml ps

# Stop application
cd ..
docker-compose down

# View application logs
docker logs gateway
docker logs tours
docker logs purchase
```

## 📸 Screenshots for Report

See `monitoring/VERIFICATION.md` for the list of required screenshots and where to capture them.

## ✅ Requirements Met

- ✅ Distributed tracing implemented and visualized (Jaeger)
- ✅ Log aggregation implemented and visualized (Loki + Grafana)
- ✅ Host metrics: CPU, RAM, filesystem, network (node-exporter)
- ✅ Container metrics: CPU, RAM, filesystem, network (cAdvisor)
- ✅ All visualized in Grafana dashboards

---

**Need help?** Check `monitoring/README.md` or `monitoring/VERIFICATION.md`
