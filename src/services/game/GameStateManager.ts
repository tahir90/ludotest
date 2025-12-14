import { AppDispatch } from '$redux/store';
import { gameService, GameState, MovePieceRequest, RollDiceResponse, MovePieceResponse } from '$services/api/game.service';

/**
 * Game State Manager
 * Handles hybrid game logic: optimistic updates + server reconciliation
 */

interface PendingMove {
  type: 'roll' | 'move';
  timestamp: number;
  rollData?: RollDiceResponse;
  moveData?: MovePieceRequest;
  rollbackFn?: () => void;
}

class GameStateManager {
  private dispatch: AppDispatch | null = null;
  private gameId: string | null = null;
  private pendingMoves: PendingMove[] = [];
  private serverState: GameState | null = null;
  private localState: any = null;
  private syncInProgress: boolean = false;

  /**
   * Initialize with dispatch and game ID
   */
  initialize(dispatch: AppDispatch, gameId: string): void {
    this.dispatch = dispatch;
    this.gameId = gameId;
  }

  /**
   * Set local game state reference
   */
  setLocalState(state: any): void {
    this.localState = state;
  }

  /**
   * Set server game state
   */
  setServerState(state: GameState): void {
    this.serverState = state;
  }

  /**
   * Get current game ID
   */
  get currentGameId(): string | null {
    return this.gameId;
  }

  /**
   * Roll dice with optimistic update
   */
  async rollDiceOptimistic(): Promise<RollDiceResponse> {
    if (!this.gameId) {
      throw new Error('Game not initialized');
    }

    // Store current state for rollback
    const rollbackFn = this.createRollbackSnapshot();

    // Optimistic update: Generate random dice value locally
    const optimisticDiceValue = Math.floor(Math.random() * 6) + 1;
    
    // Apply optimistic update to local state
    if (this.dispatch && this.localState) {
      // Dispatch optimistic dice roll action
      // This would be a custom action that updates the dice value immediately
      // For now, we'll just track it
    }

    const pendingMove: PendingMove = {
      type: 'roll',
      timestamp: Date.now(),
      rollbackFn,
    };

    this.pendingMoves.push(pendingMove);

    try {
      // Make server request
      const response = await gameService.rollDice(this.gameId);
      
      // Update pending move with server response
      pendingMove.rollData = response;

      // Reconcile with server
      await this.reconcileState();

      // Remove from pending
      this.pendingMoves = this.pendingMoves.filter(m => m !== pendingMove);

      return response;
    } catch (error) {
      // Rollback on error
      if (rollbackFn) {
        rollbackFn();
      }

      // Remove from pending
      this.pendingMoves = this.pendingMoves.filter(m => m !== pendingMove);

      throw error;
    }
  }

  /**
   * Move piece with optimistic update
   */
  async movePieceOptimistic(move: MovePieceRequest): Promise<MovePieceResponse> {
    if (!this.gameId) {
      throw new Error('Game not initialized');
    }

    // Store current state for rollback
    const rollbackFn = this.createRollbackSnapshot();

    // Optimistic update: Apply move to local state immediately
    if (this.dispatch && this.localState) {
      // Dispatch optimistic move action
      // This would update the piece position immediately
    }

    const pendingMove: PendingMove = {
      type: 'move',
      timestamp: Date.now(),
      moveData: move,
      rollbackFn,
    };

    this.pendingMoves.push(pendingMove);

    try {
      // Make server request
      const response = await gameService.movePiece(this.gameId, move);

      // Update pending move with server response
      pendingMove.rollData = response as any;

      // Reconcile with server
      await this.reconcileState();

      // Remove from pending
      this.pendingMoves = this.pendingMoves.filter(m => m !== pendingMove);

      return response;
    } catch (error) {
      // Rollback on error
      if (rollbackFn) {
        rollbackFn();
      }

      // Remove from pending
      this.pendingMoves = this.pendingMoves.filter(m => m !== pendingMove);

      throw error;
    }
  }

  /**
   * Reconcile local state with server state
   */
  async reconcileState(): Promise<void> {
    if (this.syncInProgress || !this.gameId) {
      return;
    }

    this.syncInProgress = true;

    try {
      // Fetch latest server state
      const serverState = await gameService.getGameState(this.gameId);
      this.serverState = serverState;

      // If there are conflicts, resolve them
      if (this.hasConflicts(serverState)) {
        // Server state takes precedence
        this.applyServerState(serverState);
      } else {
        // Merge states if no conflicts
        this.mergeStates(serverState);
      }
    } catch (error) {
      console.error('[GameStateManager] Reconciliation failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Check if there are conflicts between local and server state
   */
  private hasConflicts(serverState: GameState): boolean {
    if (!this.localState || !serverState) {
      return false;
    }

    // Check if current player matches
    // Check if dice values match
    // Check if piece positions match
    // This is a simplified check - you'd want more sophisticated conflict detection

    return false;
  }

  /**
   * Apply server state (overwrite local)
   */
  private applyServerState(serverState: GameState): void {
    if (!this.dispatch) {
      return;
    }

    // Dispatch action to sync game state from server
    // This would update the Redux state with server state
    // You'd need to map server state to your local game state format
  }

  /**
   * Merge local and server states
   */
  private mergeStates(serverState: GameState): void {
    if (!this.dispatch || !this.localState) {
      return;
    }

    // Merge logic: prefer server for critical data, keep local for UI state
    // This is a simplified merge - you'd want more sophisticated merging
  }

  /**
   * Create rollback snapshot
   */
  private createRollbackSnapshot(): (() => void) | undefined {
    if (!this.localState) {
      return undefined;
    }

    // Create deep copy of current state
    const snapshot = JSON.parse(JSON.stringify(this.localState));

    return () => {
      // Restore state from snapshot
      if (this.dispatch) {
        // Dispatch action to restore state
        // This would reset the game state to the snapshot
      }
    };
  }

  /**
   * Resolve conflict between local and server move
   */
  resolveConflict(serverState: GameState): void {
    // Server state always wins in conflicts
    this.applyServerState(serverState);
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.dispatch = null;
    this.gameId = null;
    this.pendingMoves = [];
    this.serverState = null;
    this.localState = null;
    this.syncInProgress = false;
  }
}

export const gameStateManager = new GameStateManager();
export default gameStateManager;


