import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Socket } from 'socket.io-client';

/**
 * Test Helper
 * Utilities for testing API services and WebSocket connections
 */

/**
 * Mock Axios instance
 */
export class MockAxios {
  private responses: Map<string, any> = new Map();
  private requests: any[] = [];

  /**
   * Mock GET request
   */
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    this.requests.push({ method: 'GET', url, config });
    return this.getResponse('GET', url);
  }

  /**
   * Mock POST request
   */
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    this.requests.push({ method: 'POST', url, data, config });
    return this.getResponse('POST', url);
  }

  /**
   * Mock PATCH request
   */
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    this.requests.push({ method: 'PATCH', url, data, config });
    return this.getResponse('PATCH', url);
  }

  /**
   * Mock PUT request
   */
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    this.requests.push({ method: 'PUT', url, data, config });
    return this.getResponse('PUT', url);
  }

  /**
   * Mock DELETE request
   */
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    this.requests.push({ method: 'DELETE', url, config });
    return this.getResponse('DELETE', url);
  }

  /**
   * Set mock response for URL
   */
  setResponse(method: string, url: string, response: any): void {
    const key = `${method}:${url}`;
    this.responses.set(key, response);
  }

  /**
   * Get mock response
   */
  private getResponse(method: string, url: string): Promise<AxiosResponse> {
    const key = `${method}:${url}`;
    const response = this.responses.get(key);

    if (response) {
      return Promise.resolve({
        data: response,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });
    }

    // Default response
    return Promise.resolve({
      data: { success: true, data: {} },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });
  }

  /**
   * Get all requests
   */
  getRequests(): any[] {
    return this.requests;
  }

  /**
   * Clear requests
   */
  clearRequests(): void {
    this.requests = [];
  }

  /**
   * Clear responses
   */
  clearResponses(): void {
    this.responses.clear();
  }
}

/**
 * Mock Socket.IO client
 */
export class MockSocket {
  private events: Map<string, Function[]> = new Map();
  private emittedEvents: any[] = [];
  private connected: boolean = false;

  /**
   * Mock emit
   */
  emit(event: string, data?: any): void {
    this.emittedEvents.push({ event, data });
  }

  /**
   * Mock on
   */
  on(event: string, callback: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  /**
   * Mock off
   */
  off(event: string, callback?: Function): void {
    if (callback) {
      const callbacks = this.events.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    } else {
      this.events.delete(event);
    }
  }

  /**
   * Simulate event
   */
  simulateEvent(event: string, data: any): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Get emitted events
   */
  getEmittedEvents(): any[] {
    return this.emittedEvents;
  }

  /**
   * Clear emitted events
   */
  clearEmittedEvents(): void {
    this.emittedEvents = [];
  }

  /**
   * Set connected state
   */
  setConnected(connected: boolean): void {
    this.connected = connected;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Mock disconnect
   */
  disconnect(): void {
    this.connected = false;
  }
}

/**
 * Test data generators
 */
export const generateTestUser = (overrides?: any) => ({
  id: 'test_user_id',
  username: 'Test User',
  crowns: 1000,
  gems: 100,
  level: 1,
  tier: 'D',
  isGuest: false,
  ...overrides,
});

export const generateTestGame = (overrides?: any) => ({
  gameId: 'test_game_id',
  mode: '4_player',
  status: 'waiting',
  entryFee: 100,
  currentPlayers: 1,
  maxPlayers: 4,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const generateTestFriend = (overrides?: any) => ({
  id: 'test_friend_id',
  username: 'Test Friend',
  avatar: '',
  crowns: 500,
  tier: 'D',
  level: 1,
  isOnline: true,
  ...overrides,
});

export const generateTestClub = (overrides?: any) => ({
  id: 'test_club_id',
  name: 'Test Club',
  description: 'Test club description',
  memberCount: 10,
  maxMembers: 50,
  level: 1,
  threshold: 0,
  ...overrides,
});

export const generateTestGift = (overrides?: any) => ({
  id: 'test_gift_id',
  name: 'Test Gift',
  cost: 100,
  category: 'common',
  animationUrl: '',
  ...overrides,
});

/**
 * Wait for async operations
 */
export const waitFor = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Create mock API response
 */
export const createMockResponse = <T>(data: T, success: boolean = true) => ({
  success,
  data,
  meta: {
    timestamp: new Date().toISOString(),
    requestId: 'test_request_id',
  },
});

/**
 * Create mock error response
 */
export const createMockError = (code: string, message: string) => ({
  success: false,
  error: {
    code,
    message,
  },
  meta: {
    timestamp: new Date().toISOString(),
    requestId: 'test_request_id',
  },
});

export default {
  MockAxios,
  MockSocket,
  generateTestUser,
  generateTestGame,
  generateTestFriend,
  generateTestClub,
  generateTestGift,
  waitFor,
  createMockResponse,
  createMockError,
};


