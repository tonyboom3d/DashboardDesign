/**
   * Load settings for a specific instance
   */
  async getSettings(instanceId: string): Promise<ShippingBarSettings> {
    try {
      console.log(`Loading settings for instance: ${instanceId}`);

      // Use query parameter for GET request
      const response = await fetch(`${this.apiBaseUrl}${WIX_CONFIG.ENDPOINTS.GET_SETTINGS}?instanceId=${instanceId}`);

      if (!response.ok) {
        throw new Error(`Failed to load settings: ${response.status} ${response.statusText}`);
      }

      const settings = await response.json();
      console.log(`Settings loaded successfully for instance: ${instanceId}`);

      return settings;
    } catch (error) {
      console.error('Error fetching settings from Wix API:', error);
      throw new Error(`Failed to load settings: ${(error as Error).message}`);
    }
  },