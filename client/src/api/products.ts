import { Product } from "@/types/settings";

// Fetch products with optional search query
export async function fetchProducts(query?: string): Promise<Product[]> {
  const queryParam = query ? `?query=${encodeURIComponent(query)}` : '';
  const response = await fetch(`/api/products${queryParam}`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }
  
  const data = await response.json();
  return data.products;
}
