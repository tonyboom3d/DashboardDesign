import React, { useEffect } from 'react';
import { useSettings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';
import { useWixIframe } from '@/hooks/use-wix-iframe';
import { useIframeParams } from '@/hooks/use-iframe-params';
import { GeneralSettingsCard } from '@/components/dashboard/general-settings-card';
import { CustomizationCard } from '@/components/dashboard/customization-card';
import { VisibilityCard } from '@/components/dashboard/visibility-card';
import { ProductsCard } from '@/components/dashboard/products-card';
import { AnalyticsCard } from '@/components/dashboard/analytics-card';
import { PreviewCard } from '@/components/dashboard/preview-card';
import { Button } from '@/components/ui/button';
import { List, HelpCircle, Settings, Save, Info, ExternalLink } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { state, saveSettings } = useSettings();
  const { toast } = useToast();
  const { isDirty, isLoading } = state;
  const { adjustHeight, setSuccess, setError, setLoading, isInWix } = useWixIframe();
  // Effect to update Wix parent when loading state changes
  useEffect(() => {
    if (isInWix && isLoading) {
      setLoading('Loading settings...');
    } else {
      adjustHeight(); // Ensure iframe height is correct
    }
  }, [isLoading, isInWix, setLoading, adjustHeight]);
  
  // Handle saving settings
  const handleSave = async () => {
    setLoading('Saving your settings...');
    try {
      // Make sure we're passing the necessary parameters expected by the Wix backend
      const { instanceId } = state.settings;
      if (!instanceId) {
        throw new Error("No instanceId found. Settings cannot be saved without an instanceId.");
      }
      
      // Get current enabled status and other properties
      const { enabled = true } = state.settings;
      
      console.log('About to save settings with instanceId:', instanceId);
      
      // Create a complete settings object for saving
      const completeSettings = {
        ...state.settings,
        instanceId,
        enabled,
      };
      
      // Log the full settings object we're about to save
      console.log('Full settings object being sent:', JSON.stringify(completeSettings, null, 2));
      
      // Pass the complete settings to save, ensuring instanceId is included
      const savedSettings = await saveSettings();
      
      console.log('Settings saved successfully:', savedSettings);
      setSuccess('Settings saved successfully');
      adjustHeight();
      
      // Show success toast
      toast({
        title: 'Success',
        description: 'Your settings have been saved successfully.',
        variant: 'default',
      });
      
      return savedSettings;
    } catch (error) {
      console.error('Failed to save settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to save settings: ${errorMessage}`);
      
      // Show more detailed error in toast
      toast({
        title: 'Error Saving Settings',
        description: `${errorMessage}. Please check the console for more details.`,
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <List className="h-8 w-8 text-primary-500" />
            <h1 className="text-xl font-bold text-gray-900">Free Shipping Bar</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              className="text-primary-600 bg-primary-50 hover:bg-primary-100 border-primary-100"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Help
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
            >
              <Settings className="h-4 w-4 mr-1" />
              Upgrade
            </Button>
            <Button 
              type="button" 
              variant="default" 
              size="sm"
              disabled={!isDirty || isLoading}
              onClick={handleSave}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Wix Integration Info Banner - only shown when in Wix iframe */}
        {isInWix && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 mx-4 sm:mx-6 lg:mx-8 mt-4 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Wix Integration Active</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Your changes will be saved to your Wix site.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 lg:p-8 pt-0">
          {/* Left Column: Configuration options */}
          <div className="lg:col-span-8 space-y-6">
            <GeneralSettingsCard />
            <CustomizationCard />
            <VisibilityCard />
            <ProductsCard />
            <AnalyticsCard />
          </div>
          
          {/* Right Column: Preview */}
          <div className="lg:col-span-4">
            <PreviewCard />
            
            {/* Wix Documentation Links - shown only in Wix iframe */}
            {isInWix && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Resources</h3>
                <ul className="space-y-2">
                  <li>
                    <a 
                      href="https://support.wix.com/en/article/wix-stores-adding-a-free-shipping-bar" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center text-sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      Adding a Free Shipping Bar
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://support.wix.com/en/article/wix-stores-setting-up-shipping-rules" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center text-sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      Setting Up Shipping Rules
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
