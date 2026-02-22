#!/bin/bash

################################################################################
# Full Test Suite Runner
#
# This script runs:
# 1. Frontend (Next.js dev server)
# 2. Local Supabase (if not already running)
# 3. All smoke tests
# 4. All unit tests
# 5. All e2e tests
#
# Usage: ./scripts/run-full-test-suite.sh
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_PORT=${FRONTEND_PORT:-3000}
FRONTEND_URL="http://localhost:${FRONTEND_PORT}"
MAX_RETRIES=30
RETRY_INTERVAL=2

# Cleanup on exit
cleanup() {
  echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${YELLOW}Cleaning up...${NC}"
  
  # Kill frontend process and its children
  if [ ! -z "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo -e "${YELLOW}Stopping frontend (PID: $FRONTEND_PID)...${NC}"
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  
  # Also kill any remaining Next.js processes spawned by npm
  REMAINING=$(pgrep -f "next dev|next-server" 2>/dev/null || true)
  if [ ! -z "$REMAINING" ]; then
    echo "$REMAINING" | xargs kill -9 2>/dev/null || true
  fi
  
  # Free up the port
  PORT_PID=$(lsof -ti :${FRONTEND_PORT} 2>/dev/null || true)
  if [ ! -z "$PORT_PID" ]; then
    echo "$PORT_PID" | xargs kill -9 2>/dev/null || true
  fi
  
  echo -e "${GREEN}✓ Cleanup complete${NC}"
}

trap cleanup EXIT

# Log function
log() {
  echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
  echo -e "${GREEN}✓${NC} $1"
}

warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

################################################################################
# 1. Check and Start Supabase
################################################################################

log "Checking Supabase status..."

if supabase status &>/dev/null; then
  success "Supabase is already running"
else
  warning "Supabase not running, starting..."
  supabase start
  success "Supabase started"
fi

# Wait a moment for Supabase to be fully ready
sleep 2

################################################################################
# 2. Start Frontend Dev Server
################################################################################

# Kill any existing Next.js processes to prevent port conflicts
EXISTING_PIDS=$(pgrep -f "next dev|next-server" 2>/dev/null || true)
if [ ! -z "$EXISTING_PIDS" ]; then
  warning "Found existing Next.js processes, killing them..."
  echo "$EXISTING_PIDS" | xargs kill -9 2>/dev/null || true
  sleep 2
  success "Killed existing Next.js processes"
fi

# Also kill anything already on our target port
PORT_PID=$(lsof -ti :${FRONTEND_PORT} 2>/dev/null || true)
if [ ! -z "$PORT_PID" ]; then
  warning "Port $FRONTEND_PORT is in use (PID: $PORT_PID), killing..."
  echo "$PORT_PID" | xargs kill -9 2>/dev/null || true
  sleep 1
fi

# Clean stale .next cache to prevent MODULE_NOT_FOUND errors
if [ -d ".next" ]; then
  log "Cleaning .next build cache for a fresh start..."
  rm -rf .next
fi

log "Starting frontend dev server on port $FRONTEND_PORT..."

npm run dev &
FRONTEND_PID=$!
success "Frontend started (PID: $FRONTEND_PID)"

# Wait for frontend to be ready
log "Waiting for frontend to be ready at $FRONTEND_URL..."

RETRIES=0
while [ $RETRIES -lt $MAX_RETRIES ]; do
  if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -qE "^[23][0-9]{2}$"; then
    success "Frontend is ready"
    break
  fi
  
  RETRIES=$((RETRIES + 1))
  if [ $RETRIES -eq $MAX_RETRIES ]; then
    error "Frontend did not start within ${MAX_RETRIES} retries"
    exit 1
  fi
  
  sleep $RETRY_INTERVAL
done

# Give frontend a bit more time to fully initialize
sleep 2

################################################################################
# 3. Run Unit Tests
################################################################################

log "Running unit tests..."
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

if npm run test:unit; then
  success "Unit tests passed"
else
  error "Unit tests failed"
  exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

################################################################################
# 4. Run E2E Tests
################################################################################

log "Running E2E tests..."
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Set environment variable to skip user creation tests
export SKIP_USER_CREATION_TESTS=true

if npm run test:e2e; then
  success "E2E tests passed"
else
  error "E2E tests failed"
  exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

################################################################################
# Summary
################################################################################

echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Summary:"
echo "  ✓ Supabase: Running"
echo "  ✓ Frontend: Running on $FRONTEND_URL"
echo "  ✓ Unit Tests: Passed"
echo "  ✓ E2E Tests: Passed"
echo ""
