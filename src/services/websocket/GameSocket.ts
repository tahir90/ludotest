import { Socket } from 'socket.io-client';
import { socketManager } from './SocketManager';
import { AppDispatch } from '$redux/store';
import { setServerGameState, updateDiceNumber, updatePlayerPieceValue, updatePlayerChance, announceWinner } from '$redux/reducers/gameSlice';

/**
 * Game Socket
 * Handles WebSocket events for game namespace
 */

class GameSocket {
  private socket: Socket | null = null;
  private dispatch: AppDispatch | null = null;
  private gameId: string | null = null;

  /**
   * Initialize game socket
   */
  async initialize(dispatch: AppDispatch): Promise<void> {
    this.dispatch = dispatch;
    this.socket = await socketManager.getSocket('gaming');
    this.setupEventListeners();
  }

  /**
   * Join game room
   */
  joinGame(gameId: string): void {
    if (!this.socket) {
      console.warn('[GameSocket] Socket not initialized');
      return;
    }

    this.gameId = gameId;
    this.socket.emit('game:join', { gameId });
    console.log(`[GameSocket] Joined game room: ${gameId}`);
  }

  /**
   * Leave game room
   */
  leaveGame(): void {
    if (!this.socket || !this.gameId) {
      return;
    }

    this.socket.emit('game:leave', { gameId: this.gameId });
    this.gameId = null;
    console.log('[GameSocket] Left game room');
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket || !this.dispatch) {
      return;
    }

    // Game state update
    this.socket.on('game:update', (data) => {
      console.log('[GameSocket] Game update:', data);
      if (this.dispatch) {
        this.dispatch(setServerGameState(data));
      }
    });

    // Player joined
    this.socket.on('game:player_joined', (data) => {
      console.log('[GameSocket] Player joined:', data);
      // You can dispatch a custom action here if you have one
      // this.dispatch(playerJoined(data));
    });

    // Player left
    this.socket.on('game:player_left', (data) => {
      console.log('[GameSocket] Player left:', data);
      // You can dispatch a custom action here if you have one
      // this.dispatch(playerLeft(data));
    });

    // Game started
    this.socket.on('game:started', (data) => {
      console.log('[GameSocket] Game started:', data);
      if (this.dispatch && data.currentPlayerIndex !== undefined) {
        // Map server player index to local player number
        // This depends on your game's player mapping logic
        this.dispatch(updatePlayerChance({ chancePlayer: data.currentPlayerIndex + 1 }));
      }
    });

    // Dice rolled
    this.socket.on('game:rolled', (data) => {
      console.log('[GameSocket] Dice rolled:', data);
      if (this.dispatch && data.diceValue) {
        this.dispatch(updateDiceNumber({ diceNo: data.diceValue }));
      }
    });

    // Piece moved
    this.socket.on('game:moved', (data) => {
      console.log('[GameSocket] Piece moved:', data);
      if (this.dispatch && data.move) {
        const { pieceId, toPosition, playerNo } = data.move;
        // You'll need to map server player info to local player number
        // This is a simplified version - adjust based on your data structure
        this.dispatch(updatePlayerPieceValue({
          playerNo: playerNo || 1, // Adjust based on your mapping
          pieceId,
          pos: toPosition,
          travelCount: 0, // Calculate based on position
        }));
      }
    });

    // Game completed
    this.socket.on('game:completed', (data) => {
      console.log('[GameSocket] Game completed:', data);
      if (this.dispatch && data.winner) {
        // Map server winner to local player number
        this.dispatch(announceWinner(data.winner.playerNo || data.winner.position));
      }
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('[GameSocket] Error:', error);
    });
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.gameId) {
      this.leaveGame();
    }
    if (this.socket) {
      this.socket.removeAllListeners();
    }
    this.socket = null;
    this.dispatch = null;
  }
}

export const gameSocket = new GameSocket();
export default gameSocket;


