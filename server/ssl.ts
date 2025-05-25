import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

export interface SSLConfig {
  enabled: boolean;
  keyPath?: string;
  certPath?: string;
  caPath?: string; // Certificate Authority chain
  port: number;
  redirectHttp?: boolean; // Redirect HTTP to HTTPS
}

export function createSSLServer(app: any, config: SSLConfig) {
  if (!config.enabled) {
    console.log('🔓 SSL disabled, using HTTP only');
    return http.createServer(app);
  }

  try {
    // SSL certificate paths (you'll need to get these from Let's Encrypt or your provider)
    const sslOptions = {
      key: fs.readFileSync(config.keyPath || '/etc/letsencrypt/live/weparlay.io/privkey.pem'),
      cert: fs.readFileSync(config.certPath || '/etc/letsencrypt/live/weparlay.io/fullchain.pem'),
      // Add certificate authority if available
      ...(config.caPath && { ca: fs.readFileSync(config.caPath) })
    };

    console.log('🔒 SSL certificates loaded successfully');
    
    const httpsServer = https.createServer(sslOptions, app);

    // Optional: Redirect HTTP to HTTPS
    if (config.redirectHttp) {
      const httpServer = http.createServer((req, res) => {
        const host = req.headers.host?.replace(/:\d+$/, ''); // Remove port if present
        const redirectUrl = `https://${host}${req.url}`;
        
        res.writeHead(301, { 
          'Location': redirectUrl,
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
        });
        res.end();
      });

      // Start HTTP redirect server on port 80
      httpServer.listen(80, () => {
        console.log('🔀 HTTP redirect server running on port 80 -> HTTPS');
      });
    }

    return httpsServer;

  } catch (error) {
    console.error('❌ SSL certificate error:', error);
    console.log('🔄 Falling back to HTTP mode...');
    return http.createServer(app);
  }
}

// Environment-based SSL configuration
export function getSSLConfig(): SSLConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = process.env.DOMAIN || 'weparlay.io';
  
  return {
    enabled: isProduction && process.env.SSL_ENABLED === 'true',
    keyPath: process.env.SSL_KEY_PATH || `/etc/letsencrypt/live/${domain}/privkey.pem`,
    certPath: process.env.SSL_CERT_PATH || `/etc/letsencrypt/live/${domain}/fullchain.pem`,
    caPath: process.env.SSL_CA_PATH,
    port: parseInt(process.env.HTTPS_PORT || '443'),
    redirectHttp: process.env.REDIRECT_HTTP === 'true'
  };
}