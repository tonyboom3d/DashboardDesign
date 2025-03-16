import { useState, useEffect } from 'react';
import { WixIframeParams } from '@/types/wix-iframe';
import WixIframeService from '@/services/wix-iframe-service';

export function useIframeParams() {
  const [params, setParams] = useState<WixIframeParams>({
    isInWix: false,
    instanceId: null,
    instance: null,
    locale: null,
    viewMode: null
  });

  useEffect(() => {
    // Initialize WixIframeService 
    const wixIframeService = new WixIframeService();

    // Event listener for parameters from Wix
    const handleParams = (eventParams: any) => {
      console.log('[DEBUG] Raw Iframe Parameters: ', eventParams);

      // Check if the instance parameter contains a JWT token
      let instanceId = null;
      const instanceToken = eventParams.instance;

      if (instanceToken) {
        console.log('[DEBUG] Received instance token:', instanceToken);

        // Try to extract instanceId from JWT token
        try {
          // For JWT tokens: token parts are header.payload.signature
          const parts = instanceToken.split('.');
          if (parts.length > 1) {
            // Decode the base64 payload
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            console.log('[DEBUG] Decoded JWT payload:', payload);

            if (payload.instanceId) {
              instanceId = payload.instanceId;
              console.log('[DEBUG] Extracted instanceId from JWT:', instanceId);
            }
          }
        } catch (e) {
          console.error('[DEBUG] Error extracting instanceId from token:', e);
        }
      }

      // Process the parameters - extract what we need
      setParams({
        isInWix: true,
        instanceId: instanceId,
        instance: eventParams.instance || null,
        locale: eventParams.locale || null,
        viewMode: eventParams.displayMode || null
      });
    };

    // Start listening for parameters and register our handler
    wixIframeService.addParamsListener(handleParams);

    // Initial setup - if we already have URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const instanceFromUrl = urlParams.get('instance');
    const instanceIdFromUrl = urlParams.get('instanceId');

    if (instanceFromUrl || instanceIdFromUrl) {
      console.log('[DEBUG] URL params - instance:', instanceFromUrl, 'instanceId:', instanceIdFromUrl);

      setParams(prev => ({
        ...prev,
        instance: instanceFromUrl || prev.instance,
        instanceId: instanceIdFromUrl || prev.instanceId
      }));
    }

    // Cleanup on unmount
    return () => {
      wixIframeService.removeParamsListener(handleParams);
    };
  }, []);

  return params;
}