import { httpClient } from './httpClient';
import { API_ENDPOINTS } from '$config/api.config';
import { PaginationParams, PaginatedResponse } from '$types/api.types';

/**
 * Game Service
 * Handles all game-related API calls
 */

export interface CreateGameRequest {
  mode: '2_player' | '4_player' | 'private' | 'vip';
  entryFee: number;
  isPrivate?: boolean;
  invitedPlayers?: string[];
  password?: string;
}

export interface GameSession {
  gameId: string;
  mode: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'abandoned';
  entryFee: number;
  currentPlayers: number;
  maxPlayers: number;
  joinCode?: string;
  createdAt: string;
}

export interface JoinGameRequest {
  joinCode?: string;
  password?: string;
}

export interface JoinGameResponse {
  gameId: string;
  playerId: string;
  position: number;
  status: string;
}

export interface GameState {
  gameId: string;
  mode: string;
  status: string;
  currentPlayerIndex: number;
  diceRoll?: number;
  players: GamePlayer[];
  moves: any[];
  startedAt?: string;
}

export interface GamePlayer {
  userId: string;
  username: string;
  color: string;
  position: number;
  pieces: GamePiece[];
  ready: boolean;
}

export interface GamePiece {
  id: number;
  position: number;
  isHome: boolean;
  isFinished: boolean;
}

export interface RollDiceResponse {
  gameId: string;
  diceValue: number;
  canMove: boolean;
  validMoves: ValidMove[];
}

export interface ValidMove {
  pieceId: number;
  fromPosition: number;
  toPosition: number;
}

export interface MovePieceRequest {
  pieceId: number;
  toPosition: number;
}

export interface MovePieceResponse {
  gameId: string;
  move: {
    pieceId: number;
    fromPosition: number;
    toPosition: number;
    captured: boolean;
  };
  nextPlayerIndex: number;
  gameStatus: string;
}

export interface GameHistoryEntry {
  gameId: string;
  mode: string;
  status: string;
  result: 'won' | 'lost' | 'abandoned';
  crownsEarned: number;
  experienceEarned: number;
  completedAt: string;
}

export interface GameHistoryParams extends PaginationParams {
  status?: 'completed' | 'abandoned';
}

class GameService {
  /**
   * Create game session
   */
  async createGame(config: CreateGameRequest): Promise<GameSession> {
    return httpClient.post<GameSession>(API_ENDPOINTS.GAME.CREATE, config);
  }

  /**
   * Join game
   */
  async joinGame(gameId: string, options?: JoinGameRequest): Promise<JoinGameResponse> {
    return httpClient.post<JoinGameResponse>(
      API_ENDPOINTS.GAME.JOIN(gameId),
      options || {}
    );
  }

  /**
   * Set ready status
   */
  async setReadyStatus(gameId: string, ready: boolean): Promise<{
    gameId: string;
    ready: boolean;
    allPlayersReady: boolean;
  }> {
    return httpClient.post(API_ENDPOINTS.GAME.SET_READY(gameId), { ready });
  }

  /**
   * Start game
   */
  async startGame(gameId: string): Promise<{
    gameId: string;
    status: string;
    currentPlayerIndex: number;
    startedAt: string;
  }> {
    return httpClient.post(API_ENDPOINTS.GAME.START(gameId));
  }

  /**
   * Roll dice
   */
  async rollDice(gameId: string): Promise<RollDiceResponse> {
    return httpClient.post<RollDiceResponse>(API_ENDPOINTS.GAME.ROLL_DICE(gameId));
  }

  /**
   * Move piece
   */
  async movePiece(gameId: string, move: MovePieceRequest): Promise<MovePieceResponse> {
    return httpClient.post<MovePieceResponse>(
      API_ENDPOINTS.GAME.MOVE_PIECE(gameId),
      move
    );
  }

  /**
   * Get game state
   */
  async getGameState(gameId: string): Promise<GameState> {
    return httpClient.get<GameState>(API_ENDPOINTS.GAME.GET_STATE(gameId));
  }

  /**
   * Leave game
   */
  async leaveGame(gameId: string): Promise<{ message: string }> {
    return httpClient.post(API_ENDPOINTS.GAME.LEAVE(gameId));
  }

  /**
   * Get game history
   */
  async getGameHistory(params?: GameHistoryParams): Promise<PaginatedResponse<GameHistoryEntry>> {
    return httpClient.get<PaginatedResponse<GameHistoryEntry>>(
      API_ENDPOINTS.GAME.HISTORY,
      { params }
    );
  }
}

export const gameService = new GameService();
export default gameService;


