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
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="appearance" className="border rounded-lg px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-gray-500" />
                  <h3 className="text-lg font-medium text-gray-900">עיצוב</h3>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="pt-2 pb-4 space-y-6">
              {/* Bar Style Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">סגנון פס</h3>
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
                      "text-xs font-medium mr-2",
                      settings.barStyle === 'simple' ? "text-primary-600" : "text-gray-600"
                    )}>פשוט</span>
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
                      "text-xs font-medium mr-2",
                      settings.barStyle === 'gradient' ? "text-primary-600" : "text-gray-600"
                    )}>גרדיאנט</span>
                  </div>
                </div>
              </div>
              
              {/* Colors Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">צבעים</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 mb-1">צבע רקע</Label>
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-md border border-gray-300 overflow-hidden">
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
                            settings.colors.background === color ? "ring-2 ring-primary-500" : "ring-1 ring-gray-200"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => updateColor('background', color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="barColor" className="block text-sm font-medium text-gray-700 mb-1">צבע פס</Label>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-md border border-gray-300 overflow-hidden ml-2">
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
                    <Label htmlFor="progressBgColor" className="block text-sm font-medium text-gray-700 mb-1">רקע ההתקדמות</Label>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-md border border-gray-300 overflow-hidden ml-2">
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
                    <Label htmlFor="textColor" className="block text-sm font-medium text-gray-700 mb-1">צבע טקסט</Label>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-md border border-gray-300 overflow-hidden ml-2">
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
                </div>
              </div>
              
              {/* Border Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="borderColor" className="block text-sm font-medium text-gray-700 mb-1">צבע מסגרת</Label>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-md border border-gray-300 overflow-hidden ml-2">
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
                  <Label htmlFor="borderThickness" className="block text-sm font-medium text-gray-700 mb-1">עובי מסגרת</Label>
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
              
              {/* Text Alignment */}
              <div>
                <Label htmlFor="textAlignment" className="block text-sm font-medium text-gray-700 mb-1">יישור טקסט</Label>
                <div className="inline-flex items-center rounded-md shadow-sm">
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
                    onClick={() => setTextAlignment('left')}
                    className={cn(
                      "px-4 py-2 rounded-l-md",
                      settings.textAlignment === 'left' && "bg-primary-50 border-primary-500 text-primary-500"
                    )}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Text Content Accordion */}
          <AccordionItem value="text-content" className="border rounded-lg px-4">
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <h3 className="text-lg font-medium text-gray-900">טקסטים</h3>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <div>
                <Label htmlFor="barText" className="block text-sm font-medium text-gray-700 mb-1">טקסט הפס</Label>
                <Input 
                  id="barText" 
                  type="text" 
                  value={settings.text.barText}
                  onChange={(e) => updateText('barText', e.target.value)}
                  className="block w-full"
                  dir="rtl"
                />
                <p className="mt-1 text-xs text-gray-500">השתמש ב-{'{remaining}'} כמקום שמור לסכום הנותר.</p>
              </div>
              
              <div>
                <Label htmlFor="successText" className="block text-sm font-medium text-gray-700 mb-1">הודעת הצלחה</Label>
                <Input 
                  id="successText" 
                  type="text" 
                  value={settings.text.successText}
                  onChange={(e) => updateText('successText', e.target.value)}
                  className="block w-full"
                  dir="rtl"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="initialText" className="block text-sm font-medium text-gray-700">טקסט התחלתי</Label>
                  <Switch 
                    id="showInitialText" 
                    checked={settings.text.showInitialText}
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
                  value={settings.text.initialText}
                  onChange={(e) => updateText('initialText', e.target.value)}
                  className="block w-full"
                  disabled={!settings.text.showInitialText}
                  dir="rtl"
                />
                <p className="mt-1 text-xs text-gray-500">טקסט זה יוצג כאשר העגלה ריקה.</p>
              </div>
              
              <div>
                <Label htmlFor="buttonText" className="block text-sm font-medium text-gray-700 mb-1">טקסט כפתור</Label>
                <Input 
                  id="buttonText" 
                  type="text" 
                  value={settings.text.buttonText}
                  onChange={(e) => updateText('buttonText', e.target.value)}
                  className="block w-full"
                  dir="rtl"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};