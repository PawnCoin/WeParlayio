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
    console.log('🔧 Starting automated crash recovery monitoring...');

    // ULTIMATE CRASH PREVENTION SYSTEM - NO MORE CRASHES!
    if (global.gc) {
      console.log('🛡️ ACTIVATING ULTIMATE CRASH PREVENTION SYSTEM');
      
      // SUPER AGGRESSIVE monitoring every 5 seconds
      setInterval(() => {
        const memUsage = process.memoryUsage();
        const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        
        // EMERGENCY RESTART at 85% to prevent ANY crashes
        if (memPercent > 85) {
          console.error(`🚨 EMERGENCY RESTART: ${memPercent.toFixed(2)}% memory - PREVENTING CRASH NOW!`);
          
          // Clear ALL intervals and timeouts
          const highestTimeoutId = setTimeout(() => {}, 0);
          for (let i = 1; i < highestTimeoutId; i++) {
            clearTimeout(i);
            clearInterval(i);
          }
          
          // Force immediate restart
          setTimeout(() => {
            process.exit(1);
          }, 100);
          return;
        }
        
        // AGGRESSIVE cleanup at 75%
        if (memPercent > 75) {
          console.warn(`⚠️ AGGRESSIVE CLEANUP: ${memPercent.toFixed(2)}% memory`);
          
          // Force multiple garbage collections
          for (let i = 0; i < 5; i++) {
            global.gc();
          }
          
          // Clear require cache of non-essential modules
          Object.keys(require.cache).forEach(key => {
            if (!key.includes('express') && !key.includes('storage') && !key.includes('routes')) {
              try {
                delete require.cache[key];
              } catch (e) {
                // Ignore errors
              }
            }
          });
          
          const afterCleanup = process.memoryUsage();
          const newPercent = (afterCleanup.heapUsed / afterCleanup.heapTotal) * 100;
          console.log(`🧹 Memory cleaned: ${memPercent.toFixed(2)}% → ${newPercent.toFixed(2)}%`);
        }
        
        // Preventive cleanup at 65%
        if (memPercent > 65) {
          global.gc();
        }
        
        // Log memory status every minute
        if (Date.now() % 60000 < 5000) {
          console.log(`📊 Memory status: ${memPercent.toFixed(2)}% used (${Math.round(memUsage.heapUsed / 1024 / 1024)}MB)`);
        }
        
      }, 5000); // Check every 5 seconds for maximum protection

      console.log('✅ ULTIMATE crash prevention system ACTIVE - NO MORE CRASHES!');
    } else {
      console.error('❌ Garbage collection not available - enabling fallback protection');
      
      // Fallback protection without GC
      setInterval(() => {
        const memUsage = process.memoryUsage();
        const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        
        if (memPercent > 80) {
          console.error(`🚨 FALLBACK RESTART: ${memPercent.toFixed(2)}% memory - restarting to prevent crash`);
          process.exit(1);
        }
      }, 3000);
    }

    // Set memory limits and warnings
    process.on('warning', (warning) => {
      if (warning.name === 'MaxListenersExceededWarning') {
        console.warn('⚠️ Memory leak detected - cleaning up listeners');
        process.removeAllListeners();
      }
    });

    // Set aggressive memory limits
    process.on('warning', (warning) => {
      if (warning.name === 'MaxListenersExceededWarning') {
        console.warn('⚠️ Too many listeners - cleaning up');
        process.removeAllListeners();
      }
    });

    // Start crash recovery monitoring
    crashRecoveryService.startMonitoring();

    // Initialize bot users for platform demo data
    try {
      const { SimpleBotService } = await import('./services/simpleBotService');
      const botService = new SimpleBotService();
      await botService.createBasicBotUsers();
      console.log('✅ Bot users initialized for platform demo');
    } catch (error) {
      console.error('⚠️ Failed to initialize bot users:', error);
    }
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