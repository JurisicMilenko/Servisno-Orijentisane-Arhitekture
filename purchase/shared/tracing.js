const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const serviceName = process.env.SERVICE_NAME || 'unknown-service';
const jaegerEndpoint = process.env.JAEGER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';

const traceExporter = new OTLPTraceExporter({
  url: jaegerEndpoint,
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
  }),
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

// Start SDK
try {
  sdk.start();
  console.log(`[${serviceName}] OpenTelemetry tracing initialized`);
} catch (error) {
  console.error(`[${serviceName}] Error initializing OpenTelemetry:`, error);
}

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});

module.exports = sdk;
