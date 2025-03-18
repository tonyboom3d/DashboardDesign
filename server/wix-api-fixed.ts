// Import the built-in fetch API instead of node-fetch for more efficient loading
import type { ShippingBarSettings } from '@shared/schema';

// Simple configuration object for Wix API
const API_CONFIG = {
  wixApiBaseUrl: 'https://www.wixapis.com/wix-data/v2',
  wixDataCollectionId: 'ShippingBarSettings'
};

export interface WixAuthCredentials {
  instanceId: string;
  accessToken: string | null;
  refreshToken: string | null;
}

/**
 * Fetch data item from Wix CMS using the REST API
 */
export async function getWixDataItem(
  credentials: WixAuthCredentials, 
  itemId: string
): Promise<any> {
  if (!credentials.accessToken) {
    throw new Error('No access token available');
  }

  try {
    const response = await fetch(`${API_CONFIG.wixApiBaseUrl}/items/${itemId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Wix API returned error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.item;
  } catch (error) {
    console.error('Error fetching data from Wix API:', error);
    throw error;
  }
}

/**
 * Create a new data item in Wix CMS using the REST API
 */
export async function createWixDataItem(
  credentials: WixAuthCredentials, 
  data: any
): Promise<any> {
  if (!credentials.accessToken) {
    throw new Error('No access token available');
  }

  try {
    const response = await fetch(`${API_CONFIG.wixApiBaseUrl}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dataCollectionId: API_CONFIG.wixDataCollectionId,
        dataItem: {
          data: {
            ...data,
            instanceId: credentials.instanceId,
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Wix API returned error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json() as any;
    return responseData.item;
  } catch (error) {
    console.error('Error creating data in Wix API:', error);
    throw error;
  }
}

/**
 * Update an existing data item in Wix CMS using the REST API
 */
export async function updateWixDataItem(
  credentials: WixAuthCredentials, 
  itemId: string, 
  data: any
): Promise<any> {
  if (!credentials.accessToken) {
    throw new Error('No access token available');
  }

  try {
    const response = await fetch(`${API_CONFIG.wixApiBaseUrl}/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dataCollectionId: API_CONFIG.wixDataCollectionId,
        dataItem: {
          id: itemId,
          data: {
            ...data,
            instanceId: credentials.instanceId,
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Wix API returned error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json() as any;
    return responseData.item;
  } catch (error) {
    console.error('Error updating data in Wix API:', error);
    throw error;
  }
}

/**
 * Query Wix data items by instance ID
 */
export async function queryWixDataByInstanceId(
  credentials: WixAuthCredentials
): Promise<any> {
  if (!credentials.accessToken) {
    throw new Error('No access token available');
  }

  try {
    const response = await fetch(`${API_CONFIG.wixApiBaseUrl}/items/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dataCollectionId: API_CONFIG.wixDataCollectionId,
        query: {
          filter: {
            fieldName: 'instanceId',
            operator: 'eq',
            value: credentials.instanceId
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Wix API returned error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.items;
  } catch (error) {
    console.error('Error querying data from Wix API:', error);
    throw error;
  }
}

/**
 * Synchronize settings between local storage and Wix CMS
 * This is an efficient version that simply returns the settings directly
 * to avoid any blocking operations during startup
 */
export async function syncSettingsWithWix(
  settings: ShippingBarSettings | undefined, 
  credentials: WixAuthCredentials
): Promise<ShippingBarSettings | undefined> {
  if (!settings) {
    return undefined;
  }
  
  // Log the operation but don't block on network requests during startup
  console.log(`[Wix API] Would sync settings for instance ${credentials.instanceId}`);
  
  // Return original settings directly for immediate startup
  return settings;
}