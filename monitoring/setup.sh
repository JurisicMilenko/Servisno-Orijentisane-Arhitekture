#!/bin/bash

echo "🚀 SOA Monitoring Setup Script"
echo "================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Install shared monitoring dependencies
echo ""
echo "📦 Installing shared monitoring dependencies..."
cd shared
npm install
cd ..

# Install in gateway
echo "📦 Installing monitoring in gateway..."
cd gateway
npm install ../shared
cd ..

# Install in tours
echo "📦 Installing monitoring in tours..."
cd tours
npm install ../shared
cd ..

# Install in purchase
echo "📦 Installing monitoring in purchase..."
cd purchase
npm install ../shared
cd ..

# Create network if doesn't exist
echo ""
echo "🌐 Creating Docker network..."
docker network create soa-net 2>/dev/null || echo "Network already exists"

# Start monitoring stack
echo ""
echo "🔍 Starting monitoring stack..."
cd monitoring
docker-compose -f docker-compose.monitoring.yml up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check status
echo ""
echo "📊 Checking monitoring services..."
docker-compose -f docker-compose.monitoring.yml ps

echo ""
echo "✅ Monitoring setup complete!"
echo ""
echo "🎯 Access the monitoring tools:"
echo "   Grafana:    http://localhost:3001 (admin/admin)"
echo "   Jaeger:     http://localhost:16686"
echo "   Prometheus: http://localhost:9090"
echo "   cAdvisor:   http://localhost:8081"
echo ""
echo "📝 Next steps:"
echo "   1. Start your application: docker-compose up -d"
echo "   2. Generate traffic: curl http://localhost:4000/api/tours"
echo "   3. View traces in Jaeger"
echo "   4. View logs in Grafana → Explore → Loki"
echo "   5. View metrics in Grafana → Dashboard → SOA Infrastructure"
echo ""
