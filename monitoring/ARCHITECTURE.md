# SOA Monitoring Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MONITORING STACK                          │
│  (monitoring/docker-compose.monitoring.yml)                      │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Jaeger    │  │ Prometheus  │  │   Grafana   │             │
│  │  :16686     │  │   :9090     │  │    :3001    │             │
│  │             │  │             │  │             │             │
│  │  Traces UI  │  │  Metrics DB │  │ Dashboards  │             │
│  └──────▲──────┘  └──────▲──────┘  └──────▲──────┘             │
│         │                 │                 │                    │
│    OTLP HTTP         Scraping         Data Sources             │
│     :4318            /metrics           (Prom/Loki/Jaeger)      │
│         │                 │                 │                    │
│  ┌──────┴──────┐  ┌───────┴────────┐  ┌────┴─────┐            │
│  │             │  │   cAdvisor      │  │   Loki   │            │
│  │             │  │     :8080       │  │  :3100   │            │
│  │             │  │  (container     │  │ (logs DB)│            │
│  │             │  │   metrics)      │  └────▲─────┘            │
│  │             │  └─────────────────┘       │                   │
│  │             │  ┌─────────────────┐       │                   │
│  │             │  │ node-exporter   │       │                   │
│  │             │  │     :9100       │       │ Push logs         │
│  │             │  │  (host metrics) │  ┌────┴─────┐            │
│  │             │  └─────────────────┘  │ Promtail │            │
│  │             │                        │  :9080   │            │
│  │             │                        │ (shipper)│            │
│  │             │                        └────▲─────┘            │
└──┼─────────────┼─────────────────────────────┼──────────────────┘
   │             │                             │
   │ Trace export│ Expose /metrics             │ Read container logs
   │             │                             │
┌──┴─────────────┴─────────────────────────────┴──────────────────┐
│                     APPLICATION LAYER                             │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Gateway (:4000)                                         │    │
│  │  • OpenTelemetry instrumented                            │    │
│  │  • Pino structured logging                               │    │
│  │  • Prometheus metrics at /metrics                        │    │
│  │  • ENV: SERVICE_NAME=gateway                             │    │
│  │         JAEGER_OTLP_ENDPOINT=http://jaeger:4318/v1/traces│   │
│  └──────────────────┬───────────────────────────────────────┘    │
│                     │ Proxies requests                            │
│          ┌──────────┼──────────┐                                 │
│          │          │          │                                 │
│  ┌───────▼─────┐ ┌──▼────────┐ ┌──▼────────┐                   │
│  │   Tours     │ │ Purchase  │ │  Backend  │                   │
│  │   :3002     │ │  :3004    │ │   :3000   │                   │
│  │             │ │           │ │           │                   │
│  │ • OTel inst.│ │ • OTel    │ │           │                   │
│  │ • Pino logs │ │ • Pino    │ │           │                   │
│  │ • Prom /met │ │ • Prom    │ │           │                   │
│  │ • MongoDB   │ │ • MongoDB │ │ • PG SQL  │                   │
│  └─────────────┘ └───────────┘ └───────────┘                   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Tracing Flow

```
┌──────┐
│ User │
└───┬──┘
    │ HTTP Request
    ▼
┌─────────────┐  Trace Context (traceparent header)
│   Gateway   ├────────────────────────────────────┐
│             │                                     │
│ Creates span│                                     ▼
│ trace_id: X │                              ┌──────────┐
└──────┬──────┘                              │  Tours   │
       │                                     │          │
       │ Exports spans                       │ Child    │
       │ (OTLP HTTP)                         │ span     │
       ▼                                     └────┬─────┘
┌──────────┐                                     │
│  Jaeger  │                                     │ Exports spans
│  Collect │◄────────────────────────────────────┘
│          │
│ Stores   │
│ trace_id,│
│ spans,   │
│ timing   │
└──────────┘
       │
       │ Query traces
       ▼
┌──────────┐
│ Jaeger UI│
│ :16686   │
└──────────┘
```

### 2. Logging Flow

