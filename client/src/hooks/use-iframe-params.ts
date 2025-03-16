
import { useState, useEffect } from 'react';
import { IframeParams, WixAuthParams } from '@/types/wix-iframe';

/**
 * Extract URL parameters from current location
 */
function getUrlParams(): Record<string, string> {
  const params: Record<string, string> = {};
  const queryString = window.location.search.substring(1);
  
  if (queryString) {
    const pairs = queryString.split('&');
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  }
  
  return params;
}

/**
 * Parse Wix instance token to extract instanceId
 * Wix token is typically in format: header.payload.signature
 */
function parseInstanceToken(token: string): string | null {
  console.log('Parsing instance token:', token);
  
  try {
    // Check if this is a JWT token (has dots)
    if (token.includes('.')) {
      // For simple JWT format extraction (without validation)
      const parts = token.split('.');
      if (parts.length > 1) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('Extracted payload from JWT:', payload);
        
        // Different possible locations for instanceId in the token
        return payload.instanceId || 
               (payload.data && payload.data.instanceId) || 
               null;
      }
    }
    
    // For some Wix tokens, the instanceId might be directly encoded in the token
    // or have a different structure
    return null;
  } catch (error) {
    console.error('Error parsing instance token:', error);
    return null;
  }
}

/**
 * Parse Wix authorization code to extract instanceId
 */
function parseAuthorizationCode(code: string): string | null {
  console.log('Parsing authorization code:', code);
  
  try {
    // Some Wix integrations provide instanceId in the authorization code
    if (code.startsWith('JWS.')) {
      const parts = code.split('.');
      if (parts.length > 2) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Extracted payload from authorization code:', payload);
          
          // Look for instanceId in various locations in the payload
          if (payload.data) {
            const data = typeof payload.data === 'string' 
              ? JSON.parse(payload.data) 
              : payload.data;
              
            console.log('Parsed data from authorization code payload:', data);
            
            // Check different possible locations for instanceId
            if (data.decodedToken && data.decodedToken.siteId) {
              return data.decodedToken.siteId;
            }
            
            // Look for other possible locations
            return null;
          }
        } catch (e) {
          console.error('Error parsing JWT payload:', e);
        }
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
    console.log('URL Parameters:', urlParams);
    
    const instanceToken = urlParams.instance || null;
    const authCode = urlParams.authorizationCode || null;
    
    // Try to extract instanceId from different sources
    let instanceId = null;
    
    // First try from instance token
    if (instanceToken) {
      console.log('Trying to extract instanceId from instance token');
      instanceId = parseInstanceToken(instanceToken);
    }
    
    // If not found, try from authorization code
    if (!instanceId && authCode) {
      console.log('Trying to extract instanceId from authorization code');
      instanceId = parseAuthorizationCode(authCode);
    }
    
    // Log the raw instance token for debugging
    if (instanceToken) {
      console.log('Raw instance token:', instanceToken);
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
