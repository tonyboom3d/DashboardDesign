import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/hooks/use-settings';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const GeneralSettingsCard: React.FC = () => {
  const { state, updateSettings } = useSettings();
  const { settings } = state;

  // Handle enable/disable toggle
  const handleEnableToggle = (checked: boolean) => {
    updateSettings({ enabled: checked });
  };

  // Handle threshold change
  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    const numericValue = parseFloat(value);
    
    if (!isNaN(numericValue)) {
      // Convert dollars to cents and update
      updateSettings({ threshold: Math.round(numericValue * 100) });
    }
  };

  // Handle product suggestion method change
  const handleSuggestionMethodChange = (value: string) => {
    updateSettings({ 
      productSuggestionMethod: value as 'manual' | 'automatic' | 'bestselling' | 'related' 
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableBar" className="font-medium text-gray-700">Enable Free Shipping Bar</Label>
              <p className="text-sm text-gray-500">Show the progress bar to your customers</p>
            </div>
            <Switch 
              id="enableBar" 
              checked={settings.enabled} 
              onCheckedChange={handleEnableToggle}
            />
          </div>
          
          <div>
            <Label htmlFor="threshold" className="block font-medium text-gray-700 mb-1">Free Shipping Threshold</Label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <Input
                id="threshold"
                type="text"
                className="pl-7 pr-12"
                value={(settings.threshold / 100).toFixed(2)}
                onChange={handleThresholdChange}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">USD</span>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="productSuggestion" className="block font-medium text-gray-700 mb-1">Product Suggestion Method</Label>
            <Select 
              value={settings.productSuggestionMethod} 
              onValueChange={handleSuggestionMethodChange}
            >
              <SelectTrigger id="productSuggestion" className="w-full">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual selection</SelectItem>
                <SelectItem value="automatic">Automatic (based on price)</SelectItem>
                <SelectItem value="bestselling">Best-selling products</SelectItem>
                <SelectItem value="related">Related to cart items</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
