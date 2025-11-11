#!/usr/bin/env bash
set -euo pipefail

# Start a simple HTTP server and auto-open the home page with cache-busting param
PORT="8000"
DIR="$(cd "$(dirname "$0")" && pwd)"

# Kill any existing server on the port (best-effort)
if lsof -i :"${PORT}" -sTCP:LISTEN -t >/dev/null 2>&1; then
  kill "$(lsof -i :"${PORT}" -sTCP:LISTEN -t)" || true
fi

cd "$DIR"
# Start server in background
python3 -m http.server "$PORT" >/dev/null 2>&1 &
SERVER_PID=$!

echo "Frontend server started on http://localhost:${PORT} (pid ${SERVER_PID})"

# Wait a moment and open the browser to a cache-busted URL
sleep 1
TS=$(date +%s)
open "http://localhost:${PORT}/home.html?v=${TS}" || true

# Wait on server
wait ${SERVER_PID}
