# SOA Monitoring & Observability

Complete monitoring, logging, and tracing setup for the SOA microservices application.

## 🎯 What's Implemented

### 1. **Distributed Tracing (OpenTelemetry + Jaeger)**
- ✅ OpenTelemetry SDK integrated in all Node.js services
- ✅ Auto-instrumentation for Express, HTTP, MongoDB
- ✅ Trace context propagation between services
- ✅ Jaeger UI for trace visualization
- 🔗 Access: http://localhost:16686

### 2. **Centralized Logging (Loki + Promtail)**
- ✅ Structured JSON logging with Pino
- ✅ Trace ID correlation in logs
- ✅ Promtail collecting Docker container logs
- ✅ Loki aggregating logs
- ✅ Grafana for log querying
- 🔗 Access: http://localhost:3001 (Grafana)

### 3. **Metrics Collection (Prometheus + Grafana)**
- ✅ Application metrics (HTTP requests, latency, errors)
- ✅ Node.js process metrics (CPU, memory, event loop)
- ✅ Host OS metrics via node-exporter
- ✅ Container metrics via cAdvisor
- 🔗 Prometheus: http://localhost:9090
- 🔗 Grafana: http://localhost:3001

### 4. **Host & Container Metrics**
- ✅ **Host metrics** (CPU, RAM, Disk, Network) - node-exporter
- ✅ **Container metrics** (CPU, RAM, Disk, Network per container) - cAdvisor
- ✅ Pre-built Grafana dashboard

## 📦 Architecture

```
┌─────────────┐
│   Gateway   │──┐
└─────────────┘  │
┌─────────────┐  │    ┌──────────┐
│    Tours    │──┼───▶│  Jaeger  │ (Traces)
└─────────────┘  │    └──────────┘
┌─────────────┐  │
│  Purchase   │──┘    ┌──────────┐     ┌──────────┐
└─────────────┘       │   Loki   │◀────│ Promtail │ (Logs)
                      └──────────┘     └──────────┘
                      
                      ┌──────────────┐
                      │  Prometheus  │◀─┬─ Services
                      └──────────────┘  ├─ cAdvisor
                                        └─ node-exporter
                      
                      ┌──────────────┐
                      │   Grafana    │ (Visualization)
                      └──────────────┘
```

## 🚀 Quick Start

### 1. Install Dependencies

First, install monitoring dependencies in the shared folder:
```bash
cd shared
npm install
```

Then link or install in each service (gateway, tours, purchase):
```bash
cd ../gateway
npm install ../shared
cd ../tours
npm install ../shared
cd ../purchase
npm install ../shared
```

### 2. Start Monitoring Stack

```bash
cd monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

This starts:
- Jaeger (traces)
- Prometheus (metrics)
- Grafana (dashboards)
- Loki (logs)
- Promtail (log shipper)
- cAdvisor (container metrics)
- node-exporter (host metrics)

### 3. Start Application Services

Make sure the main network exists:
```bash
docker network create soa-net
```

Start the application:
```bash
docker-compose up -d
```

### 4. Access Monitoring UIs

| Tool | URL | Credentials |
|------|-----|-------------|
| Grafana | http://localhost:3001 | admin / admin |
| Jaeger | http://localhost:16686 | - |
| Prometheus | http://localhost:9090 | - |
| cAdvisor | http://localhost:8081 | - |

## 📊 Using the Monitoring Tools

### View Traces (Jaeger)

1. Go to http://localhost:16686
2. Select service (e.g., `gateway`, `tours-service`)
3. Click "Find Traces"
4. Click on a trace to see the distributed call flow

**Example trace flow:**
```
gateway → /api/tours → tours-service → MongoDB
```

### View Logs (Grafana + Loki)

1. Go to http://localhost:3001
2. Navigate to "Explore"
3. Select "Loki" data source
4. Query examples:
   ```
   {service="gateway"}
   {service="tours"} |= "error"
   {trace_id="<trace-id>"}
   ```

### View Metrics (Grafana + Prometheus)

1. Go to http://localhost:3001
2. Navigate to "Dashboards"
3. Open "SOA Infrastructure Monitoring"

**Dashboard includes:**
- Host CPU, Memory, Disk, Network
- Container CPU, Memory, Disk, Network
- Application request rates, latencies, errors

### Custom Queries (Prometheus)

Go to http://localhost:9090 and try:

**Host metrics:**
```promql
# CPU usage
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
100 * (1 - ((node_memory_MemAvailable_bytes) / (node_memory_MemTotal_bytes)))

# Network traffic
rate(node_network_receive_bytes_total[5m])
```

**Container metrics:**
```promql
# Container CPU
rate(container_cpu_usage_seconds_total{name=~".+"}[5m]) * 100

# Container memory
container_memory_usage_bytes{name=~".+"}

# Container network
rate(container_network_receive_bytes_total{name=~".+"}[5m])
```

**Application metrics:**
```promql
# Request rate
rate(http_requests_total[5m])

