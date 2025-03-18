
// Configuration settings for Wix integration

export const WIX_CONFIG = {
  // Base URL for backend API (use empty string for relative paths)
  API_BASE_URL: "",
  
  // API endpoints
  ENDPOINTS: {
    GET_SETTINGS: '/wix/api/get_userSettings',
    UPDATE_SETTINGS: '/wix/api/put_updateSettings',
    // Add other Wix API endpoints as needed
  },
  
  // Default instance ID to use when no instance is provided
  // DEFAULT_INSTANCE: 'demo-instance',
  DEFAULT_INSTANCE: 'b12bfa15-eed5-4bc1-a70e-ce6d3ab17f9c',
  
  // CORS configuration
  CORS: {
    ALLOWED_ORIGINS: [
      'https://manage.wix.com',
      'https://editor.wix.com',
      'https://www.wix.com'
    ]
  }
};
