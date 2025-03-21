import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShippingBarSettingsSchema, updateShippingBarSettingsSchema, defaultShippingBarSettings } from "@shared/schema";
import { z } from "zod";
import { WixAuthCredentials, syncSettingsWithWix } from "./wix-api-minimal";
import { 
  getOAuthUrl, 
  exchangeCodeForTokens, 
  getInstanceData, 
  deployScript, 
  getLastDayOfMonth 
} from "./oauth-utils";

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


  // Query Wix store products
  // This code will be moved inside the registerRoutes function below



export async function registerRoutes(app: Express): Promise<Server> {
  // Query Wix store products
  app.post("/api/wix-products", async (req: Request, res: Response) => {
    try {
      const { filter, sort, limit = 100, offset = 0 } = req.query;
      const instanceId = req.query.instanceId as string;
      const authHeader = req.headers.authorization;

      console.log('[Wix Products API] Request received with params:', { instanceId, filter, sort, limit, offset });

      if (!instanceId) {
        return res.status(400).json({ message: "Instance ID is required" });
      }

      const settings = await storage.getSettingsByInstanceId(instanceId);
      
      console.log('[Wix Products API] Settings retrieved:', {
        hasSettings: !!settings,
        hasAccessToken: !!settings?.accessToken,
        instanceId
      });

      if (!settings?.accessToken) {
        return res.status(401).json({ 
          message: "No access token available",
          details: "Please authorize the app in Wix dashboard first"
        });
      }

      const accessToken = settings.accessToken;
      const refreshToken = settings.refreshToken;

      console.log('[Wix Products API] Using tokens:', {
        hasAccessToken: !!accessToken,
        accessTokenPrefix: accessToken ? accessToken.substring(0, 10) + '...' : null,
        hasRefreshToken: !!refreshToken
      });

      const credentials: WixAuthCredentials = {
        instanceId,
        accessToken,
        refreshToken
      };

      console.log('[Wix Products API Server] Making request with params:', { limit, offset, filter, sort });
      console.log('[Wix Products API Server] Using access token:', accessToken?.substring(0, 10) + '...');
      console.log('[Wix Products API Server] Full request details:', {
        url: 'https://www.wixapis.com/wix-data/v2/items/query',
        instanceId,
        hasAccessToken: !!accessToken,
        requestBody: JSON.stringify({
          dataCollectionId: "Stores/Products",
          query: {
            paging: {
              limit: Math.min(Number(limit), 100),
              offset: Number(offset)
            },
            filter: filter && typeof filter === 'string' ? (() => { try { return JSON.parse(filter); } catch { return undefined; } })() : undefined,
            sort: sort && typeof sort === 'string' ? (() => { try { return JSON.parse(sort); } catch { return undefined; } })() : undefined
          }
        }, null, 2)
      });

      try {
        const requestBody = {
          includeVariants: true,
          includeHiddenProducts: true,
          paging: {
            limit: Math.min(Number(limit), 100),
            offset: Number(offset)
          },
          filter: filter && typeof filter === 'string' ? filter : undefined,
          sort: sort && typeof sort === 'string' ? sort : undefined
        };

        console.log('[Wix Products API] Request body:', JSON.stringify(requestBody, null, 2));

        const products = await fetch('https://www.wixapis.com/wix-data/v2/items/query', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dataCollectionId: "Stores/Products",
            query: {
              paging: {
                limit: Math.min(Number(limit), 100),
                offset: Number(offset)
              },
              filter: filter ? (typeof filter === 'string' ? JSON.parse(filter) : undefined) : undefined,
              sort: sort ? (typeof sort === 'string' ? JSON.parse(sort) : undefined) : undefined
            },
            returnTotalCount: false,
            consistentRead: false
          })
        });

        console.log('[Wix Products API] Response status:', products.status);
        console.log('[Wix Products API] Response headers:', Object.fromEntries(products.headers.entries()));

        if (!products.ok) {
          console.error('[Wix Products API] Error response:', products.status, await products.text());
          throw new Error(`Failed to fetch products: ${products.statusText}`);
        }

        const data = await products.json();
        console.log('[Wix Products API] Successfully fetched products:', { count: data.products?.length });

        return res.json({ 
          products: data.dataItems.map((item: any) => ({
            id: item.data._id,
            name: item.data.name,
            price: item.data.price * 100, // Convert to cents for consistency
            imageUrl: item.data.mainMedia || 'https://via.placeholder.com/100'
          }))
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Wix Products API] Error fetching products:', error);
        return res.status(500).json({ message: "Failed to fetch products from Wix", error: errorMessage });
      }
    } catch (error) {
      console.error("[Wix Products API] Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("[Wix Products API] Full error details:", {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        requestInstanceId: req.query.instanceId,
        hasAuthorization: !!req.headers.authorization
      });
      return res.status(500).json({ message: "Failed to fetch products", error: errorMessage });
    }
  });

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
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      return res.status(204).end();
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

  // OAuth endpoints for Wix app installation
  
  // OAuth URL endpoint - redirects to Wix installer
  app.get("/oauth/url", (req: Request, res: Response) => {
    try {
      const token = req.query.token as string;
      if (!token) {
        console.error("[OAuth] Invalid token info", token);
        return res.status(400).json({ message: "Invalid token info" });
      }
      
      // Use the configured redirect URL
      const REDIRECT_URL = "https://freeshipping-bar.replit.app/oauth/redirect";
      
      // Get the OAuth URL and redirect the user
      const oauthUrl = getOAuthUrl(token, REDIRECT_URL);
      return res.redirect(301, oauthUrl);
    } catch (error) {
      console.error("[OAuth] Error generating OAuth URL:", error);
      return res.status(500).json({ message: "Failed to generate OAuth URL" });
    }
  });
  
  // OAuth redirect endpoint - handles callback from Wix
  app.get("/oauth/redirect", async (req: Request, res: Response) => {
    try {
      const { code, instanceId } = req.query;
      
      if (!code || !instanceId) {
        console.error("[OAuth] Missing required parameters:", { code, instanceId });
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      // Exchange code for access and refresh tokens
      const { accessToken, refreshToken } = await exchangeCodeForTokens(
        code as string, 
        instanceId as string
      );
      
      // Get instance data from Wix
      const instanceData = await getInstanceData(accessToken);
      
      // Check if settings already exist for this instance
      let existingSettings = await storage.getSettingsByInstanceId(instanceId as string);
      
      // Set up reset day for usage stats (similar to your original implementation)
      const today = new Date();
      const lastDayOfMonth = getLastDayOfMonth(today);
      let resetDay = today.getDate();
      
      if (resetDay > lastDayOfMonth) {
        resetDay = lastDayOfMonth;
      }
      
      // Create or update settings in our local database
      if (!existingSettings) {
        // Create new settings
        const newSettings = {
          ...defaultShippingBarSettings,
          instanceId: instanceId as string,
          accessToken,
          refreshToken,
          enabled: true
        };
        
        await storage.createSettings(newSettings);
      } else {
        // Update existing settings with new tokens
        await storage.updateSettings({
          instanceId: instanceId as string,
          accessToken,
          refreshToken,
        });
      }
      
      // Deploy script to Wix instance (optional, based on your requirements)
      await deployScript(instanceId as string, accessToken, refreshToken);
      
      // Redirect to Wix dashboard with access token
      return res.redirect(301, `https://www.wix.com/installer/close-window?access_token=${accessToken}`);
    } catch (error) {
      console.error("[OAuth] Failed OAuth flow:", error);
      return res.status(500).json({ message: "OAuth authentication failed" });
    }
  });

  // Apply Wix token validation middleware to all Wix API routes
  const wixApiRouter = express.Router();
  wixApiRouter.use(validateWixToken);

  // GET user settings - Used by Wix to fetch settings for a specific instance
  wixApiRouter.get("/get_userSettings", async (req: Request, res: Response) => {
    try {
      // Log all possible sources for debugging
      console.log('[Wix API] Request sources for instanceId:');
      console.log('- Query params:', req.query);
      console.log('- Headers:', req.headers);
      console.log('- JWT extracted:', (req as any).instanceId);

      // Get instance ID from multiple possible sources
      // 1. From query parameters
      // 2. From extracted JWT token (set by middleware)
      // 3. From request body (for compatibility)
      const instanceId = req.query.instanceId as string || 
                         (req as any).instanceId ||
                         req.body?.instanceId;

      if (!instanceId) {
        console.log('[Wix API] No instanceId found, returning 400');
        return res.status(400).json({ message: "Instance ID is required" });
      }

      console.log(`[Wix API] Fetching settings for instance: ${instanceId}`);

      // Get tokens from request
      const authHeader = req.headers.authorization;
      let accessToken = null;
      let refreshToken = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
        console.log('[Wix API] Received access token in Authorization header');

        // Try to extract refresh token if sent in a custom header
        if (req.headers['x-refresh-token']) {
          refreshToken = req.headers['x-refresh-token'] as string;
          console.log('[Wix API] Received refresh token in X-Refresh-Token header');
        }
      }

      // Get settings from storage
      let settings = await storage.getSettingsByInstanceId(instanceId);

      // Store tokens if they were provided in the request
      if (accessToken || refreshToken) {
        const tokenUpdate = {
          instanceId,
          ...(accessToken && { accessToken }),
          ...(refreshToken && { refreshToken })
        };
        settings = await storage.updateSettings(tokenUpdate);
        console.log('[Wix API] Updated settings with tokens');
      }

      // If settings don't exist, create default settings
      if (!settings) {
        const defaultSettings = {
          ...defaultShippingBarSettings,
          instanceId,
          accessToken,
          refreshToken
        };

        settings = await storage.createSettings(defaultSettings);
      } else if (accessToken) {
        // Update tokens if they were provided
        settings = await storage.updateSettings({
          instanceId,
          accessToken,
          refreshToken
        });
      }

      // Create response object with auth credentials
      const response = settings ? {
        ...settings,
        auth: {
          instanceId,
          accessToken: settings.accessToken,
          refreshToken: settings.refreshToken
        }
      } : {
        instanceId,
        auth: {
          instanceId,
          accessToken: null,
          refreshToken: null
        }
      };

      return res.json(response);
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

      // Get token from request if available
      const authHeader = req.headers.authorization;
      let accessToken = null;
      let refreshToken = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
        console.log('[Wix API] Received access token in Authorization header');

        // Try to extract refresh token if sent in a custom header
        if (req.headers['x-refresh-token']) {
          refreshToken = req.headers['x-refresh-token'] as string;
          console.log('[Wix API] Received refresh token in X-Refresh-Token header');
        }
      }

      // If we have a token and settings, try to sync with Wix CMS
      if (settings && accessToken) {
        try {
          // Update tokens if they've changed
          if (settings.accessToken !== accessToken || settings.refreshToken !== refreshToken) {
            settings = await storage.updateSettings({
              instanceId,
              accessToken,
              refreshToken
            });
          }

          // Create credentials for Wix API
          const credentials: WixAuthCredentials = {
            instanceId,
            accessToken,
            refreshToken
          };

          // Sync settings with Wix CMS
          const syncedSettings = await syncSettingsWithWix(settings, credentials);

          // Update local storage with any changes from Wix
          if (syncedSettings && syncedSettings !== settings) {
            settings = await storage.updateSettings({
              instanceId: syncedSettings.instanceId,
              enabled: syncedSettings.enabled,
              threshold: syncedSettings.threshold
              // Only update fields that are safe to update
            });
          }
        } catch (syncError) {
          console.error('[Wix API] Error syncing with Wix CMS:', syncError);
          // Continue with local settings
        }
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

  // Debug route to verify what changes we've made
  app.get("/debug-ui-changes", (req: Request, res: Response) => {
    res.send(`
      <html>
        <head>
          <title>Debug UI Changes</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            .container { max-width: 800px; margin: 0 auto; }
            h1 { color: #333; }
            .feature { background: #f5f5f5; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
            .code { background: #eee; padding: 10px; font-family: monospace; overflow-x: auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>UI Changes Debug Page</h1>

            <div class="feature">
              <h2>1. Sticky Live Preview</h2>
              <p>The Live Preview card has been made sticky with the following class:</p>
              <div class="code">className="sticky top-4"</div>
              <p>This keeps the preview visible as you scroll through the customization options.</p>
            </div>

            <div class="feature">
              <h2>2. Text Position Controls</h2>
              <p>Added controls to position text either above or below the progress bar:</p>
              <div class="code">
              settings.textPosition === 'above' && "mb-2"<br>
              settings.textPosition === 'below' && "mt-2"
              </div>
            </div>

            <div class="feature">
              <h2>3. Progress Direction Controls</h2>
              <p>Added controls for progress bar direction (LTR/RTL):</p>
              <div class="code">
              settings.progressDirection === 'rtl' ? { <br>
                marginLeft: 'auto',<br>
                marginRight: '0'<br>
              } : {}
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
  });

  const httpServer = createServer(app);

  return httpServer;
}