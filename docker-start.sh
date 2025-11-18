#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🐳 Turistička Aplikacija - Docker Deployment${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running!${NC}"
        echo -e "${YELLOW}Please start Docker Desktop or Docker daemon and try again.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker is running${NC}"
}

# Function to clean up old containers and volumes
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up old containers and volumes...${NC}"
    docker-compose down -v
    echo -e "${GREEN}✓ Cleanup complete${NC}"
}

# Function to build and start services
start_services() {
    echo -e "${BLUE}🔨 Building services...${NC}"
    docker-compose build

    echo -e "${BLUE}🚀 Starting services...${NC}"
    docker-compose up -d

    echo ""
    echo -e "${GREEN}✓ All services started!${NC}"
    echo ""
}

# Function to show service status
show_status() {
    echo -e "${BLUE}📊 Service Status:${NC}"
    docker-compose ps
    echo ""
}

# Function to show URLs
show_urls() {
    echo -e "${BLUE}🌐 Application URLs:${NC}"
    echo -e "  ${GREEN}Frontend:${NC}     http://localhost:8080"
    echo -e "  ${GREEN}API Gateway:${NC}  http://localhost:4000"
    echo -e "  ${GREEN}Backend:${NC}      http://localhost:3000"
    echo -e "  ${GREEN}Tours:${NC}        http://localhost:3002"
    echo -e "  ${GREEN}PostgreSQL:${NC}   localhost:5432"
    echo -e "  ${GREEN}MongoDB:${NC}      localhost:27017"
    echo ""
}

# Function to show logs
show_logs() {
    echo -e "${BLUE}📋 Following logs (Ctrl+C to stop)...${NC}"
    docker-compose logs -f
}

# Main menu
main_menu() {
    echo -e "${YELLOW}Select an option:${NC}"
    echo "  1) Start services (clean build)"
    echo "  2) Start services (quick start)"
    echo "  3) Stop services"
    echo "  4) Restart services"
    echo "  5) Show logs"
    echo "  6) Show status"
    echo "  7) Clean up (remove all data)"
    echo "  8) Exit"
    echo ""
    read -p "Enter option [1-8]: " option

    case $option in
        1)
            check_docker
            cleanup
            start_services
            show_status
            show_urls
            ;;
        2)
            check_docker
            echo -e "${BLUE}🚀 Starting services...${NC}"
            docker-compose up -d
            show_status
            show_urls
            ;;
        3)
            echo -e "${YELLOW}🛑 Stopping services...${NC}"
            docker-compose down
            echo -e "${GREEN}✓ Services stopped${NC}"
            ;;
        4)
            echo -e "${YELLOW}🔄 Restarting services...${NC}"
            docker-compose restart
            echo -e "${GREEN}✓ Services restarted${NC}"
            show_status
            ;;
        5)
            show_logs
            ;;
        6)
            show_status
            show_urls
            ;;
        7)
            cleanup
            echo -e "${GREEN}✓ All data removed${NC}"
            ;;
        8)
            echo -e "${GREEN}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option${NC}"
            exit 1
            ;;
    esac
}

# Run main menu
main_menu
