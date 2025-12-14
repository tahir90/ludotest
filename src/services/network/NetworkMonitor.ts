import NetInfo from '@react-native-community/netinfo';
import { NetworkStatus } from '$types/api.types';

/**
 * Network Monitor
 * Monitors network connectivity and manages offline queue
 */

type NetworkChangeCallback = (isConnected: boolean) => void;

class NetworkMonitor {
  private static instance: NetworkMonitor | null = null;
  private isConnected: boolean = true;
  private listeners: Set<NetworkChangeCallback> = new Set();
  private unsubscribe: (() => void) | null = null;

  private constructor() {
    this.initialize();
  }

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  /**
   * Initialize network monitoring
   */
  private async initialize(): Promise<void> {
    // Check initial state
    const state = await NetInfo.fetch();
    this.isConnected = state.isConnected ?? false;

    // Subscribe to network changes
    this.unsubscribe = NetInfo.addEventListener((state) => {
      const wasConnected = this.isConnected;
      this.isConnected = state.isConnected ?? false;

      // Notify listeners if state changed
      if (wasConnected !== this.isConnected) {
        this.notifyListeners(this.isConnected);
      }
    });
  }

  /**
   * Get current network status
   */
  getStatus(): NetworkStatus {
    return this.isConnected ? 'online' : 'offline';
  }

  /**
   * Check if connected
   */
  isOnline(): boolean {
    return this.isConnected;
  }

  /**
   * Add network change listener
   */
  addListener(callback: NetworkChangeCallback): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(isConnected: boolean): void {
    this.listeners.forEach((callback) => {
      try {
        callback(isConnected);
      } catch (error) {
        console.error('[NetworkMonitor] Listener error:', error);
      }
    });
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners.clear();
  }
}

export const networkMonitor = NetworkMonitor.getInstance();
export default networkMonitor;


