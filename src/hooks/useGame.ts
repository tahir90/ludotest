import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './useAppStore';
import { gameService } from '$services/api/game.service';
import { gameSocket } from '$services/websocket/GameSocket';
import { gameStateManager } from '$services/game/GameStateManager';
import { AppDispatch } from '$redux/store';

/**
 * useGame Hook
 * Provides game management methods and state
 */

export const useGame = () => {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector((state) => state.game);
  const sessionId = useAppSelector((state) => (state.game as any).sessionId);
  const isOnline = useAppSelector((state) => (state.game as any).isOnline);

  /**
   * Initialize game socket
   */
  useEffect(() => {
    gameSocket.initialize(dispatch);
    return () => {
      gameSocket.cleanup();
    };
  }, [dispatch]);

  /**
   * Create game session
   */
  const createGameSession = useCallback(async (config: {
    mode: '2_player' | '4_player' | 'private' | 'vip';
    entryFee: number;
    isPrivate?: boolean;
    invitedPlayers?: string[];
    password?: string;
  }) => {
    try {
      const session = await gameService.createGame(config);
      
      // Join game socket room
      gameSocket.joinGame(session.gameId);
      
      // Initialize game state manager
      gameStateManager.initialize(dispatch, session.gameId);
      gameStateManager.setLocalState(gameState);

      // Dispatch action to set session
      // dispatch(setGameSession(session));
      
      return session;
    } catch (error: any) {
      console.error('Failed to create game session:', error);
      throw error;
    }
  }, [dispatch, gameState]);

  /**
   * Join existing game
   */
  const joinExistingGame = useCallback(async (gameId: string, options?: {
    joinCode?: string;
    password?: string;
  }) => {
    try {
      const response = await gameService.joinGame(gameId, options);
      
      // Join game socket room
      gameSocket.joinGame(gameId);
      
      // Initialize game state manager
      gameStateManager.initialize(dispatch, gameId);
      gameStateManager.setLocalState(gameState);

      // Dispatch action to set session
      // dispatch(setGameSession({ gameId, ...response }));
      
      return response;
    } catch (error: any) {
      console.error('Failed to join game:', error);
      throw error;
    }
  }, [dispatch, gameState]);

  /**
   * Set ready status
   */
  const setReadyStatus = useCallback(async (gameId: string, ready: boolean) => {
    try {
      return await gameService.setReadyStatus(gameId, ready);
    } catch (error: any) {
      console.error('Failed to set ready status:', error);
      throw error;
    }
  }, []);

  /**
   * Start game
   */
  const startGame = useCallback(async (gameId: string) => {
    try {
      return await gameService.startGame(gameId);
    } catch (error: any) {
      console.error('Failed to start game:', error);
      throw error;
    }
  }, []);

  /**
   * Roll dice
   */
  const rollDice = useCallback(async (gameId: string) => {
    try {
      if (!gameId) {
        throw new Error('Game ID is required');
      }
      // Ensure gameStateManager is initialized with this gameId
      if (!gameStateManager.currentGameId || gameStateManager.currentGameId !== gameId) {
        gameStateManager.initialize(dispatch, gameId);
        gameStateManager.setLocalState(gameState);
      }
      // Use optimistic update
      return await gameStateManager.rollDiceOptimistic();
    } catch (error: any) {
      console.error('Failed to roll dice:', error);
      throw error;
    }
  }, [dispatch, gameState]);

  /**
   * Move piece
   */
  const movePiece = useCallback(async (gameId: string, move: {
    pieceId: number;
    toPosition: number;
  }) => {
    try {
      if (!gameId) {
        throw new Error('Game ID is required');
      }
      // Ensure gameStateManager is initialized with this gameId
      if (!gameStateManager.currentGameId || gameStateManager.currentGameId !== gameId) {
        gameStateManager.initialize(dispatch, gameId);
        gameStateManager.setLocalState(gameState);
      }
      // Use optimistic update
      return await gameStateManager.movePieceOptimistic(move);
    } catch (error: any) {
      console.error('Failed to move piece:', error);
      throw error;
    }
  }, [dispatch, gameState]);

  /**
   * Get game state
   */
  const getGameState = useCallback(async (gameId: string) => {
    try {
      const state = await gameService.getGameState(gameId);
      gameStateManager.setServerState(state);
      await gameStateManager.reconcileState();
      return state;
    } catch (error: any) {
      console.error('Failed to get game state:', error);
      throw error;
    }
  }, []);

  /**
   * Leave game
   */
  const leaveGame = useCallback(async (gameId: string) => {
    try {
      await gameService.leaveGame(gameId);
      gameSocket.leaveGame();
      gameStateManager.cleanup();
      // Dispatch action to clear session
      // dispatch(clearGameSession());
    } catch (error: any) {
      console.error('Failed to leave game:', error);
      throw error;
    }
  }, []);

  /**
   * Sync game state
   */
  const syncGameState = useCallback(async () => {
    if (!sessionId) {
      return;
    }
    
    try {
      await gameStateManager.reconcileState();
    } catch (error: any) {
      console.error('Failed to sync game state:', error);
    }
  }, [sessionId]);

  /**
   * Get game history
   */
  const getGameHistory = useCallback(async (params?: {
    cursor?: string;
    limit?: number;
    status?: 'completed' | 'abandoned';
  }) => {
    try {
      return await gameService.getGameHistory(params);
    } catch (error: any) {
      console.error('Failed to get game history:', error);
      throw error;
    }
  }, []);

  return {
    gameState,
    sessionId,
    isOnline,
    createGameSession,
    joinExistingGame,
    setReadyStatus,
    startGame,
    rollDice,
    movePiece,
    getGameState,
    leaveGame,
    syncGameState,
    getGameHistory,
  };
};


