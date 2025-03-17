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
export async function saveSettings(settings: ShippingBarSettings, token?: string | null): Promise<ShippingBarSettings> {
  if (!settings.instanceId) {
    throw new Error('No instanceId provided')
  }

  const params = new URLSearchParams({
    instanceId: settings.instanceId,
    enabled: String(settings.enabled),
    settingsData: encodeURIComponent(JSON.stringify(settings))
  }).toString()

  const fullUrl = `https://tonyboom3d.wixsite.com/freeshippingbar/_functions/updateSettings?${params}`

  const headers: Record<string, string> = {
    'Accept': 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Instance ${token}`
  }

  const response = await fetch(fullUrl, {
    method: 'GET',
    headers
  })

  if (!response.ok) {
    throw new Error(`Failed to save settings: ${response.status}`)
  }

  const updatedSettings = await response.json()

  return updatedSettings
}
