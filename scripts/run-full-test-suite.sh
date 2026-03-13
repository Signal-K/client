#!/bin/bash

################################################################################
# Full Test Suite Runner (Optimized)
#
# This script runs:
# 1. Local Supabase (if not already running)
# 2. All unit tests
# 3. All e2e tests (handles its own frontend build/start)
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
# 2. Run Unit Tests
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
# 3. Run E2E Tests
################################################################################

log "Running E2E tests..."
warning "This will build the frontend and run Cypress tests. This may take a few minutes."
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Set environment variable to skip user creation tests
export SKIP_USER_CREATION_TESTS=false

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
echo "  ✓ Unit Tests: Passed"
echo "  ✓ E2E Tests: Passed"
echo ""
