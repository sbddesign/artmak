#!/bin/bash

# Artmak Quick Start Script
echo "🎮 Starting Artmak Multiplayer Blob Game..."
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
    echo ""
fi

# Create environment files if they don't exist
if [ ! -f "packages/client/.env" ]; then
    echo "📝 Creating client environment file..."
    cp packages/client/env.example packages/client/.env
fi

if [ ! -f "packages/server/.env" ]; then
    echo "📝 Creating server environment file..."
    cp packages/server/env.example packages/server/.env
fi

echo "🚀 Starting development servers..."
echo "   Client: http://localhost:3000"
echo "   Server: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start the development servers
pnpm dev
