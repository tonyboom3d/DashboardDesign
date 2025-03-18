import fetch from 'node-fetch';
import { ShippingBarSettings } from '@shared/schema';

interface WixApiConfig {
  wixApiBaseUrl: string;
  wixDataCollectionId: string;
}

const API_CONFIG: WixApiConfig = {
  wixApiBaseUrl: 'https://www.wixapis.com/wix-data/v2',
  wixDataCollectionId: 'ShippingBarSettings', // Replace with your actual collection ID
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
 */
export async function syncSettingsWithWix(
  settings: ShippingBarSettings | undefined, 
  credentials: WixAuthCredentials
): Promise<ShippingBarSettings | undefined> {
  if (!settings) {
    console.log('No settings provided for Wix sync');
    return undefined;
  }
  
  if (!credentials.accessToken) {
    console.log('No access token available for Wix sync');
    return settings; // No token available, return current settings
  }

  try {
    // Find existing item in Wix CMS by instance ID
    const existingItems = await queryWixDataByInstanceId(credentials);
    
    // If item exists, update it, otherwise create new
    if (existingItems && existingItems.length > 0) {
      const itemId = existingItems[0].id;
      // Create a clean version of settings for API
      const apiData = {
        instanceId: settings.instanceId,
        enabled: settings.enabled,
        threshold: settings.threshold,
        productSuggestionMethod: settings.productSuggestionMethod,
        barStyle: settings.barStyle,
        position: settings.position,
        textAlignment: settings.textAlignment,
        textDirection: settings.textDirection,
        // Only include JSON fields as serialized strings
        colors: JSON.stringify(settings.colors),
        border: JSON.stringify(settings.border),
        text: JSON.stringify(settings.text),
        icon: JSON.stringify(settings.icon),
        visibility: JSON.stringify(settings.visibility),
        recommendedProducts: JSON.stringify(settings.recommendedProducts),
        analytics: JSON.stringify(settings.analytics)
      };
      
      const updatedItem = await updateWixDataItem(credentials, itemId, apiData);
      
      // Merge the returned data with our settings format
      return settings;
    } else {
      // Create a clean version of settings for API
      const apiData = {
        instanceId: settings.instanceId,
        enabled: settings.enabled,
        threshold: settings.threshold,
        productSuggestionMethod: settings.productSuggestionMethod,
        barStyle: settings.barStyle,
        position: settings.position,
        textAlignment: settings.textAlignment,
        textDirection: settings.textDirection,
        // Only include JSON fields as serialized strings
        colors: JSON.stringify(settings.colors),
        border: JSON.stringify(settings.border),
        text: JSON.stringify(settings.text),
        icon: JSON.stringify(settings.icon),
        visibility: JSON.stringify(settings.visibility),
        recommendedProducts: JSON.stringify(settings.recommendedProducts),
        analytics: JSON.stringify(settings.analytics)
      };
      
      const newItem = await createWixDataItem(credentials, apiData);
      
      // Return original settings - we don't need to modify them
      return settings;
    }
  } catch (error) {
    console.error('Error syncing settings with Wix:', error);
    return settings; // Return original settings on error
  }
}