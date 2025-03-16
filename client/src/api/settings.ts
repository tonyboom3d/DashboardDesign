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
  console.log(`Fetching settings for instanceId: ${instanceId}`);

  try {
    const url = WIX_CONFIG.ENDPOINTS.GET_SETTINGS;
    const fullUrl = `${WIX_CONFIG.API_BASE_URL}${url}?instanceId=${instanceId}`;
    console.log(`Fetching from URL: ${fullUrl}`);

    const response = await apiRequest(
      'GET', 
      fullUrl, 
      {},
      token
    );
    
    console.log('Response received:', response);

    if (!response.ok) {
      console.error('Failed to fetch settings:', response.status);
      throw new Error(`Failed to fetch settings from Wix API: ${response.status}`);
    }

    const settings = await response.json();
    console.log('Settings fetched successfully:', settings);

    return settings;
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
  console.log('Saving settings:', settings);
  
  // Ensure instanceId is included in the settings object
  if (!settings.instanceId) {
    console.error('No instanceId provided in settings');
    throw new Error('No instanceId provided in settings');
  }

  try {
    const url = WIX_CONFIG.ENDPOINTS.UPDATE_SETTINGS;
    const fullUrl = `${WIX_CONFIG.API_BASE_URL}${url}`;
    console.log(`Saving to URL: ${fullUrl}`);

    const response = await apiRequest(
      'PUT', 
      fullUrl, 
      settings, 
      token
    );

    console.log('Response received:', response);

    if (!response.ok) {
      console.error('Failed to save settings:', response.status);
      throw new Error(`Failed to save settings to Wix API: ${response.status}`);
    }

    const updatedSettings = await response.json();
    console.log('Settings saved successfully:', updatedSettings);

    return updatedSettings;
  } catch (error) {
    console.error("Error saving settings to Wix API:", error);
    throw error;
  }
}