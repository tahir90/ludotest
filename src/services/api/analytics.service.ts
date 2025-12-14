import { httpClient } from './httpClient';
import { API_ENDPOINTS } from '$config/api.config';
import { getDeviceInfo } from '$config/env';

/**
 * Analytics Service
 * Handles analytics event tracking
 */

export interface TrackEventRequest {
  eventName: string;
  properties?: Record<string, any>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
  deviceId?: string;
  platform?: string;
}

export interface UserAnalytics {
  timeframe: string;
  gamesPlayed: number;
  gamesWon: number;
  crownsEarned: number;
  experienceEarned: number;
  giftsSent: number;
  giftsReceived: number;
  friendsAdded: number;
}

class AnalyticsService {
  /**
   * Track event
   */
  async trackEvent(eventName: string, properties?: Record<string, any>): Promise<{ eventId: string; tracked: boolean }> {
    const deviceInfo = await getDeviceInfo();
    
    const request: TrackEventRequest = {
      eventName,
      properties,
      deviceId: deviceInfo.deviceId,
      platform: deviceInfo.platform,
    };

    return httpClient.post<{ eventId: string; tracked: boolean }>(
      API_ENDPOINTS.ANALYTICS.TRACK_EVENT,
      request,
      undefined,
      { skipAuth: true } // Analytics can work without auth
    );
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<UserAnalytics> {
    return httpClient.get<UserAnalytics>(
      API_ENDPOINTS.ANALYTICS.GET_USER_ANALYTICS,
      { params: { timeframe } }
    );
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;


