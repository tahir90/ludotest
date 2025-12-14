import { Socket } from 'socket.io-client';
import { socketManager } from './SocketManager';
import { AppDispatch } from '$redux/store';

/**
 * Club Socket
 * Handles WebSocket events for club namespace
 */

class ClubSocket {
  private socket: Socket | null = null;
  private dispatch: AppDispatch | null = null;
  private clubId: string | null = null;

  /**
   * Initialize club socket
   */
  async initialize(dispatch: AppDispatch): Promise<void> {
    this.dispatch = dispatch;
    this.socket = await socketManager.getSocket('clubs');
    this.setupEventListeners();
  }

  /**
   * Join club room
   */
  joinClub(clubId: string): void {
    if (!this.socket) {
      console.warn('[ClubSocket] Socket not initialized');
      return;
    }

    this.clubId = clubId;
    this.socket.emit('club:join', { clubId });
    console.log(`[ClubSocket] Joined club room: ${clubId}`);
  }

  /**
   * Leave club room
   */
  leaveClub(): void {
    if (!this.socket || !this.clubId) {
      return;
    }

    this.socket.emit('club:leave', { clubId: this.clubId });
    this.clubId = null;
    console.log('[ClubSocket] Left club room');
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket || !this.dispatch) {
      return;
    }

    // New chat message
    this.socket.on('club:message', (data) => {
      console.log('[ClubSocket] New message:', data);
      // this.dispatch(clubActions.newMessage(data));
    });

    // Member joined
    this.socket.on('club:member_joined', (data) => {
      console.log('[ClubSocket] Member joined:', data);
      // this.dispatch(clubActions.memberJoined(data));
    });

    // Member left
    this.socket.on('club:member_left', (data) => {
      console.log('[ClubSocket] Member left:', data);
      // this.dispatch(clubActions.memberLeft(data));
    });

    // Threshold updated
    this.socket.on('club:threshold:updated', (data) => {
      console.log('[ClubSocket] Threshold updated:', data);
      // this.dispatch(clubActions.thresholdUpdated(data));
    });

    // Event goal reached
    this.socket.on('club:event:goal:reached', (data) => {
      console.log('[ClubSocket] Event goal reached:', data);
      // this.dispatch(clubActions.eventGoalReached(data));
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('[ClubSocket] Error:', error);
    });
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.clubId) {
      this.leaveClub();
    }
    this.socket = null;
    this.dispatch = null;
  }
}

export const clubSocket = new ClubSocket();
export default clubSocket;


