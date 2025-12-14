import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ENV } from '$config/env';

/**
 * Mock Interceptors
 * Provides mock API responses for testing and development
 */

let mockMode = false;
let mockDelay = 500; // Default delay in ms

/**
 * Enable/disable mock mode
 */
export const setMockMode = (enabled: boolean): void => {
  mockMode = enabled;
  console.log(`[Mock Interceptors] Mock mode ${enabled ? 'enabled' : 'disabled'}`);
};

/**
 * Set mock delay
 */
export const setMockDelay = (delay: number): void => {
  mockDelay = delay;
};

/**
 * Check if mock mode is enabled
 */
export const isMockMode = (): boolean => {
  return mockMode || ENV.USE_MOCK_DATA;
};

/**
 * Add delay to simulate network latency
 */
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Mock response generator
 */
interface MockResponse {
  data: any;
  status: number;
  statusText: string;
}

/**
 * Generate mock response based on endpoint
 */
const generateMockResponse = (config: AxiosRequestConfig): MockResponse => {
  const url = config.url || '';
  const method = config.method?.toUpperCase() || 'GET';

  // Mock responses for different endpoints
  if (url.includes('/auth/guest')) {
    return {
      data: {
        success: true,
        data: {
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
          expiresIn: 3600,
          user: {
            id: 'mock_user_id',
            username: 'Guest User',
            isGuest: true,
            crowns: 1000,
            gems: 100,
            level: 1,
            tier: 'D',
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: 'mock_request_id',
        },
      },
      status: 200,
      statusText: 'OK',
    };
  }

  if (url.includes('/users/me')) {
    return {
      data: {
        success: true,
        data: {
          id: 'mock_user_id',
          username: 'Mock User',
          crowns: 1000,
          gems: 100,
          level: 1,
          tier: 'D',
          isGuest: false,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: 'mock_request_id',
        },
      },
      status: 200,
      statusText: 'OK',
    };
  }

  if (url.includes('/games') && method === 'POST') {
    return {
      data: {
        success: true,
        data: {
          gameId: 'mock_game_id',
          mode: '4_player',
          status: 'waiting',
          entryFee: 100,
          currentPlayers: 1,
          maxPlayers: 4,
          createdAt: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: 'mock_request_id',
        },
      },
      status: 200,
      statusText: 'OK',
    };
  }

  // Default mock response
  return {
    data: {
      success: true,
      data: {},
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'mock_request_id',
      },
    },
    status: 200,
    statusText: 'OK',
  };
};

/**
 * Generate error response
 */
const generateErrorResponse = (errorType: 'network' | 'server' | 'auth' = 'server'): MockResponse => {
  const errorResponses = {
    network: {
      data: {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network request failed',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: 'mock_request_id',
        },
      },
      status: 0,
      statusText: 'Network Error',
    },
    server: {
      data: {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: 'mock_request_id',
        },
      },
      status: 500,
      statusText: 'Internal Server Error',
    },
    auth: {
      data: {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: 'mock_request_id',
        },
      },
      status: 401,
      statusText: 'Unauthorized',
    },
  };

  return errorResponses[errorType];
};

/**
 * Setup mock interceptor
 */
export const setupMockInterceptor = (instance: any): void => {
  instance.interceptors.request.use(
    async (config: AxiosRequestConfig) => {
      if (isMockMode()) {
        console.log(`[Mock Interceptor] ${config.method?.toUpperCase()} ${config.url}`);
        
        // Add delay
        await delay(mockDelay);

        // Generate mock response
        const mockResponse = generateMockResponse(config);
        
        // Create a promise that resolves with mock response
        return Promise.reject({
          config,
          response: {
            ...mockResponse,
            headers: {},
            config,
          },
          isAxiosError: true,
        });
      }
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );
};

/**
 * Test error scenarios
 */
export const simulateError = (errorType: 'network' | 'server' | 'auth'): void => {
  // This would be used in tests to simulate different error scenarios
  console.log(`[Mock Interceptor] Simulating ${errorType} error`);
};

export default {
  setMockMode,
  setMockDelay,
  isMockMode,
  setupMockInterceptor,
  simulateError,
};


