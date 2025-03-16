import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { 
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
} from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { cn } from '@/lib/utils';

export const CustomizationCard: React.FC = () => {
  const { state, updateSettings } = useSettings();
  const { settings } = state;
  
  // For color pickers
  const [activeColorField, setActiveColorField] = useState<string | null>(null);
  
  // Helper to update colors
  const updateColor = (field: keyof typeof settings.colors, value: string) => {
    updateSettings({
      colors: {
        ...settings.colors,
        [field]: value
      }
    });
  };
  
  // Helper to update border
  const updateBorder = (field: keyof typeof settings.border, value: any) => {
    updateSettings({
      border: {
        ...settings.border,
        [field]: field === 'thickness' ? Number(value) : value
      }
    });
  };
  
  // Helper to update text
  const updateText = (field: keyof typeof settings.text, value: string) => {
    updateSettings({
      text: {
        ...settings.text,
        [field]: value
      }
    });
  };
  
  // Helper to update icon
  const updateIcon = (field: keyof typeof settings.icon, value: any) => {
    updateSettings({
      icon: {
        ...settings.icon,
        [field]: value
      }
    });
  };
  
  const setTextAlignment = (alignment: 'left' | 'center' | 'right') => {
    updateSettings({ textAlignment: alignment });
  };
  
  const setTextDirection = (direction: 'ltr' | 'rtl') => {
    updateSettings({ textDirection: direction });
  };
  
  const setBarStyle = (style: 'simple' | 'gradient') => {
    updateSettings({ barStyle: style });
  };
  
  const selectIcon = (icon: string) => {
    updateIcon('selection', icon);
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Customization Options</h2>
        
        <div className="space-y-6">
          {/* Bar Style Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Bar Style</h3>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => setBarStyle('simple')}
                className={cn(
                  "border-2 rounded-md p-3 flex items-center justify-center cursor-pointer",
                  settings.barStyle === 'simple' 
                    ? "border-primary-500 bg-primary-50" 
                    : "border-gray-200 hover:bg-gray-50"
                )}
              >
                <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <span className={cn(
                  "text-xs font-medium ml-2",
                  settings.barStyle === 'simple' ? "text-primary-600" : "text-gray-600"
                )}>Simple</span>
              </div>
              
              <div 
                onClick={() => setBarStyle('gradient')} 
                className={cn(
                  "border-2 rounded-md p-3 flex items-center justify-center cursor-pointer",
                  settings.barStyle === 'gradient' 
                    ? "border-primary-500 bg-primary-50" 
                    : "border-gray-200 hover:bg-gray-50"
                )}
              >
                <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: '60%',
                      background: 'linear-gradient(to right, #3384FF, #10B981)'
                    }}
                  ></div>
                </div>
                <span className={cn(
                  "text-xs font-medium ml-2",
                  settings.barStyle === 'gradient' ? "text-primary-600" : "text-gray-600"
                )}>Gradient</span>
              </div>
            </div>
          </div>
          
          {/* Colors Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Colors</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 mb-1">Background Color</Label>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-md border border-gray-300 overflow-hidden mr-2">
                    <Input 
                      type="color" 
                      id="backgroundColor" 
                      value={settings.colors.background}
                      onChange={(e) => updateColor('background', e.target.value)}
                      className="h-10 w-10 transform -translate-y-1 -translate-x-1 cursor-pointer"
                    />
                  </div>
                  <Input 
                    type="text" 
                    value={settings.colors.background}
                    onChange={(e) => updateColor('background', e.target.value)}
                    className="block w-full py-1.5 px-3 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="barColor" className="block text-sm font-medium text-gray-700 mb-1">Bar Color</Label>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-md border border-gray-300 overflow-hidden mr-2">
                    <Input 
                      type="color" 
                      id="barColor" 
                      value={settings.colors.bar}
                      onChange={(e) => updateColor('bar', e.target.value)}
                      className="h-10 w-10 transform -translate-y-1 -translate-x-1 cursor-pointer" 
                    />
                  </div>
                  <Input 
                    type="text" 
                    value={settings.colors.bar}
                    onChange={(e) => updateColor('bar', e.target.value)}
                    className="block w-full py-1.5 px-3 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="progressBgColor" className="block text-sm font-medium text-gray-700 mb-1">Progress Background</Label>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-md border border-gray-300 overflow-hidden mr-2">
                    <Input 
                      type="color" 
                      id="progressBgColor" 
                      value={settings.colors.progressBg}
                      onChange={(e) => updateColor('progressBg', e.target.value)}
                      className="h-10 w-10 transform -translate-y-1 -translate-x-1 cursor-pointer"
                    />
                  </div>
                  <Input 
                    type="text" 
                    value={settings.colors.progressBg}
                    onChange={(e) => updateColor('progressBg', e.target.value)}
                    className="block w-full py-1.5 px-3 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="textColor" className="block text-sm font-medium text-gray-700 mb-1">Text Color</Label>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-md border border-gray-300 overflow-hidden mr-2">
                    <Input 
                      type="color" 
                      id="textColor" 
                      value={settings.colors.text}
                      onChange={(e) => updateColor('text', e.target.value)}
                      className="h-10 w-10 transform -translate-y-1 -translate-x-1 cursor-pointer"
                    />
                  </div>
                  <Input 
                    type="text" 
                    value={settings.colors.text}
                    onChange={(e) => updateColor('text', e.target.value)}
                    className="block w-full py-1.5 px-3 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="accentColor" className="block text-sm font-medium text-gray-700 mb-1">Accent Color</Label>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-md border border-gray-300 overflow-hidden mr-2">
                    <Input 
                      type="color" 
                      id="accentColor" 
                      value={settings.colors.accent}
                      onChange={(e) => updateColor('accent', e.target.value)}
                      className="h-10 w-10 transform -translate-y-1 -translate-x-1 cursor-pointer"
                    />
                  </div>
                  <Input 
                    type="text" 
                    value={settings.colors.accent}
                    onChange={(e) => updateColor('accent', e.target.value)}
                    className="block w-full py-1.5 px-3 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="highlightColor" className="block text-sm font-medium text-gray-700 mb-1">Highlight Color</Label>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-md border border-gray-300 overflow-hidden mr-2">
                    <Input 
                      type="color" 
                      id="highlightColor" 
                      value={settings.colors.highlight}
                      onChange={(e) => updateColor('highlight', e.target.value)}
                      className="h-10 w-10 transform -translate-y-1 -translate-x-1 cursor-pointer"
                    />
                  </div>
                  <Input 
                    type="text" 
                    value={settings.colors.highlight}
                    onChange={(e) => updateColor('highlight', e.target.value)}
                    className="block w-full py-1.5 px-3 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Border Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="borderColor" className="block text-sm font-medium text-gray-700 mb-1">Border Color</Label>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-md border border-gray-300 overflow-hidden mr-2">
                  <Input 
                    type="color" 
                    id="borderColor" 
                    value={settings.border.color}
                    onChange={(e) => updateBorder('color', e.target.value)}
                    className="h-10 w-10 transform -translate-y-1 -translate-x-1 cursor-pointer"
                  />
                </div>
                <Input 
                  type="text" 
                  value={settings.border.color}
                  onChange={(e) => updateBorder('color', e.target.value)}
                  className="block w-full py-1.5 px-3 text-sm"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="borderThickness" className="block text-sm font-medium text-gray-700 mb-1">Border Thickness</Label>
              <div className="flex items-center space-x-4">
                <Slider 
                  id="borderThickness"
                  min={0}
                  max={5}
                  step={1}
                  value={[settings.border.thickness]}
                  onValueChange={(value) => updateBorder('thickness', value[0])}
                  className="w-full"
                />
                <span className="text-sm font-medium text-gray-900 w-8 text-right">{settings.border.thickness}px</span>
              </div>
            </div>
          </div>
          
          {/* Text Content */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Text Content</h3>
            
            <div>
              <Label htmlFor="barText" className="block text-sm font-medium text-gray-700 mb-1">Bar Text</Label>
              <Input 
                id="barText" 
                type="text" 
                value={settings.text.barText}
                onChange={(e) => updateText('barText', e.target.value)}
                className="block w-full"
              />
              <p className="mt-1 text-xs text-gray-500">Use ${'{remaining}'} as a placeholder for the amount needed.</p>
            </div>
            
            <div>
              <Label htmlFor="successText" className="block text-sm font-medium text-gray-700 mb-1">Success Message</Label>
              <Input 
                id="successText" 
                type="text" 
                value={settings.text.successText}
                onChange={(e) => updateText('successText', e.target.value)}
                className="block w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="buttonText" className="block text-sm font-medium text-gray-700 mb-1">Button Text</Label>
              <Input 
                id="buttonText" 
                type="text" 
                value={settings.text.buttonText}
                onChange={(e) => updateText('buttonText', e.target.value)}
                className="block w-full"
              />
            </div>
          </div>
          
          {/* Text Format */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="textAlignment" className="block text-sm font-medium text-gray-700 mb-1">Text Alignment</Label>
              <div className="inline-flex items-center rounded-md shadow-sm">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setTextAlignment('left')}
                  className={cn(
                    "px-4 py-2 rounded-l-md",
                    settings.textAlignment === 'left' && "bg-primary-50 border-primary-500 text-primary-500"
                  )}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setTextAlignment('center')}
                  className={cn(
                    "px-4 py-2 rounded-none",
                    settings.textAlignment === 'center' && "bg-primary-50 border-primary-500 text-primary-500"
                  )}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setTextAlignment('right')}
                  className={cn(
                    "px-4 py-2 rounded-r-md",
                    settings.textAlignment === 'right' && "bg-primary-50 border-primary-500 text-primary-500"
                  )}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="textDirection" className="block text-sm font-medium text-gray-700 mb-1">Text Direction</Label>
              <div className="inline-flex items-center rounded-md shadow-sm">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setTextDirection('ltr')}
                  className={cn(
                    "px-4 py-2 rounded-l-md",
                    settings.textDirection === 'ltr' && "bg-primary-50 border-primary-500 text-primary-500"
                  )}
                >
                  LTR
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setTextDirection('rtl')}
                  className={cn(
                    "px-4 py-2 rounded-r-md",
                    settings.textDirection === 'rtl' && "bg-primary-50 border-primary-500 text-primary-500"
                  )}
                >
                  RTL
                </Button>
              </div>
            </div>
          </div>
          
          {/* Icon Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Icon</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="iconType" className="block text-sm font-medium text-gray-700 mb-1">Icon Type</Label>
                <select 
                  id="iconType" 
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={settings.icon.type}
                  onChange={(e) => updateIcon('type', e.target.value)}
                >
                  <option value="emoji">Emoji</option>
                  <option value="lucide">Lucide Icon</option>
                  <option value="none">No Icon</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="iconPosition" className="block text-sm font-medium text-gray-700 mb-1">Position</Label>
                <select 
                  id="iconPosition" 
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={settings.icon.position}
                  onChange={(e) => updateIcon('position', e.target.value as 'before' | 'after')}
                >
                  <option value="before">Before Text</option>
                  <option value="after">After Text</option>
                </select>
              </div>
            </div>
            
            {settings.icon.type === 'emoji' && (
              <div id="iconSelector" className="p-2 border border-gray-200 rounded-md bg-gray-50">
                <div className="grid grid-cols-6 gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => selectIcon('🚚')}
                    className={cn(
                      "h-8 w-8 p-0 flex items-center justify-center",
                      settings.icon.selection === '🚚' && "border-primary-500 bg-primary-50"
                    )}
                  >
                    🚚
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => selectIcon('🎁')}
                    className={cn(
                      "h-8 w-8 p-0 flex items-center justify-center",
                      settings.icon.selection === '🎁' && "border-primary-500 bg-primary-50"
                    )}
                  >
                    🎁
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => selectIcon('💰')}
                    className={cn(
                      "h-8 w-8 p-0 flex items-center justify-center",
                      settings.icon.selection === '💰' && "border-primary-500 bg-primary-50"
                    )}
                  >
                    💰
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => selectIcon('🛍️')}
                    className={cn(
                      "h-8 w-8 p-0 flex items-center justify-center",
                      settings.icon.selection === '🛍️' && "border-primary-500 bg-primary-50"
                    )}
                  >
                    🛍️
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => selectIcon('💸')}
                    className={cn(
                      "h-8 w-8 p-0 flex items-center justify-center",
                      settings.icon.selection === '💸' && "border-primary-500 bg-primary-50"
                    )}
                  >
                    💸
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => selectIcon('🏷️')}
                    className={cn(
                      "h-8 w-8 p-0 flex items-center justify-center",
                      settings.icon.selection === '🏷️' && "border-primary-500 bg-primary-50"
                    )}
                  >
                    🏷️
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
