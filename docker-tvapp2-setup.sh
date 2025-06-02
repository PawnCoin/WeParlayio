#!/bin/bash
# TVApp2 Docker Setup Script for WeParlay IPTV Integration

echo "🚀 Setting up TVApp2 Docker container for WeParlay streaming..."

# Create directories for TVApp2 data
mkdir -p tvapp2-data/config
mkdir -p tvapp2-data/data

# Create docker-compose.yml for TVApp2
cat > docker-compose-tvapp2.yml << 'EOF'
version: '3.8'
services:
  tvapp2:
    image: ghcr.io/thebinaryninja/tvapp2:latest
    container_name: weparlay-tvapp2
    ports:
      - "5004:5004"
    volumes:
      - ./tvapp2-data/config:/app/config
      - ./tvapp2-data/data:/app/data
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=5004
    networks:
      - weparlay-network

networks:
  weparlay-network:
    driver: bridge
EOF

# Make the script executable
chmod +x docker-tvapp2-setup.sh

echo "✅ TVApp2 Docker configuration created!"
echo ""
echo "📋 Next Steps:"
echo "1. Run: docker-compose -f docker-compose-tvapp2.yml up -d"
echo "2. Wait for container to start (check with: docker logs weparlay-tvapp2)"
echo "3. Access TVApp2 web interface at: http://localhost:5004"
echo "4. Configure M3U playlist sources in the web interface"
echo "5. Add environment variables to your Replit secrets:"
echo "   - TVAPP2_HOST=localhost (or your server IP)"
echo "   - TVAPP2_PORT=5004"
echo ""
echo "🔧 To start the container:"
echo "docker-compose -f docker-compose-tvapp2.yml up -d"
echo ""
echo "📊 To check logs:"
echo "docker logs weparlay-tvapp2 -f"
echo ""
echo "🛑 To stop the container:"
echo "docker-compose -f docker-compose-tvapp2.yml down"