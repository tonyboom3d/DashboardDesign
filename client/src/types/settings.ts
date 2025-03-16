export interface ShippingBarColors {
  backgroundColor: string;
  bar: string;
  progressBg: string;
  text: string;
  accent: string;
  highlight: string;
}

export interface ShippingBarBorder {
  color: string;
  thickness: number;
}

export interface ShippingBarText {
  barText: string;
  successText: string;
  buttonText: string;
  initialText: string;
  showInitialText: boolean;
}

export interface ShippingBarIcon {
  type: 'emoji' | 'lucide' | 'none';
  selection: string;
  position: 'before' | 'after';
}

export interface DeviceVisibility {
  desktop: boolean;
  mobile: boolean;
}

export interface ShippingBarVisibility {
  productPage: DeviceVisibility;
  cartPage: DeviceVisibility;
  miniCart: DeviceVisibility;
  header: DeviceVisibility;
}

export interface ShippingBarAnalytics {
  viewCount: number;
  conversionRate: string;
  aov: string;
}

export interface Product {
  id: string;
  name: string;
  price: number; // in cents
  imageUrl: string;
}

export interface ShippingBarSettings {
  instanceId: string;
  enabled: boolean;
  threshold: number; // in cents
  productSuggestionMethod: 'manual' | 'automatic' | 'bestselling' | 'related';
  barStyle: 'simple' | 'gradient';
  colors: ShippingBarColors;
  border: ShippingBarBorder;
  text: ShippingBarText;
  textAlignment: 'left' | 'center' | 'right';
  textDirection: 'ltr' | 'rtl';
  icon: ShippingBarIcon;
  visibility: ShippingBarVisibility;
  position: 'top' | 'bottom';
  recommendedProducts: Product[];
  analytics: ShippingBarAnalytics;
}

export interface PreviewState {
  currentCartValue: number; // in cents
  device: 'desktop' | 'mobile';
  context: 'product' | 'cart' | 'miniCart';
}

export interface SettingsState {
  settings: ShippingBarSettings;
  preview: PreviewState;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;
}

export type SettingsContextType = {
  state: SettingsState;
  updateSettings: (settings: Partial<ShippingBarSettings>) => void;
  saveSettings: () => Promise<ShippingBarSettings>;
  updatePreview: (preview: Partial<PreviewState>) => void;
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
};
