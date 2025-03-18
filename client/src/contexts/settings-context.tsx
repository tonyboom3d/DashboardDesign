import { createContext, useContext, useState, useEffect } from 'react';
import { ShippingBarSettings, SettingsContextType, SettingsState, PreviewState, Product } from '@/types/settings';
import { fetchSettings, saveSettings as apiSaveSettings } from '@/api/settings';
import { useIframeParams } from '@/hooks/use-iframe-params';
import { useToast } from '@/hooks/use-toast';
import { WIX_CONFIG } from '@/config/wix-config';


// Default settings
const defaultSettings: ShippingBarSettings = {
  instanceId: '',
  enabled: false,
  threshold: 5000, // $50.00 in cents
  currencySymbol: '$',
  currencyCode: 'USD',
  productSuggestionMethod: 'manual',
  barStyle: 'simple',
  colors: {
    backgroundColor: '#FFFFFF',
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
  progressBarBorder: {
    color: '#0070F3',
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
  textPosition: 'above', // Default text position is above the progress bar
  progressDirection: 'ltr', // Default progress bar direction is left-to-right
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

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);


export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SettingsState>(initialState);
  const [loading, setLoading] = useState(true);
  const { instanceId } = useIframeParams();
  const { toast } = useToast();

  useEffect(() => {
    console.log('URL Parameters at start of useEffect:', window.location.search);

    const loadSettings = async () => {
      console.log("Starting to load settings", instanceId);

      // Use a default instance ID if none is provided from Wix
      const defaultId = WIX_CONFIG.DEFAULT_INSTANCE;
      const effectiveInstanceId = instanceId || defaultId;
      
      if (!instanceId) {
        console.log(`Using default instance ID: ${defaultId}`);
      }

      try {
        const instanceToken = new URLSearchParams(window.location.search).get('token');
        console.log(`Fetching settings for instance ID: ${instanceId} with token: ${instanceToken ? 'present' : 'not present'}`);

        // Remove the artificial timeout which was just causing delays
        const settings = await fetchSettings(effectiveInstanceId, instanceToken);
        setState(prevState => ({
          ...prevState,
          settings: {
            ...defaultSettings,
            ...settings,
            instanceId: effectiveInstanceId
          },
          isLoading: false,
          isDirty: false,
          error: null // Clear any previous errors
        }));
        setLoading(false);
        console.log(`Settings loaded successfully for instance: ${instanceId}`);
      } catch (error) {
        console.error('Failed to load settings:', error);
        
        // Use default settings with the instance ID on error
        setState(prevState => ({
          ...prevState,
          settings: {
            ...defaultSettings,
            instanceId: effectiveInstanceId
          },
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load settings'
        }));
        setLoading(false);
        
        toast({
          title: 'Warning',
          description: 'Could not load existing settings. Using default configuration.',
          variant: 'destructive',
        });
      }
    };

    loadSettings();

    // Cleanup function
    return () => {
      // Nothing to clean up
    };
  }, [instanceId, toast]);

  // Define saveSettings function to persist settings to backend
  const saveSettings = async (settingsToSave = state.settings) => {
    try {
      console.log('Saving settings to backend:', settingsToSave);
      // Make sure we're sending a complete settings object with instanceId
      const completeSettings = {
        ...state.settings,
        ...settingsToSave
      };
      
      // Ensure instanceId is included
      if (!completeSettings.instanceId) {
        console.error('No instanceId found in settings');
        throw new Error('No instanceId provided in settings');
      }
      
      setState(prevState => ({
        ...prevState,
        isLoading: true, // Show loading state while saving
        error: null // Clear any previous errors
      }));
      
      // Make the API call to save settings
      const savedSettings = await apiSaveSettings(completeSettings);
      
      // Show success toast
      toast({
        title: 'Success',
        description: 'Settings saved successfully!',
        variant: 'default',
      });
      
      // Update local state with the saved settings
      setState(prevState => ({
        ...prevState,
        settings: savedSettings,
        isDirty: false,
        isLoading: false
      }));
      
      return savedSettings;
    } catch (error) {
      console.error('Failed to save settings:', error);
      
      // Show error toast
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save settings',
        variant: 'destructive',
      });
      
      // Update error state
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to save settings'
      }));
      
      throw error;
    }
  };

  // Update settings with partial data
  const updateSettings = (newSettings: Partial<ShippingBarSettings>) => {
    setState(prevState => ({
      ...prevState,
      settings: {
        ...prevState.settings,
        ...newSettings,
      },
      isDirty: true
    }));
  };

  // Update preview state with partial data
  const updatePreview = (newPreview: Partial<PreviewState>) => {
    setState(prevState => ({
      ...prevState,
      preview: {
        ...prevState.preview,
        ...newPreview
      }
    }));
  };

  // Add a product to recommended products
  const addProduct = (product: Product) => {
    if (!product.id) {
      console.error("Product must have an ID");
      return;
    }

    setState(prevState => {
      // Check if product already exists
      const exists = prevState.settings.recommendedProducts.some(p => p.id === product.id);
      
      if (exists) {
        console.log(`Product with ID ${product.id} already exists in recommended products`);
        return prevState; // Return previous state without changes
      }
      
      // Add the new product
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

  // Remove a product from recommended products
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <SettingsContext.Provider value={{ 
      state, 
      updateSettings, 
      saveSettings,
      updatePreview,
      addProduct,
      removeProduct
    }}>
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