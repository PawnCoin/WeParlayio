#!/bin/bash
# Quick TVApp2 Start Script

echo "🚀 Starting TVApp2 container for WeParlay streaming..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Create the Docker Compose file if it doesn't exist
if [ ! -f "docker-compose-tvapp2.yml" ]; then
    echo "📝 Creating Docker Compose configuration..."
    ./docker-tvapp2-setup.sh
fi

# Start the TVApp2 container
echo "🐳 Starting TVApp2 container..."
docker-compose -f docker-compose-tvapp2.yml up -d

# Wait for container to be ready
echo "⏳ Waiting for TVApp2 to start..."
sleep 10

# Check if container is running
if docker ps | grep -q "weparlay-tvapp2"; then
    echo "✅ TVApp2 container is running!"
    echo "🌐 Access the admin interface at: http://localhost:5004"
    echo "🔧 Configure M3U playlists in the TVApp2 interface"
    echo "🔑 Add TVAPP2_HOST=localhost and TVAPP2_PORT=5004 to your secrets"
else
    echo "❌ TVApp2 container failed to start"
    echo "📋 Check logs with: docker logs weparlay-tvapp2"
fi