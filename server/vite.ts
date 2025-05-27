import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { nanoid } from "nanoid";

// Conditionally import vite only in development
let createViteServer: any = null;
let createLogger: any = null;
let viteConfig: any = null;

if (process.env.NODE_ENV === "development") {
  try {
    const vite = await import("vite");
    createViteServer = vite.createServer;
    createLogger = vite.createLogger;
    viteConfig = (await import("../vite.config")).default;
  } catch (error) {
    console.warn("Vite not available in production mode");
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  if (!createViteServer || !createLogger || !viteConfig) {
    throw new Error("Vite is not available - this function should only be called in development");
  }

  const viteLogger = createLogger();
  
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const staticDir = path.resolve(import.meta.dirname, '..', 'dist', 'public');

  if (!fs.existsSync(staticDir)) {
    throw new Error(
      `Could not find the build directory: ${staticDir}, make sure to build the client first`,
    );
  }

  app.use(express.static(staticDir));

  // Serve index.html for all unmatched routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });
  
  log('📦 Serving static files from ' + staticDir);
}
