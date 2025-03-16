import { useState, useEffect } from 'react';
import { IframeParams } from '@/types/wix-iframe';

/**
 * Helper function to decode JWT token and extract payload
 */
function decodeJwt(token: string): any {
  try {
    // Split the token into parts
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT token');

    // Decode the payload
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

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
    let instanceId = null;

    // Decode the JWT token to extract instanceId
    if (instanceToken) {
      console.log('Received instance token:', instanceToken);
      const payload = decodeJwt(instanceToken);
      if (payload) {
        instanceId = payload.instanceId;
        console.log('Extracted instanceId from JWT:', instanceId);
      } else {
        console.warn('Failed to extract instanceId from instance token');
      }
    }

    setParams({
      instance: instanceToken,
      instanceId: instanceId,
      locale: urlParams.locale || null,
      viewMode: urlParams.viewMode || null,
      siteUrl: urlParams.siteUrl || null,
      token: urlParams.token || null,
      authorizationCode: urlParams.authorizationCode || null
    });
  }, []);

  return params;
}