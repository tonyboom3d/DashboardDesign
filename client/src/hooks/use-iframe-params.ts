import { useEffect, useState } from 'react';

interface IframeParams {
  instance: string | null;
  locale: string | null;
  viewMode: string | null;
  siteUrl: string | null;
  token: string | null;
  [key: string]: string | null;
}

/**
 * Extract all URL parameters from the current window location
 */
function getUrlParams(): Record<string, string> {
  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  
  // Convert parameters to object
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
}

/**
 * Hook to get iframe parameters when embedded in Wix
 * Returns instance ID, locale, view mode and other parameters
 */
export function useIframeParams(): IframeParams {
  const [params, setParams] = useState<IframeParams>({
    instance: null,
    locale: null,
    viewMode: null,
    siteUrl: null,
    token: null
  });
  
  useEffect(() => {
    const urlParams = getUrlParams();
    
    setParams({
      instance: urlParams.instance || null,
      locale: urlParams.locale || null,
      viewMode: urlParams.viewMode || null,
      siteUrl: urlParams.siteUrl || null,
      token: urlParams.token || null,
      ...urlParams // Include any other parameters
    });
    
    // Log the parameters for debugging
    console.log('Iframe Parameters:', urlParams);
  }, []);
  
  return params;
}