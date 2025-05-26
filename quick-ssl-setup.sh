#!/bin/bash

echo "🔒 WeParlay SSL Quick Setup"
echo "=========================="

# Check if we're on a system that supports certbot
if command -v apt-get >/dev/null 2>&1; then
    echo "📦 Installing certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot
elif command -v yum >/dev/null 2>&1; then
    echo "📦 Installing certbot..."
    sudo yum install -y certbot
elif command -v brew >/dev/null 2>&1; then
    echo "📦 Installing certbot..."
    brew install certbot
else
    echo "⚠️  Please install certbot manually for your system"
    echo "Visit: https://certbot.eff.org/instructions"
    exit 1
fi

echo ""
echo "🔐 To get SSL certificates for weparlay.io, run:"
echo "sudo certbot certonly --standalone -d weparlay.io -d www.weparlay.io"
echo ""
echo "📋 Then set these environment variables:"
echo "NODE_ENV=production"
echo "SSL_ENABLED=true"
echo "DOMAIN=weparlay.io"
echo "REDIRECT_HTTP=true"
echo ""
echo "🚀 Your WeParlay platform will then run on HTTPS!"