#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$DIR"

HEADLESS=""
SPEC=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --headless) HEADLESS="--headless" ;;
    --spec) SPEC="$2"; shift ;;
    *) echo "Unknown argument: $1"; exit 1 ;;
  esac
  shift
done

if [ -n "$HEADLESS" ]; then
  yarn cypress run $([ -n "$SPEC" ] && echo "--spec $SPEC")
else
  yarn cypress run $([ -n "$SPEC" ] && echo "--spec $SPEC")
fi
