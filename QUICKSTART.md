# 🚀 Quick Start Guide

## Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- Git (optional, for cloning)

## 🎯 Option 1: Using Helper Scripts (Recommended)

### macOS / Linux
```bash
./docker-start.sh
```
Then select option 1 for a clean build.

### Windows
```cmd
docker-start.bat
```
Then select option 1.

## 🎯 Option 2: Using Makefile (macOS / Linux)

```bash
# Show all available commands
make help

# Build and start everything
make rebuild

# Quick start (no build)
make quick
```

## 🎯 Option 3: Using Docker Compose Directly

```bash
# Build and start all services
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 📱 Access the Application

Once services are running:
- **Frontend**: http://localhost:8080
- **API Gateway**: http://localhost:4000

### Default Credentials
- **Guide**: username: `guide`, password: `guide`
- **Admin**: username: `admin`, password: `admin`
- **Test User**: username: `test`, password: `test`

## 🛑 Stopping Services

```bash
# Using script
./docker-start.sh  # Select option 3

# Using make
make down

# Using docker-compose
docker-compose down
```

## 🧹 Clean Everything

```bash
# Using script
./docker-start.sh  # Select option 7

# Using make
make clean

# Using docker-compose
docker-compose down -v
```

## 🐛 Troubleshooting

### Ports Already in Use
If you get port conflicts:
```bash
# Stop conflicting services
# macOS/Linux
lsof -ti:4000,8080 | xargs kill -9

# Or change ports in docker-compose.yml
```

### Services Not Starting
```bash
# Check logs for specific service
docker-compose logs tours
docker-compose logs gateway

# Rebuild specific service
docker-compose up -d --build tours
```

### Database Issues
```bash
# Reset databases
docker-compose down -v
docker-compose up -d
```

## 📚 Next Steps

- Read [DOCKER_README.md](./DOCKER_README.md) for detailed documentation
- Check [README.md](./README.md) for application features
- Review architecture in docker-compose.yml

## 💡 Useful Commands

```bash
# Restart specific service
docker-compose restart tours

# View logs for specific service
docker-compose logs -f gateway

# Access database
docker exec -it soa_postgres psql -U postgres -d soa_demo
docker exec -it soa_mongodb mongosh tours_db

# Check health
curl http://localhost:4000/health
```

---

**Need help?** Check the full documentation in DOCKER_README.md
