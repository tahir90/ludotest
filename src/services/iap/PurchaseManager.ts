import { Platform } from 'react-native';
import { IOSPurchaseManager } from './IOSPurchaseManager';
import { AndroidPurchaseManager } from './AndroidPurchaseManager';

/**
 * Purchase Manager
 * Unified interface for in-app purchases across platforms
 */

export interface PurchaseItem {
  itemId: string;
  productId: string;
  price: number;
  currency: string;
  title: string;
  description: string;
}

export interface PurchaseResult {
  success: boolean;
  transactionId: string;
  productId: string;
  receipt?: string; // iOS receipt
  purchaseToken?: string; // Android purchase token
  error?: string;
}

export interface PurchaseError {
  code: string;
  message: string;
  details?: any;
}

class PurchaseManager {
  private iosManager: IOSPurchaseManager;
  private androidManager: AndroidPurchaseManager;

  constructor() {
    this.iosManager = new IOSPurchaseManager();
    this.androidManager = new AndroidPurchaseManager();
  }

  /**
   * Initialize purchase manager
   */
  async initialize(): Promise<void> {
    if (Platform.OS === 'ios') {
      await this.iosManager.initialize();
    } else if (Platform.OS === 'android') {
      await this.androidManager.initialize();
    }
  }

  /**
   * Get available products
   */
  async getProducts(productIds: string[]): Promise<PurchaseItem[]> {
    if (Platform.OS === 'ios') {
      return this.iosManager.getProducts(productIds);
    } else if (Platform.OS === 'android') {
      return this.androidManager.getProducts(productIds);
    }
    return [];
  }

  /**
   * Purchase item
   */
  async purchaseItem(productId: string): Promise<PurchaseResult> {
    if (Platform.OS === 'ios') {
      return this.iosManager.purchaseItem(productId);
    } else if (Platform.OS === 'android') {
      return this.androidManager.purchaseItem(productId);
    }
    
    return {
      success: false,
      transactionId: '',
      productId,
      error: 'Platform not supported',
    };
  }

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<PurchaseResult[]> {
    if (Platform.OS === 'ios') {
      return this.iosManager.restorePurchases();
    } else if (Platform.OS === 'android') {
      return this.androidManager.restorePurchases();
    }
    return [];
  }

  /**
   * Finish transaction (iOS only)
   */
  async finishTransaction(transactionId: string): Promise<void> {
    if (Platform.OS === 'ios') {
      await this.iosManager.finishTransaction(transactionId);
    }
  }

  /**
   * Acknowledge purchase (Android only)
   */
  async acknowledgePurchase(purchaseToken: string): Promise<void> {
    if (Platform.OS === 'android') {
      await this.androidManager.acknowledgePurchase(purchaseToken);
    }
  }
}

export const purchaseManager = new PurchaseManager();
export default purchaseManager;


