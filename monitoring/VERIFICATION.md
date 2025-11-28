# Verification Guide - Monitoring & Observability

## 🎯 Quick Verification Steps

Follow these steps to demonstrate that all monitoring requirements are met.

### Step 1: Start the Monitoring Stack

```bash
cd monitoring
./setup.sh
```

Wait for all services to be up. Check with:
```bash
docker-compose -f docker-compose.monitoring.yml ps
```

All services should show "Up" status:
- jaeger
- prometheus
- grafana
- loki
- promtail
- cadvisor
- node-exporter

### Step 2: Start the Application

```bash
cd ..
docker-compose up -d
```

Check services are running:
```bash
docker-compose ps
```

### Step 3: Verify Tracing ✅

**Generate some traffic:**
```bash
# Make several API calls
for i in {1..5}; do
  curl http://localhost:4000/api/tours
  sleep 1
done
```

**View traces in Jaeger:**
1. Open http://localhost:16686
2. In "Service" dropdown, select **gateway**
3. Click **"Find Traces"**
4. You should see traces listed

**Click on a trace to verify:**
- ✅ Multiple spans showing request flow
- ✅ Timing information for each span
- ✅ Tags showing service names
- ✅ If gateway calls tours service, you'll see both in the trace

**Screenshot locations:**
- Main trace list showing traces from gateway
- Detailed view of a single trace showing spans

### Step 4: Verify Log Aggregation ✅

**View logs in Grafana:**
1. Open http://localhost:3001 (login: admin/admin)
2. Click **Explore** (compass icon on left)
3. Select **Loki** as data source
4. Enter query: `{service="gateway"}`
5. Click **"Run query"**

**Verify:**
- ✅ JSON structured logs appear
- ✅ Logs contain `trace_id` field
- ✅ Logs contain `service` field
- ✅ Can filter by log level, service name

**Try these queries:**
```
{service="gateway"} |= "api/tours"
{service="tours-service"} |= "error"
{trace_id="<paste-trace-id-from-jaeger>"}
```

**Screenshot locations:**
- Grafana Explore showing logs from a service
- Log entry showing trace_id correlation

### Step 5: Verify Host Metrics ✅

**Check in Prometheus:**
1. Open http://localhost:9090
2. In query box, enter: `node_cpu_seconds_total`
3. Click **Execute**
4. Switch to **Graph** tab

**Required host metrics:**
- ✅ CPU: `100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)`
- ✅ Memory: `node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100`
- ✅ Disk: `node_filesystem_avail_bytes{mountpoint="/"}`
- ✅ Network: `rate(node_network_receive_bytes_total[5m])`

**Screenshot locations:**
- Prometheus graph showing CPU usage over time
- Table view showing metrics

### Step 6: Verify Container Metrics ✅

**Check cAdvisor:**
1. Open http://localhost:8081
2. Verify you see Docker containers listed

**Check in Prometheus:**
1. Open http://localhost:9090
2. Query: `container_cpu_usage_seconds_total{name=~".+"}`

**Required container metrics:**
- ✅ CPU: `rate(container_cpu_usage_seconds_total{name=~".+"}[5m])`
- ✅ Memory: `container_memory_usage_bytes{name=~".+"}`
- ✅ Disk: `container_fs_usage_bytes{name=~".+"}`
- ✅ Network: `rate(container_network_receive_bytes_total{name=~".+"}[5m])`

**Screenshot locations:**
- cAdvisor showing container list
- Prometheus showing per-container metrics

### Step 7: View Dashboard in Grafana ✅

**Open the pre-built dashboard:**
1. Go to http://localhost:3001
2. Click **Dashboards** → **Browse**
3. Open **"SOA Infrastructure Monitoring"**

**Verify panels show data:**
- ✅ Host CPU Usage
- ✅ Host Memory Usage
- ✅ Host Network Traffic
- ✅ Host Disk Usage
- ✅ Container CPU Usage (per container)
- ✅ Container Memory Usage (per container)
- ✅ Container Network Traffic
- ✅ Container Filesystem Usage

**Screenshot locations:**
- Full dashboard view showing all panels with data

### Step 8: Check Metrics Endpoints ✅

Each service exposes metrics at `/metrics`:

```bash
curl http://localhost:4000/metrics  # Gateway
curl http://localhost:3002/metrics  # Tours (through gateway or directly if exposed)
```

**Verify metrics include:**
- ✅ `http_requests_total` - request counter
- ✅ `http_request_duration_seconds` - request latency histogram
- ✅ `nodejs_*` - Node.js process metrics

### Step 9: Verify Trace-Log Correlation ✅

**This demonstrates the full observability pipeline:**

