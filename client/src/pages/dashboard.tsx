import React from 'react';
import { useSettings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';
import { GeneralSettingsCard } from '@/components/dashboard/general-settings-card';
import { CustomizationCard } from '@/components/dashboard/customization-card';
import { VisibilityCard } from '@/components/dashboard/visibility-card';
import { ProductsCard } from '@/components/dashboard/products-card';
import { AnalyticsCard } from '@/components/dashboard/analytics-card';
import { PreviewCard } from '@/components/dashboard/preview-card';
import { Button } from '@/components/ui/button';
import { List, HelpCircle, Settings, Save } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { state, saveSettings } = useSettings();
  const { toast } = useToast();
  const { isDirty, isLoading } = state;
  
  const handleSave = async () => {
    try {
      await saveSettings();
    } catch (error) {
      console.error('Failed to save settings:', error);
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 lg:p-8">
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