# Request duration
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate
rate(http_requests_total{status_code=~"5.."}[5m])
```

## 🔍 Verification Checklist

### ✅ Tracing Working
1. Make an API request: `curl http://localhost:4000/api/tours`
2. Go to Jaeger: http://localhost:16686
3. Search for service `gateway` or `tours-service`
4. Verify you see traces with spans showing the call path

### ✅ Logs Aggregated
1. Go to Grafana Explore: http://localhost:3001/explore
2. Select Loki data source
3. Query: `{service="gateway"}`
4. Verify JSON logs appear with `trace_id` field

### ✅ Metrics Collected
1. Check service metrics endpoint: `curl http://localhost:4000/metrics`
2. Go to Prometheus: http://localhost:9090/targets
3. Verify all targets are "UP":
   - gateway, backend, tours, purchase
   - cadvisor
   - node-exporter

### ✅ Host Metrics
1. Go to Prometheus: http://localhost:9090
2. Query: `node_cpu_seconds_total`
3. Verify metrics exist

### ✅ Container Metrics
1. Go to cAdvisor: http://localhost:8081
2. Verify you see Docker containers
3. In Prometheus, query: `container_cpu_usage_seconds_total`
4. Verify metrics exist

## 🏗️ Service Instrumentation

Each Node.js service now has:

### `index.js` - Main service file
```javascript
// Initialize tracing first (before any other imports)
require('../shared/tracing');
const logger = require('../shared/logger');
const { register, metricsMiddleware } = require('../shared/metrics');

// Use logger instead of console
logger.info('Service starting');

// Add metrics middleware
app.use(metricsMiddleware);

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Environment Variables

Add to docker-compose.yml for each service:
```yaml
environment:
  SERVICE_NAME: gateway  # or tours-service, purchase-service
  JAEGER_OTLP_ENDPOINT: http://jaeger:4318/v1/traces
  LOG_LEVEL: info
```

## 🧪 Testing the Setup

### 1. Generate Some Traffic

```bash
# Make some requests
for i in {1..10}; do
  curl http://localhost:4000/api/tours
  sleep 1
done
```

### 2. View in Jaeger
- Open http://localhost:16686
- Select "gateway" service
- Click "Find Traces"
- See distributed traces across services

### 3. View in Grafana
- Open http://localhost:3001
- Dashboard → "SOA Infrastructure Monitoring"
- See CPU/Memory/Network metrics updating

### 4. Query Logs
- Grafana → Explore → Loki
- Query: `{service="gateway"} |= "api/tours"`
- See structured logs with trace IDs

## 📈 What Each Tool Shows

| Tool | Purpose | Key Features |
|------|---------|-------------|
| **Jaeger** | Distributed tracing | See request flow across services, identify slow spans |
| **Loki** | Log aggregation | Search logs by service, trace ID, keywords |
| **Prometheus** | Metrics storage | Query time-series metrics, alerting |
| **Grafana** | Visualization | Dashboards combining metrics, logs, traces |
| **cAdvisor** | Container monitoring | Per-container resource usage |
| **node-exporter** | Host monitoring | Host CPU, RAM, disk, network |

## 🛠️ Troubleshooting

### Traces not appearing in Jaeger
- Check service logs: `docker logs <service>`
- Verify Jaeger is running: `docker ps | grep jaeger`
- Check service env: `JAEGER_OTLP_ENDPOINT=http://jaeger:4318/v1/traces`

### Metrics endpoint 404
- Verify shared folder is linked: `ls -la node_modules/shared`
- Check metrics middleware is added before routes
- Restart service

### Logs not in Loki
- Check Promtail is running: `docker ps | grep promtail`
- Verify Docker socket mounted: `/var/run/docker.sock:/var/run/docker.sock`
- Check Loki URL in promtail config

### High resource usage
- Reduce scrape intervals in `prometheus.yml`
- Lower retention in Loki config
- Disable auto-instrumentations not needed

## 📝 Requirements Met

✅ **Tracing** - OpenTelemetry + Jaeger, traces visible across services  
✅ **Logging** - Structured JSON logs with Pino, aggregated in Loki  
✅ **Visualization** - Jaeger UI for traces, Grafana for logs  
✅ **Host Metrics** - CPU, RAM, Disk, Network via node-exporter  
✅ **Container Metrics** - CPU, RAM, Disk, Network via cAdvisor  
✅ **Dashboards** - Pre-built Grafana dashboard for infrastructure  

## 🔗 Useful Links

- [OpenTelemetry Node.js](https://opentelemetry.io/docs/instrumentation/js/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [Prometheus Query Examples](https://prometheus.io/docs/prometheus/latest/querying/examples/)
- [Grafana Loki](https://grafana.com/docs/loki/latest/)
- [cAdvisor](https://github.com/google/cadvisor)

---

**Note:** For production, consider:
- Proper authentication for Grafana/Prometheus
- Retention policies for logs/metrics
- Sampling rates for traces
- Dedicated monitoring infrastructure
- Alerting rules in Prometheus
