import { httpClient } from './httpClient';
import { API_ENDPOINTS } from '$config/api.config';
import { PaginationParams, PaginatedResponse } from '$types/api.types';

/**
 * Notification Service
 * Handles all notification-related API calls
 */

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export interface GetNotificationsParams extends PaginationParams {
  type?: string;
  unreadOnly?: boolean;
}

export interface NotificationCounts {
  total: number;
  byType: {
    video?: number;      // Available videos to watch
    dragon?: number;     // Dragon/pet related notifications
    shop?: number;       // Shop notifications (new items, sales)
    friends?: number;    // Friend requests, messages
    chest?: number;      // Chest/loot box notifications
    game?: number;       // Game-related notifications
    club?: number;      // Club notifications
    gift?: number;       // Gift notifications
  };
}

class NotificationService {
  /**
   * Get notifications
   */
  async getNotifications(params?: GetNotificationsParams): Promise<PaginatedResponse<Notification> & { unreadCount: number }> {
    const response = await httpClient.get<{
      notifications?: Notification[];
      data?: Notification[];
      pagination?: any;
      unreadCount?: number;
    }>(API_ENDPOINTS.NOTIFICATION.GET_ALL, { params });
    
    // httpClient returns response.data.data, so response is already the data object
    const notifications = response.notifications || response.data || [];
    const pagination = response.pagination || { hasMore: false, limit: 20 };
    const unreadCount = response.unreadCount || 0;
    
    return {
      data: notifications,
      pagination,
      unreadCount,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<{ message: string }> {
    return httpClient.post(API_ENDPOINTS.NOTIFICATION.MARK_READ(notificationId));
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(): Promise<{ message: string; readCount: number }> {
    return httpClient.post(API_ENDPOINTS.NOTIFICATION.MARK_ALL_READ);
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    return httpClient.delete(API_ENDPOINTS.NOTIFICATION.DELETE(notificationId));
  }

  /**
   * Get notification counts by type
   * TODO: This endpoint needs to be implemented in backend - see API_GAPS.md
   */
  async getNotificationCounts(): Promise<NotificationCounts> {
    try {
      const response = await httpClient.get<NotificationCounts>(
        API_ENDPOINTS.NOTIFICATION.GET_COUNTS || '/notifications/counts'
      );
      return response;
    } catch (error) {
      // Fallback: return zero counts if API not available
      console.warn('Notification counts API not available, using fallback');
      return {
        total: 0,
        byType: {},
      };
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;


