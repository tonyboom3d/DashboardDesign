
// Configuration settings for Wix integration

export const WIX_CONFIG = {
  // Base URL for Wix backend API
  API_BASE_URL: "https://tonyboom3d.wixsite.com/freeshippingbar/_functions",
  
  // API endpoints
  ENDPOINTS: {
    GET_SETTINGS: '/userSettings',
    UPDATE_SETTINGS: '/updateSettings',
    // Add other Wix API endpoints as needed
  },
  
  // Default instance ID to use when no instance is provided
  DEFAULT_INSTANCE: 'demo-instance',
  
  // CORS configuration
  CORS: {
    ALLOWED_ORIGINS: [
      'https://manage.wix.com',
      'https://editor.wix.com',
      'https://www.wix.com'
    ]
  }
};
