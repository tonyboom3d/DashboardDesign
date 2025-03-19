import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

import { setupVite, serveStatic, log } from "./vite";

const app = express();
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

// Immediately start the server to reduce startup time
(async () => {
  try {
    // Set up routes first
    const server = await registerRoutes(app);

    // Error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error(err);
    });

    // Set up Vite for development or serve static files for production
    if (app.get("env") === "development") {
      setupVite(app, server).catch(err => {
        console.error("Vite setup error:", err);
      });
    } else {
      serveStatic(app);
    }

    // Start the server immediately with port fallback
    const startServer = (port: number, maxRetries = 3, retryCount = 0) => {
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`serving on port ${port}`);
      }).on('error', (err: any) => {
        if (err.code === 'EADDRINUSE' && retryCount < maxRetries) {
          log(`Port ${port} is in use, trying ${port + 1}...`);
          // Try the next port
          startServer(port + 1, maxRetries, retryCount + 1);
        } else {
          console.error(`Failed to start server:`, err);
        }
      });
    };
    
    // Start with default port 5000
    startServer(5000);
  } catch (error) {
    console.error("Server startup error:", error);
  }
})();
