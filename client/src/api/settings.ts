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

  if (!instanceId) {
    console.error("No instanceId provided for fetchSettings");
    throw new Error("Instance ID is required");
  }
  
  try {
    // Build the URL with instanceId as a query parameter
    const url = WIX_CONFIG.ENDPOINTS.GET_SETTINGS;
    const fullUrl = `${WIX_CONFIG.API_BASE_URL}${url}`;
    const urlWithParams = new URL(fullUrl, window.location.origin);
    urlWithParams.searchParams.append('instanceId', instanceId);
    
    console.log(`Fetching from URL: ${urlWithParams.toString()}`);

    const response = await apiRequest(
      'GET', 
      urlWithParams.toString(), 
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
    // Fall back to default settings with the provided instanceId
    if (error instanceof Error && error.message.includes('404')) {
      console.log("Settings not found, returning default settings");
      // Return default settings with the provided instanceId
      return {
        instanceId,
        enabled: false,
        threshold: 5000, // $50.00 in cents
        // Other default properties would be here...
        // Using type assertion since we're not providing all required fields
      } as ShippingBarSettings;
    }
    throw error;
  }
}

/**
 * Save settings to either the local development API or the Wix API
 * depending on configuration and environment
 */
export async function saveSettings(settings: ShippingBarSettings, token?: string | null): Promise<ShippingBarSettings> {
  if (!settings.instanceId) {
    console.error("No instanceId provided for saveSettings");
    throw new Error('No instanceId provided');
  }

  console.log(`Saving settings for instanceId: ${settings.instanceId}`);

  try {
    // Build the URL with proper construction
    const url = WIX_CONFIG.ENDPOINTS.UPDATE_SETTINGS;
    const fullUrl = `${WIX_CONFIG.API_BASE_URL}${url}`;
    const urlWithParams = new URL(fullUrl, window.location.origin);
    
    // Add instanceId as a query parameter for easier debugging
    urlWithParams.searchParams.append('instanceId', settings.instanceId);
    
    console.log(`Saving to URL: ${urlWithParams.toString()}`);
    console.log("Settings payload:", JSON.stringify(settings, null, 2));

    // Use our apiRequest utility for consistent handling
    const response = await apiRequest(
      'PUT', 
      urlWithParams.toString(), 
      settings,  // Send the full settings object
      token
    );
    
    if (!response.ok) {
      console.error('Failed to save settings:', response.status);
      const errorText = await response.text().catch(() => 'No error details available');
      throw new Error(`Failed to save settings (${response.status}): ${errorText}`);
    }

    const updatedSettings = await response.json();
    console.log('Settings saved successfully:', updatedSettings);

    return updatedSettings;
  } catch (error) {
    console.error("Error saving settings:", error);
    // Rethrow the error with additional context if needed
    if (error instanceof Error) {
      throw new Error(`Error updating settings for instance ${settings.instanceId}: ${error.message}`);
    }
    throw error;
  }
}
