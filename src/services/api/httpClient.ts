import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '$config/api.config';
import { ENV, getDeviceInfo } from '$config/env';
import { ApiResponse, RequestOptions } from '$types/api.types';
import { transformError, shouldRetry, getRetryDelay, logError } from './errorHandler';
import { TokenManager } from '../auth/TokenManager';

/**
 * HTTP Client
 * Centralized Axios instance with interceptors, retry logic, and error handling
 */

class HttpClient {
  private instance: AxiosInstance;
  private tokenManager: TokenManager;
  private pendingRequests: Map<string, Promise<any>> = new Map();

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
    });

    this.tokenManager = TokenManager.getInstance();
    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Add device info
        const deviceInfo = await getDeviceInfo();
        config.headers['X-Device-ID'] = deviceInfo.deviceId;
        config.headers['X-Device-Model'] = deviceInfo.deviceModel;
        config.headers['X-OS-Version'] = deviceInfo.osVersion;

        // Add auth token if available and not skipped
        if (!(config as any).skipAuth) {
          const token = await this.tokenManager.getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        // Log request in development
        if (ENV.ENABLE_LOGGING) {
          const fullUrl = `${config.baseURL || ''}${config.url}`;
          console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`, {
            params: config.params,
            data: config.data,
            headers: {
              'Authorization': config.headers?.Authorization ? 'Bearer ***' : 'None',
              'X-Device-ID': config.headers?.['X-Device-ID'],
            },
          });
        }

        return config;
      },
      (error) => {
        logError(error, 'Request Interceptor');
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // Log response in development
        if (ENV.ENABLE_LOGGING) {
          const fullUrl = `${response.config.baseURL || ''}${response.config.url}`;
          console.log(`[API Response] ${response.config.method?.toUpperCase()} ${fullUrl}`, {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            timestamp: new Date().toISOString(),
          });
        }

        // Validate response structure
        if (!response.data || typeof response.data !== 'object') {
          throw new Error('Invalid response format');
        }

        // Check for success flag
        if (response.data.success === false) {
          const error: any = new Error(response.data.error?.message || 'API Error');
          error.response = {
            ...response,
            data: response.data,
          };
          throw error;
        }

        return response;
      },
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number };

        // Handle 401 Unauthorized - Token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.tokenManager.refreshToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            await this.tokenManager.clearTokens();
            logError(refreshError, 'Token Refresh');
            return Promise.reject(refreshError);
          }
        }

        // Log error in development
        if (ENV.ENABLE_LOGGING) {
          const fullUrl = error.config ? `${error.config.baseURL || ''}${error.config.url}` : 'Unknown URL';
          console.error(`[API Error] ${error.config?.method?.toUpperCase() || 'UNKNOWN'} ${fullUrl}`, {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            data: error.response?.data,
            timestamp: new Date().toISOString(),
          });
        }

        // Transform error
        const transformedError = transformError(error);
        logError(error, 'Response Interceptor');

        return Promise.reject(transformedError);
      }
    );
  }

  /**
   * Request with automatic retry
   */
  private async requestWithRetry<T>(
    config: AxiosRequestConfig,
    options: RequestOptions = {}
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    const maxRetries = options.retries ?? API_CONFIG.retry.maxRetries;
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.instance.request<ApiResponse<T>>(config);
      } catch (error: any) {
        lastError = error;

        // Check if should retry
        if (!shouldRetry(error, attempt, maxRetries)) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = getRetryDelay(attempt, API_CONFIG.retry.retryDelay);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Request deduplication key generator
   */
  private getRequestKey(config: AxiosRequestConfig): string {
    return `${config.method}_${config.url}_${JSON.stringify(config.params || {})}_${JSON.stringify(config.data || {})}`;
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    const requestKey = this.getRequestKey({ ...config, method: 'GET', url });

    // Check for pending request
    if (this.pendingRequests.has(requestKey) && !options?.skipCache) {
      return this.pendingRequests.get(requestKey)!;
    }

    const request = this.requestWithRetry<T>(
      {
        ...config,
        method: 'GET',
        url,
      },
      options
    ).then((response) => {
      this.pendingRequests.delete(requestKey);
      return response.data.data;
    }).catch((error) => {
      this.pendingRequests.delete(requestKey);
      throw error;
    });

    this.pendingRequests.set(requestKey, request);
    return request;
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    const response = await this.requestWithRetry<T>(
      {
        ...config,
        method: 'POST',
        url,
        data,
      },
      options
    );
    return response.data.data;
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    const response = await this.requestWithRetry<T>(
      {
        ...config,
        method: 'PUT',
        url,
        data,
      },
      options
    );
    return response.data.data;
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    const response = await this.requestWithRetry<T>(
      {
        ...config,
        method: 'PATCH',
        url,
        data,
      },
      options
    );
    return response.data.data;
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    const response = await this.requestWithRetry<T>(
      {
        ...config,
        method: 'DELETE',
        url,
      },
      options
    );
    return response.data.data;
  }

  /**
   * Upload file (multipart/form-data)
   */
  async upload<T = any>(url: string, file: any, additionalData?: Record<string, any>, options?: RequestOptions): Promise<T> {
    const formData = new FormData();
    formData.append('avatar', file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });
    }

    const response = await this.requestWithRetry<T>(
      {
        method: 'POST',
        url,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
      options
    );
    return response.data.data;
  }

  /**
   * Get raw axios instance (for advanced use cases)
   */
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Export singleton instance
export const httpClient = new HttpClient();
export default httpClient;


