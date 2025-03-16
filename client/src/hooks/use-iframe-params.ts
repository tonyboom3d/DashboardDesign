import { useEffect, useState } from 'react';

interface IframeParams {
  instance: string | null;
  locale: string | null;
  viewMode: string | null;
  siteUrl: string | null;
  [key: string]: string | null;
}

// Function to get URL parameters
function getUrlParams(): Record<string, string> {
  const params: Record<string, string> = {};
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  
  for (const [key, value] of urlParams.entries()) {
    params[key] = value;
  }
  
  return params;
}

export function useIframeParams(): IframeParams {
  const [params, setParams] = useState<IframeParams>({
    instance: null,
    locale: null,
    viewMode: null,
    siteUrl: null,
  });
  
  useEffect(() => {
    const urlParams = getUrlParams();
    
    setParams({
      instance: urlParams.instance || null,
      locale: urlParams.locale || null,
      viewMode: urlParams.viewMode || null,
      siteUrl: urlParams.siteUrl || null,
      ...urlParams
    });
    
  }, []);
  
  return params;
}
