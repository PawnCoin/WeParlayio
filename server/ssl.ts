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
    // Check if files exist before trying to read them
    if (!fs.existsSync(config.keyPath!) || !fs.existsSync(config.certPath!)) {
      throw new Error(`SSL certificate files not found`);
    }
    
    // SSL certificate paths (you'll need to get these from Let's Encrypt or your provider)
    const sslOptions = {
      key: fs.readFileSync(config.keyPath!),
      cert: fs.readFileSync(config.certPath!),
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
    // Instead of throwing, return HTTP server as fallback
    return http.createServer(app);
  }
}

// Environment-based SSL configuration
export function getSSLConfig(): SSLConfig {
  // For Replit deployments, disable SSL as it's handled by the platform
  if (process.env.REPLIT || process.env.REPL_ID) {
    return {
      enabled: false,
      keyPath: '',
      certPath: '',
      caPath: '',
      port: 5000,
      redirectHttp: false
    };
  }
  
  // For custom deployments, use flexible environment variables (no hardcoded domains)
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    enabled: isProduction && process.env.SSL_ENABLED === 'true' && process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH,
    keyPath: process.env.SSL_KEY_PATH,
    certPath: process.env.SSL_CERT_PATH,
    caPath: process.env.SSL_CA_PATH,
    port: parseInt(process.env.HTTPS_PORT || '443'),
    redirectHttp: process.env.REDIRECT_HTTP === 'true'
  };
}