import { httpClient } from './httpClient';
import { API_ENDPOINTS, API_CONFIG } from '$config/api.config';
import { getDeviceInfo } from '$config/env';
import { TokenManager } from '../auth/TokenManager';
import { SocialAuthResult } from '../auth/SocialAuthManager';

/**
 * Auth Service
 * Handles all authentication-related API calls
 */

export interface GuestLoginRequest {
  deviceId: string;
  platform: 'ios' | 'android';
  deviceModel?: string;
  osVersion?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    isGuest: boolean;
    crowns: number;
    gems: number;
    level: number;
    tier: string;
  };
}

export interface ConvertGuestRequest {
  guestUserId: string;
  authMethod: 'google' | 'apple' | 'facebook' | 'email';
  idToken?: string;
  email?: string;
  password?: string;
}

class AuthService {
  private tokenManager: TokenManager;

  constructor() {
    this.tokenManager = TokenManager.getInstance();
  }

  /**
   * Guest login
   */
  async guestLogin(): Promise<AuthResponse> {
    try {
      const deviceInfo = await getDeviceInfo();
      
      console.log('[Auth Service] Calling guest login API:', {
        endpoint: API_ENDPOINTS.AUTH.GUEST_LOGIN,
        baseURL: API_CONFIG.baseURL,
        fullUrl: `${API_CONFIG.baseURL}${API_ENDPOINTS.AUTH.GUEST_LOGIN}`,
        deviceInfo: {
          deviceId: deviceInfo.deviceId,
          platform: deviceInfo.platform,
        },
      });
      
      const response = await httpClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.GUEST_LOGIN,
        {
          deviceId: deviceInfo.deviceId,
          platform: deviceInfo.platform,
          deviceModel: deviceInfo.deviceModel,
          osVersion: deviceInfo.osVersion,
        },
        undefined,
        { skipAuth: true }
      );

      console.log('[Auth Service] Guest login response received:', {
        hasUser: !!response?.user,
        hasTokens: !!(response?.accessToken && response?.refreshToken),
      });

      // Validate response structure
      if (!response) {
        throw new Error('No response received from server');
      }

      if (!response.user) {
        console.error('Invalid response structure:', JSON.stringify(response, null, 2));
        throw new Error('User data is missing from response');
      }

      if (!response.accessToken || !response.refreshToken) {
        throw new Error('Authentication tokens are missing from response');
      }

      // Store tokens
      await this.tokenManager.setTokens(
        response.accessToken,
        response.refreshToken,
        response.expiresIn
      );

      return response;
    } catch (error: any) {
      console.error('Guest login failed:', error);
      // Re-throw with user-friendly message
      if (error.response) {
        const errorData = error.response.data || error.response;
        throw new Error(errorData.message || errorData.error || 'Login failed. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Google login
   */
  async googleLogin(socialAuthResult: SocialAuthResult): Promise<AuthResponse> {
    const deviceInfo = await getDeviceInfo();

    const response = await httpClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
      {
        idToken: socialAuthResult.idToken,
        deviceId: deviceInfo.deviceId,
        platform: deviceInfo.platform,
      },
      undefined,
      { skipAuth: true }
    );

    await this.tokenManager.setTokens(
      response.accessToken,
      response.refreshToken,
      response.expiresIn
    );

    return response;
  }

  /**
   * Apple login
   */
  async appleLogin(socialAuthResult: SocialAuthResult): Promise<AuthResponse> {
    const deviceInfo = await getDeviceInfo();

    const response = await httpClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.APPLE_LOGIN,
      {
        identityToken: socialAuthResult.identityToken,
        authorizationCode: socialAuthResult.authorizationCode,
        deviceId: deviceInfo.deviceId,
        platform: deviceInfo.platform,
        user: socialAuthResult.email
          ? {
              email: socialAuthResult.email,
              name: socialAuthResult.name,
            }
          : undefined,
      },
      undefined,
      { skipAuth: true }
    );

    await this.tokenManager.setTokens(
      response.accessToken,
      response.refreshToken,
      response.expiresIn
    );

    return response;
  }

  /**
   * Facebook login
   */
  async facebookLogin(socialAuthResult: SocialAuthResult): Promise<AuthResponse> {
    const deviceInfo = await getDeviceInfo();

    const response = await httpClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.FACEBOOK_LOGIN,
      {
        accessToken: socialAuthResult.accessToken,
        deviceId: deviceInfo.deviceId,
        platform: deviceInfo.platform,
      },
      undefined,
      { skipAuth: true }
    );

    await this.tokenManager.setTokens(
      response.accessToken,
      response.refreshToken,
      response.expiresIn
    );

    return response;
  }

  /**
   * Convert guest account to permanent
   */
  async convertGuestAccount(data: ConvertGuestRequest): Promise<{ message: string; user: { id: string; isGuest: boolean } }> {
    return httpClient.post(API_ENDPOINTS.AUTH.CONVERT_GUEST, data);
  }

  /**
   * Logout
   */
  async logout(): Promise<{ message: string }> {
    const deviceInfo = await getDeviceInfo();
    const refreshToken = this.tokenManager.getRefreshToken();

    try {
      await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT, {
        refreshToken,
        deviceId: deviceInfo.deviceId,
      });
    } finally {
      // Always clear tokens, even if API call fails
      await this.tokenManager.clearTokens();
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return this.tokenManager.isAuthenticated();
  }
}

export const authService = new AuthService();
export default authService;


