import { MMKV } from 'react-native-mmkv';
import { httpClient } from '../api/httpClient';
import { API_ENDPOINTS } from '$config/api.config';

/**
 * Token Manager
 * Handles secure token storage and automatic token refresh
 */

const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  TOKEN_EXPIRY: 'auth_token_expiry',
};

class TokenManager {
  private storage: MMKV;
  private refreshPromise: Promise<string | null> | null = null;

  private constructor() {
    this.storage = new MMKV({
      id: 'auth_storage',
      encryptionKey: 'ludo_auth_encryption_key_2024', // In production, use a secure key
    });
  }

  private static instance: TokenManager | null = null;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Store tokens
   */
  async setTokens(accessToken: string, refreshToken: string, expiresIn: number): Promise<void> {
    const expiryTime = Date.now() + expiresIn * 1000;
    
    this.storage.set(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    this.storage.set(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    this.storage.set(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
  }

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    const token = this.storage.getString(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    const expiry = this.storage.getString(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);

    // Check if token is expired
    if (token && expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() >= expiryTime - 60000) { // Refresh 1 minute before expiry
        // Token expired or about to expire, try to refresh
        return await this.refreshToken();
      }
      return token;
    }

    return token || null;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.storage.getString(TOKEN_STORAGE_KEYS.REFRESH_TOKEN) || null;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string | null> {
    // If refresh is already in progress, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await httpClient.post<{
          accessToken: string;
          refreshToken: string;
          expiresIn: number;
        }>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
          refreshToken,
        }, undefined, { skipAuth: true });

        await this.setTokens(response.accessToken, response.refreshToken, response.expiresIn);
        return response.accessToken;
      } catch (error) {
        // Refresh failed, clear tokens
        await this.clearTokens();
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Clear all tokens
   */
  async clearTokens(): Promise<void> {
    this.storage.delete(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    this.storage.delete(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
    this.storage.delete(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);
    this.refreshPromise = null;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null;
  }
}

export { TokenManager };


