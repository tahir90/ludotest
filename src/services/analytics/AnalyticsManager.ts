import { analyticsService } from '../api/analytics.service';
import { networkMonitor } from '../network/NetworkMonitor';

/**
 * Analytics Manager
 * Handles event batching, offline queue, and automatic session tracking
 */

interface QueuedEvent {
  eventName: string;
  properties?: Record<string, any>;
  timestamp: number;
}

class AnalyticsManager {
  private static instance: AnalyticsManager | null = null;
  private eventQueue: QueuedEvent[] = [];
  private batchSize: number = 10;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;
  private sessionId: string | null = null;
  private sessionStartTime: number = 0;

  private constructor() {
    this.initialize();
  }

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  /**
   * Initialize analytics manager
   */
  private initialize(): void {
    this.startSession();
    this.startFlushTimer();

    // Listen for network changes
    networkMonitor.addListener((isConnected) => {
      if (isConnected) {
        this.flushQueue();
      }
    });
  }

  /**
   * Start new session
   */
  startSession(): void {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessionStartTime = Date.now();
  }

  /**
   * Track event
   */
  async trackEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
    const event: QueuedEvent = {
      eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        sessionDuration: Date.now() - this.sessionStartTime,
      },
      timestamp: Date.now(),
    };

    this.eventQueue.push(event);

    // Flush if queue is full
    if (this.eventQueue.length >= this.batchSize) {
      await this.flushQueue();
    } else if (networkMonitor.isOnline()) {
      // Try to send immediately if online
      await this.sendEvent(event);
    }
  }

  /**
   * Track screen view
   */
  async trackScreenView(screenName: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent('screen_view', {
      screenName,
      ...properties,
    });
  }

  /**
   * Send single event
   */
  private async sendEvent(event: QueuedEvent): Promise<void> {
    if (!networkMonitor.isOnline()) {
      return; // Will be sent when online
    }

    try {
      await analyticsService.trackEvent(event.eventName, event.properties);
      // Remove from queue if successful
      const index = this.eventQueue.findIndex(
        (e) => e.timestamp === event.timestamp && e.eventName === event.eventName
      );
      if (index !== -1) {
        this.eventQueue.splice(index, 1);
      }
    } catch (error) {
      console.error('[AnalyticsManager] Failed to send event:', error);
      // Keep in queue for retry
    }
  }

  /**
   * Flush event queue
   */
  async flushQueue(): Promise<void> {
    if (this.eventQueue.length === 0 || !networkMonitor.isOnline()) {
      return;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    // Send events in batch
    for (const event of eventsToSend) {
      try {
        await this.sendEvent(event);
      } catch (error) {
        // Re-queue failed events
        this.eventQueue.push(event);
      }
    }
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushQueue();
    }, this.flushInterval);
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flushQueue(); // Flush remaining events
  }
}

export const analyticsManager = AnalyticsManager.getInstance();
export default analyticsManager;


