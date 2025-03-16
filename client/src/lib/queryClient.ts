import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export const apiRequest = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  token?: string | null,
  baseUrl?: string
): Promise<Response> => {
  // Initialize headers with Content-Type
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add token if provided
  const instanceToken = token || localStorage.getItem('wix_instance_token');
  if (instanceToken) {
    headers["Authorization"] = `Instance ${instanceToken}`;
  }

  console.log(`Making ${method} request to ${url}`);
  if (data) {
    console.log('Request data:', JSON.stringify(data, null, 2));
  }

  // Build the full URL if a base URL is provided
  const fullUrl = baseUrl ? `${baseUrl}${url}` : url;

  // Log full request details for debugging
  console.log('Full request details:', {
    method,
    url: fullUrl,
    headers,
    bodyIncluded: !!data
  });

  // Build fetch options
  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: 'include', // Include cookies for cross-origin requests
    mode: 'cors' // Enable CORS for cross-origin requests
  };

  // Add body for non-GET requests
  if (method !== 'GET' && data) {
    fetchOptions.body = JSON.stringify(data);
    console.log('Request body:', fetchOptions.body); // Log the stringified body
  }

  try {
    console.log(`Sending ${method} request to ${fullUrl}`);
    const response = await fetch(fullUrl, fetchOptions);
    console.log(`Response status: ${response.status}`);

    // Log response headers for debugging
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    console.log('Response headers:', responseHeaders);

    return response;
  } catch (error) {
    console.error(`API request failed: ${fullUrl}`, error);
    throw error;
  }
};

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