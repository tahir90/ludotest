import { httpClient } from './httpClient';
import { API_ENDPOINTS } from '$config/api.config';
import { PaginationParams, PaginatedResponse } from '$types/api.types';

/**
 * Gifting Service
 * Handles all gifting-related API calls
 */

export interface Gift {
  id: string;
  name: string;
  icon: string;
  price: number;
  category: 'basic' | 'premium' | 'ultra';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  animationUrl?: string;
  audioUrl?: string;
}

export interface GiftCatalog {
  categories: {
    basic: Gift[];
    premium: Gift[];
    ultra: Gift[];
  };
}

export interface SendGiftRequest {
  giftId: string;
  recipientType: 'user' | 'club';
  recipientId: string;
  quantity: number;
  message?: string;
}

export interface SendGiftResponse {
  giftTransactionId: string;
  giftId: string;
  totalCost: number;
  remainingCrowns: number;
  sentAt: string;
  animation: {
    url: string;
    audioUrl: string;
    duration: number;
  };
  websocketBroadcast: boolean;
  clubThresholdContribution?: number;
  newThresholdProgress?: number;
  thresholdCompleted?: boolean;
  globalAnnouncement?: boolean;
}

export interface GiftHistoryEntry {
  giftTransactionId: string;
  gift: Gift;
  sender: {
    userId: string;
    username: string;
    avatar: string;
  };
  recipient: {
    userId: string;
    username: string;
    avatar: string;
  };
  quantity: number;
  totalValue: number;
  message?: string;
  contextType: string;
  sentAt: string;
}

export interface GetGiftCatalogParams {
  category?: 'basic' | 'premium' | 'ultra';
}

export interface GetGiftHistoryParams extends PaginationParams {
  type?: 'sent' | 'received';
}

class GiftingService {
  /**
   * Get gift catalog
   */
  async getGiftCatalog(params?: GetGiftCatalogParams): Promise<GiftCatalog> {
    const response = await httpClient.get<{ categories: GiftCatalog['categories'] }>(
      API_ENDPOINTS.GIFTING.GET_CATALOG,
      { params }
    );
    return {
      categories: (response as any).categories || { basic: [], premium: [], ultra: [] },
    };
  }

  /**
   * Send gift
   */
  async sendGift(data: SendGiftRequest): Promise<SendGiftResponse> {
    return httpClient.post<SendGiftResponse>(API_ENDPOINTS.GIFTING.SEND_GIFT, data);
  }

  /**
   * Send gift to club
   */
  async sendGiftToClub(clubId: string, giftId: string, quantity: number, message?: string): Promise<SendGiftResponse> {
    return httpClient.post<SendGiftResponse>(
      API_ENDPOINTS.GIFTING.SEND_TO_CLUB(clubId),
      { giftId, quantity, message }
    );
  }

  /**
   * Send gift in game
   */
  async sendGiftInGame(gameId: string, giftId: string, quantity: number, message?: string): Promise<SendGiftResponse> {
    return httpClient.post<SendGiftResponse>(
      API_ENDPOINTS.GIFTING.SEND_IN_GAME(gameId),
      { giftId, quantity, message }
    );
  }

  /**
   * Get gift history
   */
  async getGiftHistory(params?: GetGiftHistoryParams): Promise<PaginatedResponse<GiftHistoryEntry>> {
    const response = await httpClient.get<{
      data?: GiftHistoryEntry[];
      pagination?: any;
    }>(API_ENDPOINTS.GIFTING.GET_HISTORY, { params });
    
    // httpClient returns response.data.data, so response is already the data object
    const data = response.data || [];
    const pagination = response.pagination || { hasMore: false, limit: 20 };
    
    return {
      data,
      pagination,
    };
  }
}

export const giftingService = new GiftingService();
export default giftingService;


