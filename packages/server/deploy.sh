#!/bin/bash

# Artmak Server Deployment Script
# This script helps deploy the server to a Digital Ocean droplet

set -e

echo "🚀 Starting Artmak Server Deployment..."

# Check if required environment variables are set
if [ -z "$SERVER_HOST" ]; then
    echo "❌ Error: SERVER_HOST environment variable is required"
    echo "Usage: SERVER_HOST=your-server.com ./deploy.sh"
    exit 1
fi

if [ -z "$CLIENT_URL" ]; then
    echo "❌ Error: CLIENT_URL environment variable is required"
    echo "Usage: CLIENT_URL=https://your-netlify-app.netlify.app ./deploy.sh"
    exit 1
fi

echo "📦 Building server..."
cd packages/server
pnpm build

echo "🐳 Building Docker image..."
docker build -t artmak-server .

echo "📤 Deploying to server..."
# Copy files to server
scp -r . $SERVER_HOST:/opt/artmak-server/

# Deploy on server
ssh $SERVER_HOST << EOF
cd /opt/artmak-server
export CLIENT_URL=$CLIENT_URL
docker-compose down
docker-compose up -d --build
docker-compose logs -f
EOF

echo "✅ Deployment complete!"
echo "🌐 Server should be running at: http://$SERVER_HOST:3002"
echo "🔍 Check health: http://$SERVER_HOST:3002/health"
