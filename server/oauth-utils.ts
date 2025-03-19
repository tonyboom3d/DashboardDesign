import { WixAuthCredentials } from "./wix-api-minimal";

// Get the environment variables for Wix OAuth
const WIX_APP_ID = process.env.WIX_APP_ID;
const WIX_APP_SECRET = process.env.WIX_APP_SECRET;

// OAuth constants
const OAUTH_URL = "https://www.wixapis.com/oauth/access";
const WIX_INSTALLER_URL = "https://www.wix.com/installer/install";
const DASHBOARD_URL = "https://www.wix.com/installer/close-window?access_token=";

// OAuth endpoints
const OAUTH_REDIRECT_URL = "https://freeshipping-bar.replit.app/oauth/redirect";
const OAUTH_URL_ENDPOINT = "https://freeshipping-bar.replit.app/oauth/url";

// Ensure the app ID and secret are available
function validateOAuthConfig(): void {
  if (!WIX_APP_ID || !WIX_APP_SECRET) {
    throw new Error("Missing required environment variables: WIX_APP_ID or WIX_APP_SECRET");
  }
}

/**
 * Get the URL for the OAuth flow that the user will be redirected to
 * @param token OAuth token from Wix
 * @param redirectUrl URL to redirect after OAuth completion
 * @returns The full OAuth URL
 */
export function getOAuthUrl(token: string, redirectUrl: string): string {
  validateOAuthConfig();
  
  return `${WIX_INSTALLER_URL}?token=${encodeURIComponent(token)}&appId=${encodeURIComponent(WIX_APP_ID!)}&redirectUrl=${encodeURIComponent(redirectUrl)}`;
}

/**
 * Exchange authorization code for access and refresh tokens
 * @param code Authorization code from Wix
 * @param instanceId Wix instance ID
 * @returns Object containing access and refresh tokens
 */
export async function exchangeCodeForTokens(code: string, instanceId: string): Promise<{ accessToken: string, refreshToken: string }> {
  validateOAuthConfig();
  
  try {
    const response = await fetch(`${OAUTH_URL}?state=${instanceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: WIX_APP_ID,
        client_secret: WIX_APP_SECRET,
        code
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OAuth token exchange failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token
    };
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    throw error;
  }
}

/**
 * Get Wix instance data using the access token
 * @param accessToken Wix access token
 * @returns Instance data including site information
 */
export async function getInstanceData(accessToken: string): Promise<any> {
  try {
    const response = await fetch("https://www.wixapis.com/apps/v1/instance", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch instance data: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting instance data:", error);
    throw error;
  }
}

/**
 * Refresh an expired access token using the refresh token
 * @param refreshToken Wix refresh token
 * @returns New access token if successful
 */
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  validateOAuthConfig();
  
  try {
    const response = await fetch(OAUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        client_id: WIX_APP_ID,
        client_secret: WIX_APP_SECRET,
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      console.error(`Failed to refresh access token: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
}

/**
 * Deploy script to Wix instance
 * @param instanceId Wix instance ID
 * @param accessToken Wix access token
 * @param refreshToken Wix refresh token
 * @returns true if script deployed successfully
 */
export async function deployScript(instanceId: string, accessToken: string, refreshToken: string): Promise<boolean> {
  try {
    const data = JSON.stringify({
      properties: {
        parameters: {
          instanceId: instanceId,
        },
      },
    });
    
    let response = await fetch("https://www.wixapis.com/apps/v1/scripts", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: data,
    });

    if (response.ok) {
      console.log("Script deployed successfully");
      return true;
    }
    
    // Handle auth errors with token refresh
    if (response.status === 401 || response.status === 403 || response.status === 400) {
      const newAccessToken = await refreshAccessToken(refreshToken);
      if (newAccessToken) {
        console.log("Retrying deployment with new access token");
        response = await fetch("https://www.wixapis.com/apps/v1/scripts", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newAccessToken}`,
          },
          body: data,
        });

        if (response.ok) {
          console.log("Script deployed successfully on retry");
          return true;
        }
        
        const retryErrorResponse = await response.text();
        console.error("Retry deployment failed", response.status, response.statusText, 'Details:', retryErrorResponse);
      } else {
        console.error("Failed to refresh access token, cannot retry deployment.");
      }
    } else {
      const errorResponse = await response.text();
      console.error("Failed to deploy embedded script, non-auth error:", response.status, response.statusText, 'Details:', errorResponse);
    }
    
    return false;
  } catch (error) {
    console.error("Error during deployment attempt:", error);
    return false;
  }
}

/**
 * Get the last day of the month for a given date
 * @param date Date to get last day for
 * @returns Last day of month as number
 */
export function getLastDayOfMonth(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return new Date(year, month, 0).getDate();
}