import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import { SettingsProvider } from "@/contexts/settings-context";
import { useWixIframe } from "@/hooks/use-wix-iframe";
import { useEffect } from "react";
import { useIframeParams } from "@/hooks/use-iframe-params";

// WixApp component to handle Wix-specific integrations
function WixApp({ children }: { children: React.ReactNode }) {
  // Initialize Wix iframe communication
  const { adjustHeight, isInWix } = useWixIframe();
  const { instanceId, instance, locale, viewMode } = useIframeParams();

  // Log information about Wix environment
  useEffect(() => {
    console.log("[DEBUG] Wix Integration Status:", {
      isInWix,
      instanceId,
      instance,
      locale,
      viewMode
    });
    console.log("[DEBUG] Instance:", instance);
    console.log("[DEBUG] InstanceId:", instanceId);
    console.log("[DEBUG] Is in Wix:", isInWix);

    // Log any URL parameters as well
    const urlParams = new URLSearchParams(window.location.search);
    console.log("[DEBUG] URL parameters:", Object.fromEntries(urlParams.entries()));

    // Adjust iframe height when params are loaded
    adjustHeight();
  }, [isInWix, instanceId, instance, locale, viewMode, adjustHeight]);

  // Return children wrapped with any Wix-specific context or components
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { instance } = useIframeParams();
  // Use direct URL param for instanceId if available (for newer Wix integrations)
  const urlParams = new URLSearchParams(window.location.search);
  const instanceId = urlParams.get('instanceId') || instance;

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider instanceId={instanceId}>
        <WixApp>
          <Router />
          <Toaster />
        </WixApp>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;