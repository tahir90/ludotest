import { Socket } from 'socket.io-client';
import { socketManager } from './SocketManager';
import { AppDispatch } from '$redux/store';

/**
 * Gifting Socket
 * Handles WebSocket events for gifting namespace
 */

class GiftingSocket {
  private socket: Socket | null = null;
  private dispatch: AppDispatch | null = null;

  /**
   * Initialize gifting socket
   */
  async initialize(dispatch: AppDispatch): Promise<void> {
    this.dispatch = dispatch;
    this.socket = await socketManager.getSocket('gifting');
    this.setupEventListeners();
  }

  /**
   * Join game room for gifting
   */
  joinGame(gameId: string): void {
    if (!this.socket) {
      console.warn('[GiftingSocket] Socket not initialized');
      return;
    }

    // Use game socket namespace for game gifts
    this.socket.emit('game:join', { gameId });
    console.log(`[GiftingSocket] Joined game room for gifting: ${gameId}`);
  }

  /**
   * Join club room for gifting
   */
  joinClub(clubId: string): void {
    if (!this.socket) {
      console.warn('[GiftingSocket] Socket not initialized');
      return;
    }

    // Use club socket namespace for club gifts
    this.socket.emit('club:join', { clubId });
    console.log(`[GiftingSocket] Joined club room for gifting: ${clubId}`);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket || !this.dispatch) {
      return;
    }

    // Gift received
    this.socket.on('gift:received', (data) => {
      console.log('[GiftingSocket] Gift received:', data);
      // Trigger gift animation
      // this.dispatch(giftingActions.giftReceived(data));
    });

    // Global announcement (legendary gifts)
    this.socket.on('gift:global:announcement', (data) => {
      console.log('[GiftingSocket] Global announcement:', data);
      // Show global announcement banner
      // this.dispatch(giftingActions.globalAnnouncement(data));
    });

    // Club threshold updated
    this.socket.on('club:threshold:updated', (data) => {
      console.log('[GiftingSocket] Club threshold updated:', data);
      // this.dispatch(clubActions.thresholdUpdated(data));
    });

    // Club event goal reached
    this.socket.on('club:event:goal:reached', (data) => {
      console.log('[GiftingSocket] Club event goal reached:', data);
      // Show celebration animation
      // this.dispatch(clubActions.eventGoalReached(data));
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('[GiftingSocket] Error:', error);
    });
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.socket = null;
    this.dispatch = null;
  }
}

export const giftingSocket = new GiftingSocket();
export default giftingSocket;


