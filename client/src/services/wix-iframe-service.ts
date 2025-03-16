/**
 * Service to handle iframe communication with Wix container
 * Implements the Wix SDK interface for embedded applications
 */

// Define types for Wix SDK messages
interface WixMessage {
  type: string;
  data?: any;
}

// Define interface for Wix SDK
interface WixSDK {
  Viewer?: {
    postMessage: (message: WixMessage) => void;
  };
  Utils?: {
    getInstanceValue: (key: string) => string | null;
    setHeight: (height: number) => void;
  };
}

/**
 * Class to handle all Wix iframe communication
 */
class WixIframeService {
  private wixSdk: WixSDK | null = null;
  private isInWixEditor = false;
  private isInWixDashboard = false;

  constructor() {
    // Initialize and detect Wix environment
    this.init();
  }

  /**
   * Initialize the service and detect Wix environment
   */
  private init(): void {
    try {
      // Check if running inside Wix environment by looking for Wix SDK
      if (window.parent && window.parent !== window) {
        // Try to access Wix SDK from parent window
        this.detectWixEnvironment();
        
        // Add message event listener for receiving messages from Wix
        window.addEventListener('message', this.handleWixMessage.bind(this));
        
        console.log('Wix iframe service initialized. In Wix Editor:', this.isInWixEditor, 'In Wix Dashboard:', this.isInWixDashboard);
      } else {
        console.log('Not running inside an iframe, Wix integration disabled');
      }
    } catch (error) {
      console.error('Failed to initialize Wix iframe service', error);
    }
  }

  /**
   * Detect if running inside Wix editor or dashboard
   */
  private detectWixEnvironment(): void {
    // Check URL parameters for Wix environment
    const url = new URL(window.location.href);
    
    // Wix Editor typically has 'editorType' parameter
    this.isInWixEditor = url.searchParams.has('editorType');
    
    // Wix Dashboard typically has 'dashboard' or 'instance' parameter
    this.isInWixDashboard = url.searchParams.has('instance') || url.searchParams.has('dashboard');
    
    // Also check for Wix's domain in the parent
    try {
      const parentHost = window.parent.location.host;
      if (parentHost.includes('wix.com') || parentHost.includes('editorx.com')) {
        this.isInWixEditor = true;
      }
    } catch (e) {
      // If we can't access parent location due to same-origin policy,
      // we're likely in a cross-origin iframe, possibly Wix
    }
  }

  /**
   * Handle incoming messages from Wix parent
   */
  private handleWixMessage(event: MessageEvent): void {
    // Validate message is from Wix
    if (!event.data || typeof event.data !== 'object') return;
    
    const message = event.data as WixMessage;
    
    switch (message.type) {
      case 'ready':
        console.log('Received ready message from Wix');
        this.sendReady();
        break;
      case 'heightChanged':
        // Handle height change request from Wix
        if (message.data && typeof message.data.height === 'number') {
          this.setHeight(message.data.height);
        }
        break;
      case 'settingsUpdated':
        // Handle settings updated message from Wix
        console.log('Settings updated in Wix:', message.data);
        // Trigger a refresh or callback here if needed
        break;
      default:
        console.log('Received unknown message from Wix:', message);
    }
  }

  /**
   * Send ready message to Wix parent
   */
  public sendReady(): void {
    this.postMessageToWix({
      type: 'ready'
    });
    console.log('Sent ready message to Wix');
  }

  /**
   * Send status to Wix parent
   */
  public sendStatus(status: 'success' | 'error' | 'loading', message?: string): void {
    this.postMessageToWix({
      type: 'status',
      data: { status, message }
    });
  }

  /**
   * Set iframe height
   */
  public setHeight(height: number): void {
    if (this.wixSdk && this.wixSdk.Utils && this.wixSdk.Utils.setHeight) {
      this.wixSdk.Utils.setHeight(height);
    } else {
      // Fallback: post message to parent
      this.postMessageToWix({
        type: 'setHeight',
        data: { height }
      });
    }
  }

  /**
   * Adjust iframe height automatically based on content
   */
  public adjustHeight(): void {
    const height = document.body.scrollHeight;
    this.setHeight(height);
  }

  /**
   * Post a message to Wix parent
   */
  private postMessageToWix(message: WixMessage): void {
    if (window.parent && window.parent !== window) {
      // If we have access to Wix SDK, use it
      if (this.wixSdk && this.wixSdk.Viewer && this.wixSdk.Viewer.postMessage) {
        this.wixSdk.Viewer.postMessage(message);
      } else {
        // Otherwise use standard postMessage
        window.parent.postMessage(message, '*');
      }
    }
  }

  /**
   * Get if running inside Wix editor
   */
  public isInWix(): boolean {
    return this.isInWixEditor || this.isInWixDashboard;
  }
}

// Export as singleton instance
export const wixIframeService = new WixIframeService();