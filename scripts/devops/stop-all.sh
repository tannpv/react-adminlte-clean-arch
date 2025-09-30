#!/bin/bash

echo "🛑 Stopping all servers..."

# Stop backend servers (ts-node-dev)
echo "Stopping backend server..."
pkill -f 'ts-node-dev' 2>/dev/null || echo "No backend server running"

# Stop frontend servers (vite)
echo "Stopping frontend server..."
pkill -f 'vite' 2>/dev/null || echo "No frontend server running"

# Stop any remaining node processes related to our project
echo "Stopping any remaining project processes..."
pkill -f 'node.*admin' 2>/dev/null || echo "No admin processes running"
pkill -f 'node.*backend' 2>/dev/null || echo "No backend processes running"

echo "✅ All servers stopped!"

