// Configuration settings for Wix integration

export const WIX_CONFIG = {
  // Base URL for Wix backend API
  API_BASE_URL: import.meta.env.VITE_WIX_API_URL || '',
  
  // API endpoints
  ENDPOINTS: {
    GET_SETTINGS: '/get_userSettings',
    UPDATE_SETTINGS: '/put_updateSettings',
    // Add other Wix API endpoints as needed
  },
  
  // Default instance ID to use when no instance is provided
  DEFAULT_INSTANCE: 'demo-instance',
  
  // CORS configuration
  CORS: {
    ALLOWED_ORIGINS: [
      'https://manage.wix.com',
      'https://editor.wix.com'
    ]
  }
};