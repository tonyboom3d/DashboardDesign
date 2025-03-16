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
  const { instance, locale, viewMode } = useIframeParams();
  
  // Log information about Wix environment
  useEffect(() => {
    console.log("Wix Integration Status:", {
      isInWix,
      instance,
      locale,
      viewMode
    });
    
    // Adjust iframe height when params are loaded
    adjustHeight();
  }, [isInWix, instance, locale, viewMode, adjustHeight]);
  
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
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <WixApp>
          <Router />
          <Toaster />
        </WixApp>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
