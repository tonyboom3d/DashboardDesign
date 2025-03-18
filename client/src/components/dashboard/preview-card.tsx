import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBarPreview } from '@/components/ui/progress-bar-preview';
import { useSettings } from '@/hooks/use-settings';
import { cn } from '@/lib/utils';
import { Monitor, Smartphone, Plus, Minus } from 'lucide-react';

export const PreviewCard: React.FC = () => {
  const { state, updatePreview } = useSettings();
  const { settings, preview } = state;

  // Set preview device (desktop/mobile)
  const setPreviewDevice = (device: 'desktop' | 'mobile') => {
    updatePreview({ device });
  };

  // Increase cart value
  const increaseCartValue = () => {
    updatePreview({ currentCartValue: preview.currentCartValue + 500 }); // Add $5.00
  };

  // Decrease cart value
  const decreaseCartValue = () => {
    updatePreview({ currentCartValue: Math.max(preview.currentCartValue - 500, 0) }); // Subtract $5.00, min 0
  };

  return (
    <div className="space-y-6 relative">
      <Card className="sticky top-4 z-50 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Live Preview</h2>
        </div>

        <div className="p-4">
          <div className="flex justify-end mb-4">
            <div className="inline-flex items-center rounded-md shadow-sm">
              <Button
                variant="outline"
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={cn(
                  "px-4 py-2 rounded-l-md",
                  preview.device === 'desktop' && "bg-primary-50 border-primary-500 text-primary-500"
                )}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={cn(
                  "px-4 py-2 rounded-r-md",
                  preview.device === 'mobile' && "bg-primary-50 border-primary-500 text-primary-500"
                )}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <PreviewContent 
              settings={settings} 
              preview={preview} 
              decreaseCartValue={decreaseCartValue}
              increaseCartValue={increaseCartValue}
            />
          </div>
        </div>
      </Card>


    </div>
  );
};

interface PreviewContentProps {
  settings: any;
  preview: any;
  decreaseCartValue: () => void;
  increaseCartValue: () => void;
}

const PreviewContent: React.FC<PreviewContentProps> = ({ 
  settings, 
  preview, 
  decreaseCartValue, 
  increaseCartValue 
}) => {
  return (
    <>
      <div className="p-4 flex items-center justify-between text-sm text-gray-500">
        <span>Current Cart: $<span>{(preview.currentCartValue / 100).toFixed(2)}</span></span>
        <div className="flex items-center space-x-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={decreaseCartValue}
            className="text-gray-400 hover:text-gray-600"
          >
            <Minus className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={increaseCartValue}
            className="text-gray-400 hover:text-gray-600"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className={cn(
        "mx-4 mb-4",
        preview.device === 'mobile' ? 'max-w-[320px] mx-auto' : 'w-full'
      )}>
        <ProgressBarPreview 
          settings={settings}
          previewState={preview}
        />
      </div>
    </>
  );
};