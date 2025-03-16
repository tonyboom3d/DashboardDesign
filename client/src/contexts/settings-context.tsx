import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShippingBarSettings, SettingsContextType, SettingsState, PreviewState, Product } from '@/types/settings';
import { fetchSettings, saveSettings as apiSaveSettings } from '@/api/settings';
import { useIframeParams } from '@/hooks/use-iframe-params';
import { useToast } from '@/hooks/use-toast';

// Default settings
const defaultSettings: ShippingBarSettings = {
  instanceId: 'demo-instance',
  enabled: false,
  threshold: 5000, // $50.00 in cents
  productSuggestionMethod: 'manual',
  barStyle: 'simple',
  colors: {
    background: '#FFFFFF',
    bar: '#0070F3',
    progressBg: '#E5E7EB',
    text: '#111827',
    accent: '#10B981',
    highlight: '#F59E0B'
  },
  border: {
    color: '#E5E7EB',
    thickness: 1
  },
  text: {
    barText: "Add ${remaining} more to get FREE shipping!",
    successText: "🎉 Congratulations! You've qualified for FREE shipping!",
    buttonText: "Add to Cart",
    initialText: "Add items to your cart and get free shipping at $50.00!",
    showInitialText: true
  },
  textAlignment: 'left',
  textDirection: 'ltr',
  icon: {
    type: 'emoji',
    selection: '🚚',
    position: 'before'
  },
  visibility: {
    productPage: { desktop: true, mobile: true },
    cartPage: { desktop: true, mobile: true },
    miniCart: { desktop: true, mobile: true },
    header: { desktop: false, mobile: false }
  },
  position: 'top',
  recommendedProducts: [
    {
      id: '1',
      name: 'Premium T-Shirt',
      price: 2999, // $29.99
      imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=100&h=100&fit=crop&auto=format'
    },
    {
      id: '2',
      name: 'Travel Mug',
      price: 1899, // $18.99
      imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=100&h=100&fit=crop&auto=format'
    },
    {
      id: '3',
      name: 'Leather Wallet',
      price: 3499, // $34.99
      imageUrl: 'https://images.unsplash.com/photo-1604026053328-7fca346fcb26?w=100&h=100&fit=crop&auto=format'
    }
  ],
  analytics: {
    viewCount: 3742,
    conversionRate: '24.8%',
    aov: '$64.37'
  }
};

// Default preview state
const defaultPreview: PreviewState = {
  currentCartValue: 3250, // $32.50 in cents
  device: 'desktop',
  context: 'product'
};

// Initial state
const initialState: SettingsState = {
  settings: defaultSettings,
  preview: defaultPreview,
  isDirty: false,
  isLoading: true,
  error: null
};

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SettingsState>(initialState);
  const { instance } = useIframeParams();
  const { toast } = useToast();

  // Fetch settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      // Use the instance from iframe params or fallback to demo-instance
      const instanceId = instance || 'demo-instance';
      
      try {
        setState(prevState => ({ ...prevState, isLoading: true, error: null }));
        const settings = await fetchSettings(instanceId);
        
        setState(prevState => ({
          ...prevState,
          settings: {
            ...settings,
            instanceId // Ensure instanceId is set
          },
          isLoading: false,
          isDirty: false
        }));
      } catch (error) {
        console.error('Failed to load settings:', error);
        setState(prevState => ({
          ...prevState,
          isLoading: false,
          error: 'Failed to load settings'
        }));
        
        toast({
          title: 'Error',
          description: 'Failed to load settings. Using default configuration.',
          variant: 'destructive',
        });
      }
    };

    loadSettings();
  }, [instance, toast]);

  // Update settings
  const updateSettings = (updatedSettings: Partial<ShippingBarSettings>) => {
    setState(prevState => ({
      ...prevState,
      settings: {
        ...prevState.settings,
        ...updatedSettings
      },
      isDirty: true
    }));
  };

  // Save settings
  const saveSettings = async () => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    
    try {
      const savedSettings = await apiSaveSettings(state.settings);
      
      setState(prevState => ({
        ...prevState,
        settings: savedSettings,
        isLoading: false,
        isDirty: false
      }));
      
      toast({
        title: 'Success',
        description: 'Settings saved successfully.',
      });
      
      return savedSettings;
    } catch (error) {
      console.error('Failed to save settings:', error);
      
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: 'Failed to save settings'
      }));
      
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
      
      throw error;
    }
  };

  // Update preview
  const updatePreview = (updatedPreview: Partial<PreviewState>) => {
    setState(prevState => ({
      ...prevState,
      preview: {
        ...prevState.preview,
        ...updatedPreview
      }
    }));
  };

  // Add product
  const addProduct = (product: Product) => {
    setState(prevState => {
      // Check if product is already in the list
      const exists = prevState.settings.recommendedProducts.some(p => p.id === product.id);
      
      if (exists) return prevState;
      
      return {
        ...prevState,
        settings: {
          ...prevState.settings,
          recommendedProducts: [...prevState.settings.recommendedProducts, product]
        },
        isDirty: true
      };
    });
  };

  // Remove product
  const removeProduct = (productId: string) => {
    setState(prevState => ({
      ...prevState,
      settings: {
        ...prevState.settings,
        recommendedProducts: prevState.settings.recommendedProducts.filter(p => p.id !== productId)
      },
      isDirty: true
    }));
  };

  const value: SettingsContextType = {
    state,
    updateSettings,
    saveSettings,
    updatePreview,
    addProduct,
    removeProduct
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  
  return context;
};
