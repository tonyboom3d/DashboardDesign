import { useState, useEffect } from 'react';
import { IframeParams } from '@/types/wix-iframe';

/**
 * Helper function to decode JWT token and extract payload
 */
function decodeJwt(token: string): any {
  try {
    // Split the token into parts
    const parts = token.split('.');
    console.log('JWT token parts:', parts);

    // Decode payload
    const payload = JSON.parse(atob(parts[1]));
    console.log('Decoded JWT payload:', payload);
    return payload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

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

export function useIframeParams(): { instanceId: string | null } {
  const [instanceId, setInstanceId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = getUrlParams();
    console.log('URL Parameters at start of useEffect:', urlParams);
    const instanceToken = urlParams.instance || null;
    console.log('Initial instanceId:', instanceId);

    if (instanceToken) {
      console.log('Received instance token:', instanceToken);
      const payload = decodeJwt(instanceToken);

      if (payload) {
        setInstanceId(payload.instanceId);
        console.log('Setting instanceId:', payload.instanceId);
      } else {
        console.warn('Failed to extract instanceId from instance token. Token provided:', instanceToken);
      }
    }
  }, []);

  useEffect(() => {
    console.log('Updated instanceId:', instanceId);
  }, [instanceId]);

  return { instanceId };
}