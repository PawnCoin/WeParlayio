import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createSSLServer, getSSLConfig } from "./ssl";

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

  // Use port 5000 for production, 5173 for development
  const port = app.get("env") === "development" ? 5000 : 5000;

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

  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`🚀 WeParlay server running on HTTP port ${port}`);
  });
})();