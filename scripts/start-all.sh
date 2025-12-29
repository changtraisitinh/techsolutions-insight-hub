#!/bin/bash

# scripts/start-all.sh
# Simplified startup script for specific services

# Resolve root directory
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# PIDs array to keep track of background processes
PIDS=()

echo -e "${BLUE}Starting TechSolutions Insight Hub System...${NC}"

# Cleanup function
cleanup() {
    echo -e "\n${BLUE}Stopping all services...${NC}"
    for pid in "${PIDS[@]}"; do
        kill "$pid" 2>/dev/null
    done
    wait
    echo -e "${GREEN}All services stopped.${NC}"
}
trap cleanup SIGINT

# 1. Start Dashboard (Next.js)
echo -e "${GREEN}Starting Dashboard (yarn dev)...${NC}"
(cd "$ROOT_DIR/dashboard" && yarn dev) &
PIDS+=($!)

# 2. Start Maps Intelligence API (Python/FastAPI)
echo -e "${GREEN}Starting Maps Intelligence API...${NC}"
# Ensure the script is executable
chmod +x "$ROOT_DIR/services/maps-intelligence/start_api.sh"
(cd "$ROOT_DIR/services/maps-intelligence" && ./start_api.sh) &
PIDS+=($!)

# 3. Start Prisma Studio
echo -e "${GREEN}Starting Prisma Studio...${NC}"
(cd "$ROOT_DIR/infra/database" && npx prisma studio) &
PIDS+=($!)

# 4. Start Real Estate Service
echo -e "${GREEN}Starting Real Estate Service...${NC}"
(cd "$ROOT_DIR/services/realestate-service" && npm run dev) &
PIDS+=($!)

# 5. Start Agent Orchestrator
echo -e "${GREEN}Starting Agent Orchestrator...${NC}"
(cd "$ROOT_DIR/services/agent-orchestrator" && npm run dev) &
PIDS+=($!)

# Wait loop
if [ ${#PIDS[@]} -eq 0 ]; then
    echo "Nothing started."
    exit 0
fi

echo -e "${BLUE}All systems go! Access the services at:${NC}"
echo -e " - Dashboard:       http://localhost:3000"
echo -e " - Maps API:        http://localhost:8001/docs"
echo -e " - Real Estate:     http://localhost:8002"
echo -e " - Agent Orch:      http://localhost:8080"
echo -e " - Prisma Studio:   http://localhost:5555"
echo -e "${BLUE}Press Ctrl+C to stop.${NC}"

wait
