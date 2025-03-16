import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShippingBarSettingsSchema, updateShippingBarSettingsSchema, defaultShippingBarSettings } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);

  return httpServer;
}
