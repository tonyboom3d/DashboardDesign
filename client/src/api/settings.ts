import { ShippingBarSettings } from "@/types/settings";
import { apiRequest } from "@/lib/queryClient";
import { WIX_CONFIG } from "@/config/wix-config";

/**
 * Fetch settings from either the local development API or the Wix API
 * depending on configuration and environment
 */
export async function fetchSettings(
  instanceId: string, 
  token?: string | null
): Promise<ShippingBarSettings> {
  // For development - use local API if Wix API URL is not set
  if (!WIX_CONFIG.API_BASE_URL) {
    const response = await fetch(`/api/settings/${instanceId}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.status}`);
    }
    
    return response.json();
  }
  
  // For production with Wix - use configured Wix API
  try {
    const url = WIX_CONFIG.ENDPOINTS.GET_SETTINGS;
    const response = await apiRequest(
      'GET', 
      url, 
      { instanceId }, 
      token,
      WIX_CONFIG.API_BASE_URL
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch settings from Wix API: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching settings from Wix API:", error);
    throw error;
  }
}

/**
 * Save settings to either the local development API or the Wix API
 * depending on configuration and environment
 */
export async function saveSettings(
  settings: ShippingBarSettings, 
  token?: string | null
): Promise<ShippingBarSettings> {
  // For development - use local API if Wix API URL is not set
  if (!WIX_CONFIG.API_BASE_URL) {
    const response = await apiRequest('POST', '/api/settings', settings);
    return response.json();
  }
  
  // For production with Wix - use configured Wix API
  try {
    const url = WIX_CONFIG.ENDPOINTS.UPDATE_SETTINGS;
    const response = await apiRequest(
      'PUT', 
      url, 
      settings, 
      token,
      WIX_CONFIG.API_BASE_URL
    );
    
    if (!response.ok) {
      throw new Error(`Failed to save settings to Wix API: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error("Error saving settings to Wix API:", error);
    throw error;
  }
}
