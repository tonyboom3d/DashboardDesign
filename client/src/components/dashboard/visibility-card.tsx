import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  Package,
  ShoppingCart,
  Layers,
  Activity,
} from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { cn } from '@/lib/utils';

export const VisibilityCard: React.FC = () => {
  const { state, updateSettings } = useSettings();
  const { settings } = state;
  
  // Helper to update visibility for a page type and device
  const updateVisibility = (
    page: keyof typeof settings.visibility, 
    device: 'desktop' | 'mobile', 
    value: boolean
  ) => {
    updateSettings({
      visibility: {
        ...settings.visibility,
        [page]: {
          ...settings.visibility[page],
          [device]: value
        }
      }
    });
  };
  
  // Set position (top/bottom)
  const setPosition = (position: 'top' | 'bottom') => {
    updateSettings({ position });
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Visibility & Placement</h2>
        
        <div className="space-y-6">
          {/* Visibility Toggles */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Show On</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Product Page</span>
                </div>
                <div className="flex items-center">
                  <div className="relative inline-block w-8 align-middle select-none mr-2">
                    <Switch 
                      id="productPageDesktop"
                      checked={settings.visibility.productPage.desktop}
                      onCheckedChange={(checked) => updateVisibility('productPage', 'desktop', checked)}
                      className="w-8 h-4"
                    />
                  </div>
                  <span className="text-xs text-gray-500 mr-3">Desktop</span>
                  
                  <div className="relative inline-block w-8 align-middle select-none mr-2">
                    <Switch 
                      id="productPageMobile"
                      checked={settings.visibility.productPage.mobile}
                      onCheckedChange={(checked) => updateVisibility('productPage', 'mobile', checked)}
                      className="w-8 h-4"
                    />
                  </div>
                  <span className="text-xs text-gray-500">Mobile</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Cart Page</span>
                </div>
                <div className="flex items-center">
                  <div className="relative inline-block w-8 align-middle select-none mr-2">
                    <Switch 
                      id="cartPageDesktop"
                      checked={settings.visibility.cartPage.desktop}
                      onCheckedChange={(checked) => updateVisibility('cartPage', 'desktop', checked)}
                      className="w-8 h-4"
                    />
                  </div>
                  <span className="text-xs text-gray-500 mr-3">Desktop</span>
                  
                  <div className="relative inline-block w-8 align-middle select-none mr-2">
                    <Switch 
                      id="cartPageMobile"
                      checked={settings.visibility.cartPage.mobile}
                      onCheckedChange={(checked) => updateVisibility('cartPage', 'mobile', checked)}
                      className="w-8 h-4"
                    />
                  </div>
                  <span className="text-xs text-gray-500">Mobile</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Layers className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Mini Cart</span>
                </div>
                <div className="flex items-center">
                  <div className="relative inline-block w-8 align-middle select-none mr-2">
                    <Switch 
                      id="miniCartDesktop"
                      checked={settings.visibility.miniCart.desktop}
                      onCheckedChange={(checked) => updateVisibility('miniCart', 'desktop', checked)}
                      className="w-8 h-4"
                    />
                  </div>
                  <span className="text-xs text-gray-500 mr-3">Desktop</span>
                  
                  <div className="relative inline-block w-8 align-middle select-none mr-2">
                    <Switch 
                      id="miniCartMobile"
                      checked={settings.visibility.miniCart.mobile}
                      onCheckedChange={(checked) => updateVisibility('miniCart', 'mobile', checked)}
                      className="w-8 h-4"
                    />
                  </div>
                  <span className="text-xs text-gray-500">Mobile</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Header</span>
                </div>
                <div className="flex items-center">
                  <div className="relative inline-block w-8 align-middle select-none mr-2">
                    <Switch 
                      id="headerDesktop"
                      checked={settings.visibility.header.desktop}
                      onCheckedChange={(checked) => updateVisibility('header', 'desktop', checked)}
                      className="w-8 h-4"
                    />
                  </div>
                  <span className="text-xs text-gray-500 mr-3">Desktop</span>
                  
                  <div className="relative inline-block w-8 align-middle select-none mr-2">
                    <Switch 
                      id="headerMobile"
                      checked={settings.visibility.header.mobile}
                      onCheckedChange={(checked) => updateVisibility('header', 'mobile', checked)}
                      className="w-8 h-4"
                    />
                  </div>
                  <span className="text-xs text-gray-500">Mobile</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Position */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Position</h3>
            <div className="inline-flex items-center rounded-md shadow-sm">
              <Button
                variant="outline"
                type="button"
                onClick={() => setPosition('top')}
                className={cn(
                  "px-4 py-2 rounded-l-md",
                  settings.position === 'top' && "bg-primary-50 border-primary-500 text-primary-500"
                )}
              >
                Top
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => setPosition('bottom')}
                className={cn(
                  "px-4 py-2 rounded-r-md",
                  settings.position === 'bottom' && "bg-primary-50 border-primary-500 text-primary-500"
                )}
              >
                Bottom
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
