#!/bin/bash
# Ecommerce Dashboard — One-Click Start
# Usage: ./start.sh

set -e

echo "========================================="
echo "  Ecommerce Command Center — Starting"
echo "========================================="
echo ""

cd "$(dirname "$0")"

# Install server dependencies if needed
if [ ! -d "server/node_modules" ]; then
  echo "[1/3] Installing server dependencies..."
  cd server && npm install && cd ..
  echo "      ✓ Server dependencies installed"
else
  echo "[1/3] Server dependencies OK"
fi

# Install client dependencies if needed
if [ ! -d "client/node_modules" ]; then
  echo "[2/3] Installing client dependencies..."
  cd client && npm install && cd ..
  echo "      ✓ Client dependencies installed"
else
  echo "[2/3] Client dependencies OK"
fi

echo "[3/3] Starting servers..."
echo ""
echo "  Backend API:  http://localhost:4000"
echo "  Frontend UI:  http://localhost:5173  ← open this in your browser"
echo ""
echo "  Press Ctrl+C to stop both servers"
echo "========================================="
echo ""

# Start server in background
cd server && node --watch index.js &
SERVER_PID=$!

# Start client in foreground
cd "$(dirname "$0")/client" && npx vite --host

# When client is stopped, also stop server
kill $SERVER_PID 2>/dev/null
