#!/bin/bash

# Wayfinder Main Launch Script

# 1. Detect Local IP
IP=$(hostname -I | awk '{print $1}')
if [ -z "$IP" ]; then
    IP="localhost"
fi

echo "=========================================="
echo "🧭 Wayfinder Launch System"
echo "📍 Detected Host IP: $IP"
echo "=========================================="

# 2. Setup Cleanup Trap
trap 'kill 0' EXIT

# 3. Start Backend
echo "🚀 Starting Backend Server..."
cd backend
# Ensure dependencies are installed if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi
# Run backend
npm run dev &
cd ..

# 4. Start Frontend
echo "🚀 Starting Frontend Server..."
cd frontend
# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Write Local IP to .env.local so Vite can pick it up
echo "VITE_LOCAL_IP=$IP" > .env.local
echo "📝 Injected VITE_LOCAL_IP=$IP into frontend/.env.local"

# Run frontend with --host to expose to network
# Pass --host 0.0.0.0 to vite
npm run dev -- --host &
cd ..

# 5. Display Access Info
echo "---------------------------------------------------"
echo "✅ servers are starting up..."
echo "---------------------------------------------------"
echo "👉 Access on this machine: http://localhost:5173"
echo "👉 Access on Mobile (QR):  http://$IP:5173"
echo "---------------------------------------------------"
echo "Press Ctrl+C to stop all servers."

# Keep script running
wait
