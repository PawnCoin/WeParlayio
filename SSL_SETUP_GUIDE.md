# 🔒 WeParlay SSL Setup Guide

## Quick Setup Steps

### 1. Make the setup script executable
```bash
chmod +x setup-ssl.sh
```

### 2. Run the SSL setup script
```bash
sudo ./setup-ssl.sh
```

This will:
- Install certbot
- Request SSL certificates for weparlay.io and www.weparlay.io
- Set up auto-renewal
- Configure proper permissions

### 3. Set environment variables for production

Add these to your deployment environment (Replit Secrets or server environment):

```
NODE_ENV=production
SSL_ENABLED=true
DOMAIN=weparlay.io
REDIRECT_HTTP=true
HTTPS_PORT=443
```

### 4. Deploy your app

Your WeParlay platform will now:
- ✅ Run on HTTPS (port 443)
- ✅ Automatically redirect HTTP to HTTPS
- ✅ Use proper SSL certificates for weparlay.io
- ✅ Auto-renew certificates every 90 days

## Alternative: Manual Certificate Setup

If you have your own SSL certificates, set these environment variables instead:

```
SSL_CERT_PATH=/path/to/your/certificate.crt
SSL_KEY_PATH=/path/to/your/private.key
SSL_CA_PATH=/path/to/your/ca-bundle.crt (optional)
```

## Verification

After setup, your site will be accessible at:
- https://weparlay.io ✅
- https://www.weparlay.io ✅
- http://weparlay.io → redirects to HTTPS ✅

## Troubleshooting

1. **Domain not pointing to server**: Ensure your DNS A record points to your server IP
2. **Port 80/443 blocked**: Check firewall settings
3. **Certificate validation failed**: Verify domain ownership and DNS propagation

Your WeParlay platform is now production-ready with enterprise-grade SSL security! 🚀