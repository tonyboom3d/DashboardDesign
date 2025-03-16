
/**
 * Interface for parameters passed from Wix to the iframe
 */
export interface IframeParams {
  instance: string | null;
  instanceId: string | null;
  locale: string | null;
  viewMode: string | null;
  siteUrl: string | null;
  token: string | null;
  authorizationCode: string | null;
  [key: string]: any; // For any additional parameters
}

/**
 * Interface for Wix authentication parameters
 */
export interface WixAuthParams {
  instanceId: string | null;
  refreshToken: string | null;
  accessToken: string | null;
}