```
┌─────────────┐
│   Gateway   │
│             │
│ logger.info()
│   ↓         │
│ { msg,      │
│   trace_id, │──┐
│   service,  │  │ Write to stdout
│   timestamp }  │
└─────────────┘  │
                 ▼
         ┌───────────────┐
         │ Docker stdout │
         └───────┬───────┘
                 │
                 │ Reads container logs
                 ▼
         ┌───────────────┐
         │   Promtail    │
         │               │
         │ • Scrapes     │
         │   container   │
         │   logs        │
         │ • Adds labels │
         └───────┬───────┘
                 │ Push logs
                 ▼
         ┌───────────────┐
         │     Loki      │
         │               │
         │ Stores logs   │
         │ with labels   │
         └───────┬───────┘
                 │
                 │ Query logs
                 ▼
         ┌───────────────┐
         │    Grafana    │
         │    Explore    │
         │               │
         │ {trace_id="X"}│
         └───────────────┘
```

### 3. Metrics Flow

```
┌─────────────┐
│   Gateway   │
│             │
│ Middleware  │
│   records   │
│   metrics   │──┐
│             │  │
│ GET /metrics│  │ Prometheus client
└─────────────┘  │ aggregates metrics
                 ▼
         ┌───────────────────┐
         │ Prometheus Metrics│
         │                   │
         │ • http_requests   │
         │ • http_duration   │
         │ • nodejs_*        │
         └─────────┬─────────┘
                   │
                   │ Scraped by Prometheus
                   ▼
         ┌───────────────────┐
         │    Prometheus     │
         │                   │
         │ Scrapes:          │
         │ • gateway:4000    │
         │ • tours:3002      │
         │ • purchase:3004   │
         │ • cadvisor:8080   │
         │ • node-exp:9100   │
         └─────────┬─────────┘
                   │
                   │ Query metrics
                   ▼
         ┌───────────────────┐
         │     Grafana       │
         │    Dashboards     │
         │                   │
         │ Visualizes:       │
         │ • Request rate    │
         │ • Latency         │
         │ • CPU/Memory      │
         └───────────────────┘
```

### 4. Host Metrics Collection

```
┌─────────────────┐
│   Host Machine  │
│                 │
│ • CPU cores     │
│ • Memory        │
│ • Disk          │
│ • Network NICs  │
└────────┬────────┘
         │
         │ Exposes /proc, /sys
         ▼
┌─────────────────┐
│ node-exporter   │
│   :9100         │
│                 │
│ Reads:          │
│ • /proc/stat    │
│ • /proc/meminfo │
│ • /proc/diskstat│
│ • /proc/net/dev │
└────────┬────────┘
         │
         │ GET /metrics
         ▼
┌─────────────────┐
│   Prometheus    │
│                 │
│ Scrapes every   │
│ 15 seconds      │
└─────────────────┘
```

### 5. Container Metrics Collection

```
┌─────────────────────────────────────┐
│      Docker Engine                   │
│                                      │
│  ┌──────────┐  ┌──────────┐         │
│  │ Gateway  │  │  Tours   │  ...    │
│  │ Container│  │ Container│         │
│  └──────────┘  └──────────┘         │
│                                      │
│  /var/lib/docker/containers/...     │
└──────────────┬───────────────────────┘
               │
               │ Reads cgroup metrics
               ▼
┌─────────────────────────────────────┐
│         cAdvisor :8080               │
│                                      │
│ Monitors:                            │
│ • container_cpu_usage_seconds_total  │
│ • container_memory_usage_bytes       │
│ • container_network_*_bytes_total    │
│ • container_fs_*_bytes               │
└──────────────┬───────────────────────┘
               │
               │ GET /metrics
               ▼
┌─────────────────────────────────────┐
│          Prometheus                  │
│                                      │
│ Stores time-series per container     │
└─────────────────────────────────────┘
```

## Component Responsibilities

### Application Services
- **Gateway** (port 4000)
  - Entry point for all API requests
  - Creates root span for each request
  - Propagates trace context to downstream services
  - Logs structured JSON with trace IDs
  - Exposes /metrics endpoint

- **Tours** (port 3002)
  - Receives trace context from gateway
  - Creates child spans for operations
  - Logs with inherited trace ID
  - Exposes /metrics endpoint

- **Purchase** (port 3004)
  - Same instrumentation as Tours
  - Independent MongoDB operations traced

### Monitoring Services

- **Jaeger** (port 16686)
  - Receives traces via OTLP HTTP (port 4318)
  - Stores traces in memory (or configurable backend)
  - Provides UI for trace visualization
  - Shows request flow, timing, errors

