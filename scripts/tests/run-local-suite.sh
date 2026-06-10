#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$DIR"

echo "=== Running local test suite ==="

echo "--- Unit tests ---"
yarn test:unit

echo "--- E2E tests ---"
yarn test:e2e

echo "=== All tests passed ==="
