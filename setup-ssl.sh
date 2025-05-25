#!/bin/bash

# WeParlay.io SSL Setup Script
echo "🔒 Setting up SSL for WeParlay.io..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (use sudo)"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt update -y

# Install certbot for Let's Encrypt
echo "🛠️ Installing certbot..."
apt install -y certbot

# Stop any services running on port 80/443
echo "⏹️ Stopping services on ports 80/443..."
systemctl stop nginx apache2 2>/dev/null || true
pkill -f "node.*5000" 2>/dev/null || true

# Request SSL certificate
echo "🔐 Requesting SSL certificate for weparlay.io..."
certbot certonly --standalone \
    -d weparlay.io \
    -d www.weparlay.io \
    --non-interactive \
    --agree-tos \
    --email support@weparlay.io

# Check if certificates were created
if [ -f "/etc/letsencrypt/live/weparlay.io/fullchain.pem" ]; then
    echo "✅ SSL certificates created successfully!"
    
    # Set proper permissions
    chmod 644 /etc/letsencrypt/live/weparlay.io/fullchain.pem
    chmod 600 /etc/letsencrypt/live/weparlay.io/privkey.pem
    
    echo "📋 Certificate locations:"
    echo "  Certificate: /etc/letsencrypt/live/weparlay.io/fullchain.pem"
    echo "  Private Key: /etc/letsencrypt/live/weparlay.io/privkey.pem"
    
    echo ""
    echo "🚀 Next steps:"
    echo "1. Set environment variables:"
    echo "   NODE_ENV=production"
    echo "   SSL_ENABLED=true"
    echo "   DOMAIN=weparlay.io"
    echo "   REDIRECT_HTTP=true"
    echo ""
    echo "2. Your WeParlay app will now run on HTTPS (port 443)"
    echo "3. HTTP traffic will automatically redirect to HTTPS"
    
else
    echo "❌ Certificate creation failed!"
    echo "Please check your domain DNS settings and try again."
fi

# Set up auto-renewal
echo "🔄 Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "✅ SSL setup complete for WeParlay.io!"