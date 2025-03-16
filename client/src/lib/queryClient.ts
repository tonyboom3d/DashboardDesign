import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  instanceToken?: string | null,
  baseUrl?: string,
): Promise<Response> {
  // Build headers with authorization if token is provided
  const headers: Record<string, string> = { 
    "Content-Type": "application/json" 
  };
  
  // Add authorization header if instance token is provided
  if (instanceToken) {
    headers["Authorization"] = `Instance ${instanceToken}`;
    console.log(`[DEBUG] Adding authorization header with token`);
  } else {
    console.log(`[DEBUG] No instance token provided for authorization`);
  }

  // Build the full URL if a base URL is provided
  const fullUrl = baseUrl ? `${baseUrl}${url}` : url;
  console.log(`[DEBUG] Making ${method} request to: ${fullUrl}`);
  
  const requestOptions: RequestInit = {
    method,
    headers,
    credentials: "include",
  };
  
  // Only add body for non-GET requests
  if (data && method !== 'GET') {
    requestOptions.body = JSON.stringify(data);
    console.log(`[DEBUG] Request body:`, data);
  }
  
  console.log(`[DEBUG] Request options:`, requestOptions);
  
  const res = await fetch(fullUrl, requestOptions);
  console.log(`[DEBUG] Response status:`, res.status, res.statusText);

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get instance token from URL if present (for Wix integration)
    const instanceToken = new URLSearchParams(window.location.search).get('token');
    
    // Build headers with optional authorization
    const headers: Record<string, string> = {};
    if (instanceToken) {
      headers["Authorization"] = `Instance ${instanceToken}`;
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