- **Prometheus** (port 9090)
  - Scrapes /metrics endpoints every 15s
  - Stores time-series data
  - Provides query language (PromQL)
  - Configured via prometheus.yml

- **Grafana** (port 3001)
  - Connects to Prometheus (metrics)
  - Connects to Loki (logs)
  - Connects to Jaeger (traces)
  - Provides dashboards and Explore interface
  - Pre-configured data sources

- **Loki** (port 3100)
  - Receives logs from Promtail
  - Indexes by labels (service, container, etc.)
  - Provides query interface (LogQL)
  - Stores logs efficiently

- **Promtail** (port 9080)
  - Discovers Docker containers
  - Reads container stdout/stderr
  - Adds labels (service name, container ID)
  - Pushes logs to Loki

- **cAdvisor** (port 8080)
  - Monitors Docker daemon
  - Collects per-container metrics
  - Exposes metrics in Prometheus format
  - Updates metrics continuously

- **node-exporter** (port 9100)
  - Runs on host (or in privileged container)
  - Reads /proc, /sys filesystems
  - Exposes host metrics in Prometheus format
  - Provides CPU, memory, disk, network stats

## Network Architecture

```
soa-net (Docker bridge network)
├── Application containers
│   ├── gateway (can call: tours, purchase, jaeger)
│   ├── tours (can call: mongodb, jaeger)
│   ├── purchase (can call: mongodb, jaeger)
│   └── mongodb
│
└── Monitoring containers
    ├── jaeger (receives traces from all services)
    ├── prometheus (scrapes all services + cadvisor + node-exporter)
    ├── grafana (queries prometheus, loki, jaeger)
    ├── loki (receives logs from promtail)
    ├── promtail (reads Docker socket, pushes to loki)
    ├── cadvisor (reads Docker socket, scraped by prometheus)
    └── node-exporter (reads host metrics, scraped by prometheus)
```

## Port Map

| Service | Port | Purpose |
|---------|------|---------|
| Gateway | 4000 | API Gateway |
| Backend | 3000 | Auth & Attractions |
| Stakeholders | 3001 | Stakeholders service |
| Tours | 3002 | Tours service |
| Purchase | 3004 | Purchase service |
| Jaeger UI | 16686 | Trace visualization |
| Jaeger Collector | 4318 | OTLP HTTP receiver |
| Prometheus | 9090 | Metrics database & UI |
| Grafana | 3001 | Dashboards & visualization |
| Loki | 3100 | Log storage |
| Promtail | 9080 | Log shipper |
| cAdvisor | 8081 | Container metrics UI |
| node-exporter | 9100 | Host metrics exporter |

## Key Integration Points

1. **Trace Context Propagation**
   - HTTP headers: `traceparent`, `tracestate`
   - Auto-injected by OpenTelemetry instrumentation
   - Preserved across service calls

2. **Log-Trace Correlation**
   - Pino logger mixin extracts trace_id from active span
   - Every log entry includes trace_id
   - Searchable in Loki by trace_id

3. **Metrics Cardinality**
   - Limited labels to avoid explosion
   - Use route patterns, not actual URLs
   - Service name, method, status code only

4. **Resource Discovery**
   - Prometheus: static_configs in prometheus.yml
   - Promtail: docker_sd_configs (auto-discovers containers)
   - cAdvisor: watches Docker socket

## Security Considerations

- Grafana default credentials: admin/admin (change in production)
- All services in same Docker network (not exposed to internet)
- Metrics endpoints don't require authentication (internal only)
- Trace data may contain sensitive information (review before production)

## Performance Impact

- **Tracing overhead**: ~1-5% CPU, minimal memory
- **Logging overhead**: ~2-10% CPU (depends on log volume)
- **Metrics overhead**: ~1-3% CPU, small memory footprint
- **Monitoring stack**: ~2-4GB RAM total for all monitoring services

## Scalability Notes

- Current setup: single-host, development/demo
- For production:
  - Use external Jaeger backend (Cassandra, Elasticsearch)
  - Scale Loki with distributed mode
  - Use Prometheus federation or Thanos for multi-cluster
  - Implement trace sampling (not all traces)
  - Set log retention policies
