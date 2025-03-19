import type { ShippingBarSettings, InsertShippingBarSettings, UpdateShippingBarSettings } from '@shared/schema';
import { storage } from './storage';

// Credentials interface for Wix API access
export interface WixAuthCredentials {
  instanceId: string;
  accessToken: string | null;
  refreshToken: string | null;
}

/**
 * Synchronize settings between local storage and Wix API
 * Using our own storage instead of Wix CMS
 */
export async function syncSettingsWithWix(
  settings: ShippingBarSettings | undefined, 
  credentials: WixAuthCredentials
): Promise<ShippingBarSettings | undefined> {
  if (!settings && !credentials.instanceId) return undefined;
  
  console.log(`[Wix API] Syncing settings for instance ${credentials.instanceId}`);
  
  // If we don't have settings, try to fetch from our storage
  if (!settings && credentials.instanceId) {
    settings = await storage.getSettingsByInstanceId(credentials.instanceId);
    
    // If still no settings, create default ones
    if (!settings && credentials.accessToken) {
      const newSettings: InsertShippingBarSettings = {
        instanceId: credentials.instanceId,
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken,
        enabled: true,
        threshold: 5000,
        currencySymbol: "$",
        currencyCode: "USD",
        productSuggestionMethod: "manual" as const,
        barStyle: "simple" as const,
        colors: {
          backgroundColor: "#FFFFFF",
          bar: "#0070F3",
          progressBg: "#E5E7EB",
          text: "#111827",
          accent: "#10B981",
          highlight: "#F59E0B",
          gradientEnd: "#10B981"
        },
        border: {
          color: "#E5E7EB",
          thickness: 1
        },
        progressBarBorder: {
          color: "#0070F3",
          thickness: 1
        },
        text: {
          barText: "Add ${remaining} more to get FREE shipping!",
          successText: "Congratulations! You've qualified for FREE shipping!",
          buttonText: "Add to Cart",
          initialText: "Start shopping to get FREE shipping!",
          showInitialText: true
        },
        textAlignment: "left" as const,
        textDirection: "ltr" as const,
        textPosition: "above" as const,
        progressDirection: "ltr" as const,
        icon: {
          type: "emoji" as const,
          selection: "🚚",
          position: "before" as const
        },
        visibility: {
          productPage: { desktop: true, mobile: true },
          cartPage: { desktop: true, mobile: true },
          miniCart: { desktop: true, mobile: true },
          header: { desktop: false, mobile: false }
        },
        position: "top" as const,
        recommendedProducts: [],
        analytics: {
          viewCount: 0,
          conversionRate: "0%",
          aov: "$0.00"
        }
      };
      settings = await storage.createSettings(newSettings);
    }
  } 
  // Update tokens if we have them and settings exist
  else if (settings && credentials.accessToken && credentials.refreshToken) {
    // Only update if tokens have changed
    if (
      settings.accessToken !== credentials.accessToken || 
      settings.refreshToken !== credentials.refreshToken
    ) {
      const updates: UpdateShippingBarSettings = {
        instanceId: credentials.instanceId,
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken
      };
      settings = await storage.updateSettings(updates);
    }
  }
  
  return settings;
}

/**
 * Query items by instance ID
 * Using our own storage instead of Wix CMS
 */
export async function queryWixDataByInstanceId(
  credentials: WixAuthCredentials
): Promise<any[]> {
  if (!credentials.instanceId) {
    throw new Error("Instance ID is required");
  }
  
  console.log(`[Wix API] Querying data for instance: ${credentials.instanceId}`);
  const settings = await storage.getSettingsByInstanceId(credentials.instanceId);
  
  // Return in format similar to Wix data items
  return settings ? [{
    _id: `settings-${credentials.instanceId}`,
    _createdDate: settings.createdAt,
    _updatedDate: settings.updatedAt,
    data: { ...settings }
  }] : [];
}

/**
 * Create a new item in storage
 * Using our own storage instead of Wix CMS
 */
export async function createWixDataItem(
  credentials: WixAuthCredentials, 
  data: any
): Promise<any> {
  if (!credentials.instanceId) {
    throw new Error("Instance ID is required");
  }
  
  console.log(`[Wix API] Creating data for instance: ${credentials.instanceId}`);
  
  // Format data for our storage
  const settingsData: InsertShippingBarSettings = {
    instanceId: credentials.instanceId,
    accessToken: credentials.accessToken,
    refreshToken: credentials.refreshToken,
    ...data
  };
  
  const settings = await storage.createSettings(settingsData);
  
  // Return in format similar to Wix data items
  return { 
    _id: `settings-${credentials.instanceId}`,
    _createdDate: settings.createdAt,
    _updatedDate: settings.updatedAt,
    data: { ...settings }
  };
}

/**
 * Update an existing item in storage
 * Using our own storage instead of Wix CMS
 */
export async function updateWixDataItem(
  credentials: WixAuthCredentials, 
  itemId: string, 
  data: any
): Promise<any> {
  if (!credentials.instanceId) {
    throw new Error("Instance ID is required");
  }
  
  console.log(`[Wix API] Updating data for instance: ${credentials.instanceId}`);
  
  // Format data for our storage
  const settingsData: UpdateShippingBarSettings = {
    instanceId: credentials.instanceId,
    ...data
  };
  
  const settings = await storage.updateSettings(settingsData);
  
  if (!settings) {
    throw new Error(`No settings found for instance ID: ${credentials.instanceId}`);
  }
  
  // Return in format similar to Wix data items
  return { 
    _id: itemId,
    _updatedDate: settings.updatedAt,
    data: { ...settings }
  };
}