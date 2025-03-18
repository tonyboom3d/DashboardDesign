import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Palette,
  ArrowLeftRight,
  Languages,
} from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { cn } from '@/lib/utils';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const CustomizationCard: React.FC = () => {
  const { state, updateSettings } = useSettings();
  const settings = state.settings || {};
  // Set default colors if not available
  const backgroundColor = settings.colors?.backgroundColor || '#FFFFFF';

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
  
  // Helper to update progress bar border
  const updateProgressBarBorder = (field: keyof typeof settings.progressBarBorder, value: any) => {
    updateSettings({
      progressBarBorder: {
        ...settings.progressBarBorder,
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

  const setTextPosition = (position: 'above' | 'below') => {
    updateSettings({ textPosition: position });
  };

  const setProgressDirection = (direction: 'ltr' | 'rtl') => {
    updateSettings({ progressDirection: direction });
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
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="appearance" className="border rounded-lg px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-gray-500" />
                  <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pt-2 pb-4 space-y-6">
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
                          background: `linear-gradient(to right, ${settings.colors?.bar || '#3384FF'}, ${settings.colors?.gradientEnd || '#10B981'})`
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
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-md border border-gray-300 overflow-hidden mr-2">
                        <Input 
                          type="color" 
                          id="backgroundColor" 
                          value={settings.colors?.backgroundColor || '#FFFFFF'}
                          onChange={(e) => updateColor('backgroundColor', e.target.value)}
                          className="h-10 w-10 transform -translate-y-1 -translate-x-1 cursor-pointer"
                        />
                      </div>
                      <Input 
                        type="text" 
                        value={settings.colors?.backgroundColor || '#FFFFFF'}
                        onChange={(e) => updateColor('backgroundColor', e.target.value)}
                        className="block w-full py-1.5 px-3 text-sm"
                        placeholder="#FFFFFF"
                      />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {["#FFFFFF", "#F9FAFB", "#F3F4F6", "#E5E7EB", "#D1D5DB"].map(color => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            "w-6 h-6 rounded-md border",
                            settings.colors?.backgroundColor === color ? "ring-2 ring-primary-500" : "ring-1 ring-gray-200"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => updateColor('backgroundColor', color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="barColor" className="block text-sm font-medium text-gray-700 mb-1">
                      {settings.barStyle === 'gradient' ? 'Start Color' : 'Bar Color'}
                    </Label>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-md border border-gray-300 overflow-hidden mr-2">
                        <Input 
                          type="color" 
                          id="barColor" 
                          value={settings.colors?.bar || '#0070F3'}
                          onChange={(e) => updateColor('bar', e.target.value)}
                          className="h-10 w-10 transform -translate-y-1 -translate-x-1 cursor-pointer" 
                        />
                      </div>
                      <Input 
                        type="text" 
                        value={settings.colors?.bar || '#0070F3'}
                        onChange={(e) => updateColor('bar', e.target.value)}
                        className="block w-full py-1.5 px-3 text-sm"
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["#0070F3", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"].map(color => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            "w-6 h-6 rounded-md border",
                            settings.colors?.bar === color ? "ring-2 ring-primary-500" : "ring-1 ring-gray-200"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => updateColor('bar', color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Secondary color (gradient end) - only shown when gradient style is selected */}
                  {settings.barStyle === 'gradient' && (
                    <div>
                      <Label htmlFor="gradientEndColor" className="block text-sm font-medium text-gray-700 mb-1">End Color</Label>
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-md border border-gray-300 overflow-hidden mr-2">
                          <Input 
                            type="color" 
                            id="gradientEndColor" 
                            value={settings.colors?.gradientEnd || '#10B981'}
                            onChange={(e) => updateColor('gradientEnd', e.target.value)}
                            className="h-10 w-10 transform -translate-y-1 -translate-x-1 cursor-pointer" 
                          />
                        </div>
                        <Input 
                          type="text" 
                          value={settings.colors?.gradientEnd || '#10B981'}
                          onChange={(e) => updateColor('gradientEnd', e.target.value)}
                          className="block w-full py-1.5 px-3 text-sm"
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {["#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#0070F3"].map(color => (
                          <button
                            key={color}
                            type="button"
                            className={cn(
                              "w-6 h-6 rounded-md border",
                              settings.colors?.gradientEnd === color ? "ring-2 ring-primary-500" : "ring-1 ring-gray-200"
                            )}
                            style={{ backgroundColor: color }}
                            onClick={() => updateColor('gradientEnd', color)}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="progressBgColor" className="block text-sm font-medium text-gray-700 mb-1">Progress Background</Label>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-md border border-gray-300 overflow-hidden mr-2">
                        <Input 
                          type="color" 
                          id="progressBgColor" 
                          value={settings.colors?.progressBg || '#E5E7EB'}
                          onChange={(e) => updateColor('progressBg', e.target.value)}
                          className="h-10 w-10 transform -translate-y-1 -translate-x-1 cursor-pointer"
                        />
                      </div>
                      <Input 
                        type="text" 
                        value={settings.colors?.progressBg || '#E5E7EB'}
                        onChange={(e) => updateColor('progressBg', e.target.value)}
                        className="block w-full py-1.5 px-3 text-sm"
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["#E5E7EB", "#F3F4F6", "#E0F2FE", "#E0E7FF", "#FCE7F3"].map(color => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            "w-6 h-6 rounded-md border",
                            settings.colors?.progressBg === color ? "ring-2 ring-primary-500" : "ring-1 ring-gray-200"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => updateColor('progressBg', color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="textColor" className="block text-sm font-medium text-gray-700 mb-1">Text Color</Label>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-md border border-gray-300 overflow-hidden mr-2">
                        <Input 
                          type="color" 
                          id="textColor" 
                          value={settings.colors?.text || '#000000'}
                          onChange={(e) => updateColor('text', e.target.value)}
                          className="h-10 w-10 transform -translate-y-1 -translate-x-1 cursor-pointer"
                        />
                      </div>
                      <Input 
                        type="text" 
                        value={settings.colors?.text || '#000000'}
                        onChange={(e) => updateColor('text', e.target.value)}
                        className="block w-full py-1.5 px-3 text-sm"
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["#000000", "#111827", "#374151", "#4B5563", "#6B7280"].map(color => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            "w-6 h-6 rounded-md border",
                            settings.colors?.text === color ? "ring-2 ring-primary-500" : "ring-1 ring-gray-200"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => updateColor('text', color)}
                          title={color}
                        />
                      ))}
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
                        value={settings.border?.color || '#E5E7EB'}
                        onChange={(e) => updateBorder('color', e.target.value)}
                        className="h-10 w-10 transform -translate-y-1 -translate-x-1 cursor-pointer"
                      />
                    </div>
                    <Input 
                      type="text" 
                      value={settings.border?.color || '#E5E7EB'}
                      onChange={(e) => updateBorder('color', e.target.value)}
                      className="block w-full py-1.5 px-3 text-sm"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["#E5E7EB", "#D1D5DB", "#9CA3AF", "#6B7280", "transparent"].map(color => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "w-6 h-6 rounded-md border",
                          settings.border?.color === color ? "ring-2 ring-primary-500" : "ring-1 ring-gray-200"
                        )}
                        style={{ 
                          backgroundColor: color === 'transparent' ? 'white' : color,
                          backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0), linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0)' : 'none',
                          backgroundSize: '6px 6px',
                          backgroundPosition: '0 0, 3px 3px'
                        }}
                        onClick={() => updateBorder('color', color)}
                        title={color}
                      />
                    ))}
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
                      value={[settings.border?.thickness || 0]}
                      onValueChange={(value) => updateBorder('thickness', value[0])}
                      className="w-full"
                    />
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{settings.border?.thickness || 0}px</span>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar Border Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="progressBarColor" className="block text-sm font-medium text-gray-700 mb-1">Progress Bar Border Color</Label>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-md border border-gray-300 overflow-hidden mr-2">
                      <Input 
                        type="color" 
                        id="progressBarColor" 
                        value={settings.progressBarBorder?.color || '#0070F3'}
                        onChange={(e) => updateProgressBarBorder('color', e.target.value)}
                        className="h-10 w-10 transform -translate-y-1 -translate-x-1 cursor-pointer"
                      />
                    </div>
                    <Input 
                      type="text" 
                      value={settings.progressBarBorder?.color || '#0070F3'}
                      onChange={(e) => updateProgressBarBorder('color', e.target.value)}
                      className="block w-full py-1.5 px-3 text-sm"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["#0070F3", "#10B981", "#F59E0B", "#EF4444", "transparent"].map(color => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "w-6 h-6 rounded-md border",
                          settings.progressBarBorder?.color === color ? "ring-2 ring-primary-500" : "ring-1 ring-gray-200",
                          color === "transparent" && "bg-gray-100"
                        )}
                        style={{ backgroundColor: color === "transparent" ? "transparent" : color }}
                        onClick={() => updateProgressBarBorder('color', color)}
                        title={color}
                      >
                        {color === "transparent" && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-5/6 h-0.5 bg-gray-400 rotate-45" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="progressBarThickness" className="block text-sm font-medium text-gray-700 mb-1">Progress Bar Border Thickness</Label>
                  <div className="flex items-center space-x-4">
                    <Slider 
                      id="progressBarThickness"
                      min={0}
                      max={5}
                      step={1}
                      value={[settings.progressBarBorder?.thickness || 0]}
                      onValueChange={(value) => updateProgressBarBorder('thickness', value[0])}
                      className="w-full"
                    />
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{settings.progressBarBorder?.thickness || 0}px</span>
                  </div>
                </div>
              </div>

              {/* Text Alignment */}
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
              
              {/* Text Direction */}
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
                    <ArrowLeftRight className="h-4 w-4" />
                    <span className="ml-2">Left-to-Right</span>
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
                    <Languages className="h-4 w-4" />
                    <span className="ml-2">Right-to-Left</span>
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Set Right-to-Left (RTL) for Hebrew, Arabic, or other RTL languages.</p>
              </div>
              
              {/* Text Position */}
              <div>
                <Label htmlFor="textPosition" className="block text-sm font-medium text-gray-700 mb-1">Text Position</Label>
                <div className="inline-flex items-center rounded-md shadow-sm">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setTextPosition('above')}
                    className={cn(
                      "px-4 py-2 rounded-l-md",
                      settings.textPosition === 'above' && "bg-primary-50 border-primary-500 text-primary-500"
                    )}
                  >
                    <span>Above Bar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setTextPosition('below')}
                    className={cn(
                      "px-4 py-2 rounded-r-md",
                      settings.textPosition === 'below' && "bg-primary-50 border-primary-500 text-primary-500"
                    )}
                  >
                    <span>Below Bar</span>
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Position the message text above or below the progress bar.</p>
              </div>
              
              {/* Progress Bar Direction */}
              <div>
                <Label htmlFor="progressDirection" className="block text-sm font-medium text-gray-700 mb-1">Progress Bar Direction</Label>
                <div className="inline-flex items-center rounded-md shadow-sm">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setProgressDirection('ltr')}
                    className={cn(
                      "px-4 py-2 rounded-l-md",
                      settings.progressDirection === 'ltr' && "bg-primary-50 border-primary-500 text-primary-500"
                    )}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    <span className="ml-2">Left-to-Right</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setProgressDirection('rtl')}
                    className={cn(
                      "px-4 py-2 rounded-r-md",
                      settings.progressDirection === 'rtl' && "bg-primary-50 border-primary-500 text-primary-500"
                    )}
                  >
                    <ArrowLeftRight className="h-4 w-4 transform rotate-180" />
                    <span className="ml-2">Right-to-Left</span>
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Choose which direction the progress bar fills from.</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Text Content Accordion */}
          <AccordionItem value="text-content" className="border rounded-lg px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <h3 className="text-lg font-medium text-gray-900">Text Content</h3>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pt-2 pb-4 space-y-4">
              <div>
                <Label htmlFor="barText" className="block text-sm font-medium text-gray-700 mb-1">Bar Text</Label>
                <Input 
                  id="barText" 
                  type="text" 
                  value={settings.text?.barText || ''}
                  onChange={(e) => updateText('barText', e.target.value)}
                  className="block w-full"
                />
                <p className="mt-1 text-xs text-gray-500">Use {'{remaining}'} as a placeholder for the remaining amount.</p>
              </div>

              <div>
                <Label htmlFor="successText" className="block text-sm font-medium text-gray-700 mb-1">Success Message</Label>
                <Input 
                  id="successText" 
                  type="text" 
                  value={settings.text?.successText || ''}
                  onChange={(e) => updateText('successText', e.target.value)}
                  className="block w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="initialText" className="block text-sm font-medium text-gray-700">Initial Text</Label>
                  <Switch 
                    id="showInitialText" 
                    checked={settings.text?.showInitialText || false}
                    onCheckedChange={(checked) => {
                      updateSettings({
                        text: {
                          ...settings.text,
                          showInitialText: checked
                        }
                      });
                    }}
                  />
                </div>
                <Input 
                  id="initialText" 
                  type="text" 
                  value={settings.text?.initialText || ''}
                  onChange={(e) => updateText('initialText', e.target.value)}
                  className="block w-full"
                  disabled={!(settings.text?.showInitialText || false)}
                />
                <p className="mt-1 text-xs text-gray-500">This text will be displayed when the cart is empty.</p>
              </div>

              <div>
                <Label htmlFor="buttonText" className="block text-sm font-medium text-gray-700 mb-1">Button Text</Label>
                <Input 
                  id="buttonText" 
                  type="text" 
                  value={settings.text?.buttonText || ''}
                  onChange={(e) => updateText('buttonText', e.target.value)}
                  className="block w-full"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};