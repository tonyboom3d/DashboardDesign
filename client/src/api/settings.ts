import { ShippingBarSettings } from "@/types/settings";
import { apiRequest } from "@/lib/queryClient";

// Fetch settings
export async function fetchSettings(instanceId: string): Promise<ShippingBarSettings> {
  const response = await fetch(`/api/settings/${instanceId}`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch settings: ${response.status}`);
  }
  
  return response.json();
}

// Save settings
export async function saveSettings(settings: ShippingBarSettings): Promise<ShippingBarSettings> {
  const response = await apiRequest('POST', '/api/settings', settings);
  return response.json();
}
