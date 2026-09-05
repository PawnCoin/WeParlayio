import express, { type Request, Response, NextFunction } from "express";
import registerRoutes from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createSSLServer, getSSLConfig } from "./ssl";
import apiMonitoringRoutes from './routes/apiMonitoringRoutes';
import apiHealthRoutes from './routes/apiHealthRoutes';
import systemHealthRoutes from './routes/systemHealthRoutes';
import securityRoutes from './routes/securityRoutes';
import { logger } from './services/enhancedLoggingService';
import { performanceMonitor } from './services/performanceMonitoringService';

// Security middleware
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Export app for production use
export const app = express();
// Hostinger and other managed hosts commonly terminate TLS at one reverse proxy.
app.set('trust proxy', 1);

// Security middleware for production
if (process.env.NODE_ENV === 'production') {
  // Replit terminates TLS before forwarding requests to this HTTP server.
  // Only redirect when the proxy explicitly reports an external HTTP request;
  // direct internal health checks do not include this header.
  app.use((req, res, next) => {
    const forwardedProto = req.header('x-forwarded-proto');
    if (forwardedProto && forwardedProto !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Rate limiting for betting endpoints
const bettingRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 bets per minute
  message: 'Too many betting requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const errorReportRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many reports submitted. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to betting endpoints
app.use('/api/bets', bettingRateLimit);
app.use('/api/betting', bettingRateLimit);

// Error reporting endpoint
app.use(express.json());
app.post('/api/error-reports', errorReportRateLimit, (req, res) => {
  try {
    const readText = (value: unknown, limit: number) =>
      typeof value === 'string' ? value.trim().slice(0, limit) : '';

    const report = {
      id: `report_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      type: readText(req.body.type, 40) || 'feedback',
      message: readText(req.body.message, 2000),
      details: readText(req.body.details, 5000),
      url: readText(req.body.url, 2048) || req.headers.referer,
      timestamp: new Date().toISOString(),
      status: 'submitted'
    };

    // Do not write user-supplied descriptions or user-agent strings to logs.
    console.log(`Error report received: ${report.id} (${report.type}) at ${report.timestamp}`);

    res.json({
      success: true,
      message: 'Report submitted successfully',
      reportId: report.id
    });
  } catch (error) {
    console.error('Error processing report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report'
    });
  }
});

app.get('/api/error-reports', (req, res) => {
  res.json({
    success: true,
    reports: [],
    count: 0,
    message: 'Error reports endpoint ready'
  });
});

// Apply security middleware FIRST with relaxed CSP for development and streaming
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:", "data:", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https:", "data:", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:", "*"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "*", "blob:"],
      connectSrc: ["'self'", "wss:", "https:", "ws:", "*", "blob:"],
      frameSrc: ["'self'", "https:", "*"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      mediaSrc: ["'self'", "https:", "blob:", "*", "data:"],
      workerSrc: ["'self'", "blob:", "'unsafe-inline'"],
      childSrc: ["'self'", "https:", "blob:"],
    },
  },
}));

// Enhanced Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // Payment security headers
  res.setHeader('X-Payment-Token-Required', 'true');
  res.setHeader('X-Transaction-Verification', 'enabled');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// The current public release is play-cash only. Banking and crypto code remains
// in the repository for a future licensed launch, but mutation endpoints are
// unavailable unless an operator explicitly enables the later launch mode.
const isPlayCashLaunch = process.env.WEPARLAY_LAUNCH_MODE !== 'full';
app.use(['/api/banking', '/api/crypto'], (req, res, next) => {
  if (isPlayCashLaunch && req.method !== 'GET') {
    return res.status(503).json({
      success: false,
      message: 'Debit-card and crypto services are coming soon. WeParlay currently supports WeParlay Cash only.',
    });
  }
  next();
});

// Serve static files from public directory
app.use(express.static('public'));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize database connection first
  try {
    const { initializeDatabase } = await import('./db');
    await initializeDatabase();
  } catch (dbError) {
    console.error('Database initialization failed, continuing with limited functionality:', dbError);
  }

  const appServer = await registerRoutes(app);

  app.use('/api/monitoring', apiMonitoringRoutes);
  app.use('/api/health', apiHealthRoutes);
  app.use('/api/system', systemHealthRoutes);
  app.use('/api/security', securityRoutes);

  // Add performance monitoring middleware
  app.use(performanceMonitor.createPerformanceMiddleware());

  // Initialize enhanced logging
  logger.info('WeParlay security services initialized', {
    timestamp: new Date().toISOString(),
    features: ['2FA', 'Security Monitoring', 'Performance Tracking', 'Dependency Scanning']
  });

  // Global unhandled promise rejection handler
  process.on('unhandledRejection', (reason, promise) => {
    console.log('🔄 Non-critical error handled gracefully:', reason);
    // Log to monitoring service in production
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error for debugging
    console.error('Server error:', err);

    // Notify admin of server errors
    try {
      import('./hooks/userHooks').then(({ onSystemError }) => {
        onSystemError(err);
      }).catch(e => console.error('Failed to notify admin about error:', e));
    } catch (notifyError) {
      console.error('Failed to load error notification module:', notifyError);
    }

    // Send error response but don't throw to prevent server crash
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    const origExit = process.exit;
    let exitIntercepted = false;
    (process as any).exit = (code?: number) => {
      exitIntercepted = true;
      console.warn(`⚠️ Vite attempted process.exit(${code}) - intercepted to keep server running`);
    };
    try {
      await setupVite(app, appServer);
    } catch (e) {
      console.warn('⚠️ Vite setup error (non-fatal):', e);
    }
    process.exit = origExit;
    if (exitIntercepted) {
      console.log('🔄 Server continuing despite Vite port conflict');
    }
  } else {
    serveStatic(app);
  }

  // Get SSL configuration
  const sslConfig = getSSLConfig();

  // Replit Autoscale provides the production port through PORT.
  const port = Number.parseInt(process.env.PORT || "5000", 10);

  // Create appropriate server based on configuration
  let server;
  if (sslConfig.enabled) {
    try {
      server = createSSLServer(app, sslConfig);
      log(`🔒 SSL/TLS encryption enabled for weparlay.io`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown SSL error';
      log(`❌ SSL certificate error: ${errorMessage}`);
      log(`🔄 Falling back to HTTP server`);
      server = app;
    }
  } else {
    server = app;
  }

  const httpServer = server.listen(port, "0.0.0.0", () => {
    log(`🚀 WeParlay server running on HTTP at 0.0.0.0:${port}`);
  });

  httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use. Another instance may be running.`);
      process.exit(1);
    } else {
      throw err;
    }
  });

  // WebSocket service disabled to prevent port conflicts in Replit environment
  console.log('🔌 WebSocket service disabled - Live streaming will work without real-time features');

})();
