import { useEffect, useState } from 'react';

interface IframeParams {
  instance: string | null;
  instanceId: string | null; // Extracted instanceId from JWT
  locale: string | null;
  viewMode: string | null;
  siteUrl: string | null;
  token: string | null;
  authorizationCode: string | null;
  [key: string]: string | null;
}

/**
 * Extract all URL parameters from the current window location
 */
function getUrlParams(): Record<string, string> {
  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  
  // Convert parameters to object using forEach (compatible with all TS targets)
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}

/**
 * Parse Wix instance JWT token to extract instanceId
 * Format is base64-encoded payload with instanceId inside
 */
function parseInstanceToken(instanceToken: string): string | null {
  try {
    // The token format seems to be: base64Data.payload.signature
    // We need to extract the instanceId from the payload
    const parts = instanceToken.split('.');
    
    if (parts.length > 0) {
      try {
        // First try to parse as JWT (if it contains instanceId directly)
        const payload = JSON.parse(atob(parts[1]));
        if (payload && payload.instanceId) {
          return payload.instanceId;
        }
      } catch (e) {
        // If JSON parsing fails, try to decode as base64 string
        if (parts[0].includes('instanceId')) {
          // Try to extract instanceId from the decoded token
          const decodedToken = atob(parts[0]);
          const match = decodedToken.match(/"instanceId"\s*:\s*"([^"]+)"/);
          if (match && match[1]) {
            return match[1];
          }
        }
      }
    }
    
    // Check if token contains instanceId directly
    if (instanceToken.includes('instanceId')) {
      const match = instanceToken.match(/instanceId":"([^"]+)"/);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    console.warn('Failed to extract instanceId from token:', instanceToken);
    return null;
  } catch (error) {
    console.error('Error parsing instance token:', error);
    return null;
  }
}

/**
 * Parse Wix authorization code to extract the instanceId if available
 */
function parseAuthorizationCode(authCode: string): string | null {
  try {
    if (!authCode || !authCode.startsWith('JWS.')) return null;
    
    const parts = authCode.split('.');
    if (parts.length !== 4) return null; // JWS.header.payload.signature format
    
    // Parse the payload
    const payload = JSON.parse(atob(parts[2]));
    
    // Extract the data part which is a stringified JSON
    if (payload.data) {
      const data = JSON.parse(payload.data);
      
      // Get instanceId from decodedToken
      if (data.decodedToken && data.decodedToken.instanceId) {
        return data.decodedToken.instanceId;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing authorization code:', error);
    return null;
  }
}

/**
 * Hook to get iframe parameters when embedded in Wix
 * Returns instance ID, locale, view mode and other parameters
 */
export function useIframeParams(): IframeParams {
  const [params, setParams] = useState<IframeParams>({
    instance: null,
    instanceId: null,
    locale: null,
    viewMode: null,
    siteUrl: null,
    token: null,
    authorizationCode: null
  });
  
  useEffect(() => {
    const urlParams = getUrlParams();
    const instanceToken = urlParams.instance || null;
    const authCode = urlParams.authorizationCode || null;
    
    // Try to extract instanceId from different sources
    let instanceId = null;
    
    // First try from instance token
    if (instanceToken) {
      instanceId = parseInstanceToken(instanceToken);
    }
    
    // If not found, try from authorization code
    if (!instanceId && authCode) {
      instanceId = parseAuthorizationCode(authCode);
    }
    
    setParams({
      instance: instanceToken,
      instanceId: instanceId,
      locale: urlParams.locale || null,
      viewMode: urlParams.viewMode || null,
      siteUrl: urlParams.siteUrl || null,
      token: urlParams.token || null,
      authorizationCode: authCode,
      ...urlParams // Include any other parameters
    });
    
    // Log the parameters for debugging
    console.log('Iframe Parameters:', {
      ...urlParams,
      instanceId: instanceId // Add the extracted instanceId to the log
    });
  }, []);
  
  return params;
}