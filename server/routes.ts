import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShippingBarSettingsSchema, updateShippingBarSettingsSchema, defaultShippingBarSettings } from "@shared/schema";
import { z } from "zod";

// Middleware to validate Wix integration tokens
function validateWixToken(req: Request, res: Response, next: NextFunction) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  // Check for instance ID in different places
  // 1. First check query parameters (for GET requests)
  const queryInstanceId = req.query.instanceId as string;
  if (queryInstanceId) {
    // Set the instanceId in the request object for later use
    (req as any).instanceId = queryInstanceId;
    console.log(`[Wix API] Using instanceId from query: ${queryInstanceId}`);
    return next();
  }
  
  // 2. Check Authorization header
  if (authHeader) {
    // Basic validation - check if the token exists and has expected format
    if (authHeader.startsWith('Instance ')) {
      // Extract the token
      const token = authHeader.substring(9);
      
      // Set token in request for later use
      (req as any).wixToken = token;
      
      // Try to extract instance ID from token
      try {
        // For JWT tokens: token parts are header.payload.signature
        const parts = token.split('.');
        if (parts.length > 1) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          if (payload.instanceId) {
            (req as any).instanceId = payload.instanceId;
            console.log(`[Wix API] Extracted instanceId from JWT: ${payload.instanceId}`);
          }
        }
      } catch (e) {
        console.log('[Wix API] Could not extract instanceId from token', e);
      }
      
      return next();
    }
  }
  
  // 3. For development/demo purposes, allow without tokens
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Wix API] No token provided, allowing in development mode');
    return next();
  }
  
  // Invalid token format
  return res.status(401).json({ message: "Invalid authorization token" });
}

