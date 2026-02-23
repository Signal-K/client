#!/usr/bin/env bash
set -euo pipefail

# In CI/Linux containers, run Cypress through xvfb so Electron/Chromium
# does not require a pre-existing X server.
if command -v xvfb-run >/dev/null 2>&1; then
  if [[ "${CI:-}" == "true" || "${CI:-}" == "1" || "${CYPRESS_FORCE_XVFB:-}" == "1" ]]; then
    exec xvfb-run -a env -u ELECTRON_RUN_AS_NODE cypress run "$@"
  fi
fi

exec env -u ELECTRON_RUN_AS_NODE cypress run "$@"
