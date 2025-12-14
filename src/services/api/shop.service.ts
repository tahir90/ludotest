import { httpClient } from './httpClient';
import { API_ENDPOINTS } from '$config/api.config';
import { PaginationParams, PaginatedResponse } from '$types/api.types';
import { Platform } from 'react-native';

/**
 * Shop Service
 * Handles shop and purchase API calls
 */

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  crownsAmount: number;
  gemsAmount: number;
  platform: 'ios' | 'android' | 'both';
  isActive: boolean;
  displayOrder: number;
}

export interface InitiatePurchaseRequest {
  itemId: string;
  platform: 'ios' | 'android';
  deviceId: string;
}

export interface InitiatePurchaseResponse {
  transactionId: string;
  itemId: string;
  status: string;
}

export interface VerifyIOSPurchaseRequest {
  transactionId: string;
  receiptData: string;
  productId: string;
}

export interface VerifyAndroidPurchaseRequest {
  transactionId: string;
  purchaseToken: string;
  productId: string;
  packageName: string;
}

export interface PurchaseVerificationResponse {
  transactionId: string;
  status: string;
  crownsAdded: number;
  gemsAdded: number;
  remainingCrowns: number;
}

export interface PurchaseHistoryEntry {
  transactionId: string;
  itemId: string;
  amount: number;
  currency: string;
  status: string;
  platform: string;
  purchasedAt: string;
}

export interface GetShopItemsParams {
  category?: string;
}

class ShopService {
  /**
   * Get shop items
   */
  async getShopItems(params?: GetShopItemsParams): Promise<ShopItem[]> {
    const response = await httpClient.get<{ items?: ShopItem[]; data?: ShopItem[] }>(
      API_ENDPOINTS.SHOP.GET_ITEMS,
      { params }
    );
    // httpClient returns response.data.data, so response is already the data object
    return response.items || response.data || [];
  }

  /**
   * Initiate purchase
   */
  async initiatePurchase(itemId: string, deviceId: string): Promise<InitiatePurchaseResponse> {
    return httpClient.post<InitiatePurchaseResponse>(
      API_ENDPOINTS.SHOP.INITIATE_PURCHASE,
      {
        itemId,
        platform: Platform.OS,
        deviceId,
      }
    );
  }

  /**
   * Verify iOS purchase
   */
  async verifyIOSPurchase(data: VerifyIOSPurchaseRequest): Promise<PurchaseVerificationResponse> {
    return httpClient.post<PurchaseVerificationResponse>(
      API_ENDPOINTS.SHOP.VERIFY_IOS,
      data
    );
  }

  /**
   * Verify Android purchase
   */
  async verifyAndroidPurchase(data: VerifyAndroidPurchaseRequest): Promise<PurchaseVerificationResponse> {
    return httpClient.post<PurchaseVerificationResponse>(
      API_ENDPOINTS.SHOP.VERIFY_ANDROID,
      data
    );
  }

  /**
   * Get purchase history
   */
  async getPurchaseHistory(params?: PaginationParams): Promise<PaginatedResponse<PurchaseHistoryEntry>> {
    const response = await httpClient.get<{
      purchases?: PurchaseHistoryEntry[];
      data?: PurchaseHistoryEntry[];
      pagination?: any;
    }>(API_ENDPOINTS.SHOP.PURCHASE_HISTORY, { params });
    
    // httpClient returns response.data.data, so response is already the data object
    const purchases = response.purchases || response.data || [];
    const pagination = response.pagination || { hasMore: false, limit: 20 };
    
    return {
      data: purchases,
      pagination,
    };
  }
}

export const shopService = new ShopService();
export default shopService;