// Extract Wix instance ID from various sources
function getInstanceId(req: Request): string | undefined {
  // Try to get from URL parameter
  const paramInstanceId = req.params.instanceId;
  if (paramInstanceId) return paramInstanceId;
  
  // Try to get from request body
  const bodyInstanceId = req.body?.instanceId;
  if (bodyInstanceId) return bodyInstanceId;
  
  // Try to get from query parameter
  const queryInstanceId = req.query.instance as string;
  if (queryInstanceId) return queryInstanceId;
  
  // No instance ID found
  return undefined;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable CORS for Wix domains
  app.use((req, res, next) => {
    const allowedOrigins = [
      'https://manage.wix.com',
      'https://editor.wix.com',
      'https://www.wix.com'
    ];
    
    const origin = req.headers.origin;
    
    // Allow from local development and Wix domains
    if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });
  // API Routes for shipping bar settings
  
  // Get settings by instance ID
  app.get("/api/settings/:instanceId", async (req, res) => {
    try {
      const instanceId = req.params.instanceId;
      
      if (!instanceId) {
        return res.status(400).json({ message: "Instance ID is required" });
      }
      
      let settings = await storage.getSettingsByInstanceId(instanceId);
      
      // If settings don't exist, create default settings
      if (!settings) {
        const defaultSettings = {
          ...defaultShippingBarSettings,
          instanceId
        };
        
        settings = await storage.createSettings(defaultSettings);
      }
      
      return res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      return res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  
  // Create or update settings
  app.post("/api/settings", async (req, res) => {
    try {
      // Validate request body
      const validationResult = updateShippingBarSettingsSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid settings data", 
          errors: validationResult.error.format() 
        });
      }
      
      const { instanceId } = validationResult.data;
      
      // Check if settings already exist
      const existingSettings = await storage.getSettingsByInstanceId(instanceId);
      
      let settings;
      
      if (existingSettings) {
        // Update existing settings
        settings = await storage.updateSettings(validationResult.data);
      } else {
        // Create new settings
        const newSettings = {
          ...defaultShippingBarSettings,
          ...validationResult.data,
        };
        
        settings = await storage.createSettings(newSettings);
      }
      
      return res.json(settings);
    } catch (error) {
      console.error("Error saving settings:", error);
      return res.status(500).json({ message: "Failed to save settings" });
    }
  });
  
  // Mock endpoint for products (in a real implementation this would connect to Wix CMS)
  app.get("/api/products", (req, res) => {
    const query = req.query.query?.toString().toLowerCase() || "";
    
    const sampleProducts = [
      { id: "1", name: "Leather Wallet", price: 1999, imageUrl: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" },
      { id: "2", name: "Cotton T-Shirt", price: 1499, imageUrl: "https://images.unsplash.com/photo-1543512214-318c7553f230?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" },
      { id: "3", name: "Phone Case", price: 1299, imageUrl: "https://images.unsplash.com/photo-1560343090-f0409e92791a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" },
      { id: "4", name: "Sunglasses", price: 2499, imageUrl: "https://images.unsplash.com/photo-1565620731358-e8c038abc8d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" },
      { id: "5", name: "Handmade Soap", price: 799, imageUrl: "https://images.unsplash.com/photo-1613333835718-9b8b24e92939?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" },
    ];
    
    // Filter products by query if provided
    const filtered = query 
      ? sampleProducts.filter(p => p.name.toLowerCase().includes(query))
      : sampleProducts;
    
    return res.json({ products: filtered });
  });
  
  // === Wix Integration API Routes ===
  
  // Apply Wix token validation middleware to all Wix API routes
  const wixApiRouter = express.Router();
  wixApiRouter.use(validateWixToken);
  
  // GET user settings - Used by Wix to fetch settings for a specific instance
  wixApiRouter.get("/get_userSettings", async (req: Request, res: Response) => {
    try {
      // Get instance ID from multiple possible sources
      // 1. From query parameters
      // 2. From extracted JWT token (set by middleware)
      // 3. From request body (for compatibility)
      const instanceId = req.query.instanceId as string || 
                         (req as any).instanceId ||
                         req.body?.instanceId;
      
      if (!instanceId) {
        return res.status(400).json({ message: "Instance ID is required" });
      }
      
      console.log(`[Wix API] Fetching settings for instance: ${instanceId}`);
      
      // Get settings from storage
      let settings = await storage.getSettingsByInstanceId(instanceId);
      
      // If settings don't exist, create default settings
      if (!settings) {
        const defaultSettings = {
          ...defaultShippingBarSettings,
          instanceId
        };
        
        settings = await storage.createSettings(defaultSettings);
      }
      
      return res.json(settings);
    } catch (error) {
      console.error("[Wix API] Error fetching settings:", error);
      return res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  
  // PUT update settings - Used by Wix to update settings for a specific instance
  wixApiRouter.put("/put_updateSettings", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = updateShippingBarSettingsSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid settings data", 
          errors: validationResult.error.format() 
        });
      }
      
      const { instanceId } = validationResult.data;
      
      if (!instanceId) {
        return res.status(400).json({ message: "Instance ID is required" });
      }
      
      console.log(`[Wix API] Updating settings for instance: ${instanceId}`);
      
      // Check if settings already exist
      const existingSettings = await storage.getSettingsByInstanceId(instanceId);
      
      let settings;
      
      if (existingSettings) {
        // Update existing settings
        settings = await storage.updateSettings(validationResult.data);
      } else {
        // Create new settings
        const newSettings = {
          ...defaultShippingBarSettings,
          ...validationResult.data,
        };
        
        settings = await storage.createSettings(newSettings);
      }
      
      console.log(`[Wix API] Settings updated successfully for instance: ${instanceId}`);
      
      return res.json(settings);
    } catch (error) {
      console.error("[Wix API] Error updating settings:", error);
      return res.status(500).json({ message: "Failed to update settings" });
    }
  });
  
  // Register Wix API routes with a prefix
  app.use("/wix/api", wixApiRouter);
  
  // Health check for Wix integration
  app.get("/wix/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
