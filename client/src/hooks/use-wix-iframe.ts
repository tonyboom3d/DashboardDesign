import { useEffect, useCallback } from 'react';
import { wixIframeService } from '@/services/wix-iframe-service';

/**
 * Hook to use Wix iframe communication
 * Handles auto-adjusting iframe height and sending messages to Wix
 */
export function useWixIframe() {
  // Auto-adjust iframe height on initial load and when deps change
  const adjustHeight = useCallback(() => {
    if (wixIframeService.isInWix()) {
      wixIframeService.adjustHeight();
    }
  }, []);
  
  // Auto-adjust height on initial load
  useEffect(() => {
    // Send ready message to parent
    wixIframeService.sendReady();
    
    // Initial height adjustment
    adjustHeight();
    
    // Setup a resize observer to auto-adjust height when content changes
    const resizeObserver = new ResizeObserver(() => {
      adjustHeight();
    });
    
    // Observe the body element
    if (document.body) {
      resizeObserver.observe(document.body);
    }
    
    // Clean up
    return () => {
      resizeObserver.disconnect();
    };
  }, [adjustHeight]);
  
  // Return utility functions for working with Wix iframe
  return {
    // Manually adjust iframe height
    adjustHeight,
    
    // Send loading status to Wix
    setLoading: (message?: string) => 
      wixIframeService.sendStatus('loading', message),
    
    // Send success status to Wix
    setSuccess: (message?: string) => 
      wixIframeService.sendStatus('success', message),
    
    // Send error status to Wix
    setError: (message?: string) => 
      wixIframeService.sendStatus('error', message),
    
    // Check if running inside Wix
    isInWix: wixIframeService.isInWix()
  };
}