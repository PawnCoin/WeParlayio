import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createSSLServer, getSSLConfig } from "./ssl";
import { initializeWebSocketService, websocketService } from './services/websocketService.js';
import { crashRecoveryService } from './services/crashRecoveryService';
import notificationRoutes from './routes/notificationRoutes';
import websocketPollingRoutes from './routes/websocketPollingRoutes';
import apiMonitoringRoutes from './routes/apiMonitoringRoutes';
import apiHealthRoutes from './routes/apiHealthRoutes';
import systemHealthRoutes from './routes/systemHealthRoutes';

// Export app for production use
export const app = express();
app.set('trust proxy', 1); // Trust first proxy - important for secure cookies with custom domain
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const appServer = await registerRoutes(app);

  app.use('/api/notifications', notificationRoutes);
  app.use('/api/websocket', websocketPollingRoutes);
  app.use('/api/monitoring', apiMonitoringRoutes);
  app.use('/api/health', apiHealthRoutes);
  app.use('/api/system', systemHealthRoutes);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Notify admin of server errors
    try {
      import('./hooks/userHooks').then(({ onSystemError }) => {
        onSystemError(err);
      }).catch(e => console.error('Failed to notify admin about error:', e));
    } catch (notifyError) {
      console.error('Failed to load error notification module:', notifyError);
    }

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, appServer);
  } else {
    serveStatic(app);
  }

  // Get SSL configuration
  const sslConfig = getSSLConfig();

  // Use port 5000 for both development and production
  const port = 5000;

  // Create appropriate server based on configuration
  let server;
  if (sslConfig.enabled) {
    try {
      server = createSSLServer(app, sslConfig);
      log(`🔒 SSL/TLS encryption enabled for weparlay.io`);
    } catch (error) {
      log(`❌ SSL certificate error: ${error.message}`);
      log(`🔄 Falling back to HTTP server`);
      server = app;
    }
  } else {
    server = app;
  }

  const httpServer = server.listen(port, "0.0.0.0", () => {
    log(`🚀 WeParlay server running on HTTP at 0.0.0.0:${port}`);
    
    // Start crash recovery monitoring after server is running
    crashRecoveryService.startMonitoring();
    log(`🔧 Automated crash recovery system activated`);
  });

  // Skip WebSocket initialization in development to avoid port conflicts
  if (process.env.NODE_ENV === 'production') {
    try {
      initializeWebSocketService(httpServer);
      log(`🔌 WebSocket service initialized on same port ${port}`);
    } catch (error) {
      console.error('🚨 Failed to initialize WebSocket service:', error);
    }
  } else {
    console.log('🔌 WebSocket disabled in development environment');
  }
})();

// Security middleware
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "https://www.googletagmanager.com"],
      connectSrc: ["'self'", "wss:", "https:"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
}));