import { Product } from "@/types/settings";

// Fetch products with optional search query
export async function fetchProducts(query?: string): Promise<Product[]> {
  const queryParam = query ? `?query=${encodeURIComponent(query)}` : '';
  const url = `/api/products${queryParam}`;

  console.log('[Products API] Fetching products:', { url, query });

  try {
    const response = await fetch(url, {
      credentials: 'include'
    });

    console.log('[Products API] Response status:', response.status);
    console.log('[Products API] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Products API] Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch products: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('[Products API] Products fetched successfully:', {
      count: data.products?.length,
      products: data.products
    });

    return data.products;
  } catch (error) {
    console.error('[Products API] Request failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

// Fetch products from Wix store
export async function fetchWixProducts(instanceId: string, limit: string = "100", filter?: string, settings?: any): Promise<Product[]> {
  const url = `https://www.wixapis.com/stores/v3/products/query`; // Corrected Wix API endpoint

  console.log('[Wix Products API] Fetching products:', { url, instanceId, limit, filter });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings?.accessToken}`, // Added Authorization header
      },
      body: JSON.stringify({
        query: {
          paging: {
            limit: Math.min(Number(limit), 100),
            offset: 0
          },
          filter: filter ? String(filter) : undefined,
        }
      })
    });

    console.log('[Wix Products API] Response status:', response.status);
    console.log('[Wix Products API] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Wix Products API] Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch Wix products: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('[Wix Products API] Products fetched successfully:', {
      count: data.items?.length,
      products: data.items
    });

    return data.items; // Assuming 'items' contains the product array in Wix response
  } catch (error) {
    console.error('[Wix Products API] Request failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}