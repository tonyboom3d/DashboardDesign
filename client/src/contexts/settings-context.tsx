import { createContext, useContext, useState, useEffect } from 'react';
import { ShippingBarSettings, SettingsContextType, SettingsState, PreviewState, Product } from '@/types/settings';
import { fetchSettings, saveSettings as apiSaveSettings } from '@/api/settings';
import { useIframeParams } from '@/hooks/use-iframe-params';
import { useToast } from '@/hooks/use-toast';


// Default settings
const defaultSettings: ShippingBarSettings = {
  instanceId: '',
  enabled: false,
  threshold: 5000, // $50.00 in cents
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

      if (!instanceId) {
        console.error("Instance ID is required but not found");
        return;
      }

      try {
        const instanceToken = new URLSearchParams(window.location.search).get('token');
        console.log(`Fetching settings for instance ID: ${instanceId} with token: ${instanceToken}`);

        setTimeout(async () => {
          const settings = await fetchSettings(instanceId, instanceToken);
          setState(prevState => ({
            ...prevState,
            settings: {
              ...settings,
              instanceId
            },
            isLoading: false,
            isDirty: false
          }));
          setLoading(false);
          console.log(`Settings loaded successfully for instance: ${instanceId}`);
        }, 3000);
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

    let didCancel = false;

    if (!didCancel) {
      loadSettings();
    }

    return () => {
      didCancel = true;
    };
  }, [instanceId, toast]);

  // Define the missing updateSettings function
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
      <SettingsContext.Provider value={{ state, updateSettings }}>
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