1. Make a request and note the response time
2. Go to **Jaeger** (http://localhost:16686)
3. Find a trace, click on it
4. Copy the **Trace ID** from the top of the trace detail
5. Go to **Grafana** → **Explore** → **Loki**
6. Query: `{trace_id="<paste-trace-id>"}`
7. You should see logs from all services involved in that trace

**This proves:**
- ✅ Tracing works
- ✅ Logging works
- ✅ Trace context propagation works
- ✅ Correlation between traces and logs works

### Step 10: Generate Load and Observe

**Create some traffic:**
```bash
# In one terminal, generate continuous traffic
while true; do
  curl http://localhost:4000/api/tours
  curl http://localhost:4000/api/tours/published
  sleep 0.5
done
```

**In another terminal, watch the metrics:**
```bash
# Watch request rate increase
watch -n 1 'curl -s http://localhost:4000/metrics | grep http_requests_total'
```

**Observe in Grafana dashboard:**
- CPU usage increases
- Request rate increases
- Network traffic increases

## 📸 Required Screenshots for Documentation

1. **Jaeger - Trace List**
   - Shows multiple traces from services

2. **Jaeger - Trace Detail**
   - Shows spans, timing, service names

3. **Grafana Explore - Logs**
   - Shows structured JSON logs with trace_id

4. **Prometheus - Host Metrics**
   - Query showing node_cpu_seconds_total or similar

5. **Prometheus - Container Metrics**
   - Query showing container_cpu_usage_seconds_total

6. **Grafana Dashboard - Full View**
   - SOA Infrastructure Monitoring dashboard with all panels populated

7. **cAdvisor - Container List**
   - Showing Docker containers being monitored

8. **Trace-Log Correlation**
   - Side-by-side: Jaeger trace with trace ID, Loki logs filtered by same trace ID

## ✅ Requirements Checklist

### Tracing (3 points)
- [x] Distributed tracing implemented (OpenTelemetry)
- [x] Traces visible in visualization tool (Jaeger)
- [x] Trace propagation between services (context propagation works)
- [x] At least one service fully instrumented (all 3 Node services)

### Logging (3 points)
- [x] Log aggregation implemented (Loki + Promtail)
- [x] Logs visible in visualization tool (Grafana)
- [x] Structured logging with trace correlation (JSON logs with trace_id)
- [x] At least one service sending logs (all 3 Node services)

### Host Metrics
- [x] CPU usage (node-exporter)
- [x] RAM/Memory usage (node-exporter)
- [x] Filesystem usage (node-exporter)
- [x] Network traffic (node-exporter)

### Container Metrics
- [x] CPU usage per container (cAdvisor)
- [x] RAM/Memory usage per container (cAdvisor)
- [x] Filesystem usage per container (cAdvisor)
- [x] Network traffic per container (cAdvisor)

## 🐛 Troubleshooting

### No traces in Jaeger
```bash
# Check if service can reach Jaeger
docker exec gateway curl http://jaeger:4318/v1/traces
# Check service logs
docker logs gateway
```

### No logs in Loki
```bash
# Check Promtail logs
docker logs promtail
# Verify Loki is accessible
curl http://localhost:3100/ready
```

### Metrics not showing
```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets
# Check service metrics endpoint
curl http://localhost:4000/metrics
```

### Services can't reach monitoring stack
```bash
# Verify network
docker network inspect soa-net
# Ensure monitoring services are on same network
cd monitoring
docker-compose -f docker-compose.monitoring.yml down
# Update docker-compose.monitoring.yml to use external network
# Restart
docker-compose -f docker-compose.monitoring.yml up -d
```

## 📝 Demo Script for Presentation

```bash
# 1. Show monitoring stack is running
docker-compose -f monitoring/docker-compose.monitoring.yml ps

# 2. Start application
docker-compose up -d

# 3. Generate traffic
for i in {1..10}; do curl http://localhost:4000/api/tours; sleep 1; done

# 4. Open Jaeger - show trace
open http://localhost:16686

# 5. Open Grafana - show logs
open http://localhost:3001

# 6. Open Grafana - show dashboard
# Navigate to Dashboards → SOA Infrastructure Monitoring

# 7. Show metrics endpoint
curl http://localhost:4000/metrics

# 8. Show Prometheus queries
open http://localhost:9090
```

## 🎓 What We Demonstrated

1. **Distributed Tracing**: Requests flow through multiple services, each span is captured, timing is measured
2. **Centralized Logging**: All service logs are aggregated, searchable, structured with trace correlation
3. **Metrics Collection**: Application, process, host, and container metrics all collected
4. **Visualization**: Single pane of glass (Grafana) to view logs, metrics, and traces
5. **Observability**: Full picture of system health, performance, and behavior

This setup meets and exceeds the requirements for comprehensive monitoring and observability of a microservices application.
