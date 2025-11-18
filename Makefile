.PHONY: help build up down restart logs status clean ps health

help: ## Show this help message
	@echo '🐳 Docker Management Commands:'
	@echo ''
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ''

build: ## Build all services
	@echo '🔨 Building services...'
	docker-compose build

up: ## Start all services
	@echo '🚀 Starting services...'
	docker-compose up -d
	@echo ''
	@echo '✅ Services started!'
	@$(MAKE) urls

down: ## Stop all services
	@echo '🛑 Stopping services...'
	docker-compose down

restart: ## Restart all services
	@echo '🔄 Restarting services...'
	docker-compose restart
	@echo '✅ Services restarted!'

logs: ## Show logs (follow)
	docker-compose logs -f

logs-service: ## Show logs for specific service (use SERVICE=name)
	docker-compose logs -f $(SERVICE)

status: ## Show service status
	@echo '📊 Service Status:'
	@docker-compose ps

ps: status ## Alias for status

clean: ## Remove all containers and volumes
	@echo '🧹 Cleaning up...'
	docker-compose down -v
	@echo '✅ Cleanup complete!'

rebuild: clean build up ## Clean rebuild and start

health: ## Check health of all services
	@echo '🏥 Health Check:'
	@echo 'Gateway:  ' && curl -s http://localhost:4000/health | jq -r '.status' || echo 'Not responding'
	@echo 'Backend:  ' && curl -s http://localhost:3000/health | jq -r '.status' || echo 'Not responding'
	@echo 'Tours:    ' && curl -s http://localhost:3002/health | jq -r '.status' || echo 'Not responding'
	@echo 'Frontend: ' && curl -s -o /dev/null -w '%{http_code}' http://localhost:8080 || echo 'Not responding'

urls: ## Show application URLs
	@echo ''
	@echo '🌐 Application URLs:'
	@echo '  Frontend:     http://localhost:8080'
	@echo '  API Gateway:  http://localhost:4000'
	@echo '  Backend:      http://localhost:3000'
	@echo '  Tours:        http://localhost:3002'
	@echo '  PostgreSQL:   localhost:5432'
	@echo '  MongoDB:      localhost:27017'
	@echo ''

shell-backend: ## Open shell in backend container
	docker exec -it soa_backend sh

shell-tours: ## Open shell in tours container
	docker exec -it soa_tours sh

shell-gateway: ## Open shell in gateway container
	docker exec -it soa_gateway sh

db-postgres: ## Connect to PostgreSQL
	docker exec -it soa_postgres psql -U postgres -d soa_demo

db-mongo: ## Connect to MongoDB
	docker exec -it soa_mongodb mongosh tours_db

dev: ## Start in development mode (with logs)
	docker-compose up --build

prod: build up ## Production deployment (build and start in background)

quick: ## Quick start (no build)
	@echo '⚡ Quick start...'
	docker-compose up -d
	@$(MAKE) urls
