import { httpClient } from './httpClient';
import { API_ENDPOINTS } from '$config/api.config';
import { PaginationParams, PaginatedResponse } from '$types/api.types';

/**
 * Leaderboard Service
 * Handles leaderboard and ranking API calls
 */

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string;
  level: number;
  tier: string;
  score: number; // crowns or wins
  isCurrentUser: boolean;
}

export interface CrownKingQueen {
  crownKing: {
    userId: string;
    username: string;
    avatarUrl: string;
    totalCrowns: number;
    level: number;
    tier: string;
  };
  crownQueen: {
    userId: string;
    username: string;
    avatarUrl: string;
    totalCrowns: number;
    level: number;
    tier: string;
  };
}

export interface RankPricing {
  id: string;
  name: string;
  weeklyPrice: number;
  monthlyPrice: number;
  seasonalPrice: number;
}

export interface GetLeaderboardParams extends PaginationParams {
  type?: 'crown' | 'win';
  timeframe?: 'all_time' | 'weekly' | 'monthly';
}

export interface RenewRankRequest {
  rankId: string;
  duration: 'weekly' | 'monthly' | 'seasonal';
}

class LeaderboardService {
  /**
   * Get global leaderboard
   */
  async getGlobalLeaderboard(params?: GetLeaderboardParams): Promise<PaginatedResponse<LeaderboardEntry>> {
    const response = await httpClient.get<{
      leaderboard?: LeaderboardEntry[];
      data?: LeaderboardEntry[];
      pagination?: any;
    }>(API_ENDPOINTS.LEADERBOARD.GLOBAL, { params });
    
    // httpClient returns response.data.data, so response is already the data object
    const leaderboard = response.leaderboard || response.data || [];
    const pagination = response.pagination || { hasMore: false, limit: 20 };
    
    return {
      data: leaderboard,
      pagination,
    };
  }

  /**
   * Get Crown King/Queen
   */
  async getCrownKingQueen(): Promise<CrownKingQueen> {
    return httpClient.get<CrownKingQueen>(API_ENDPOINTS.LEADERBOARD.CROWN_KING);
  }

  /**
   * Get rank pricing
   */
  async getRankPricing(): Promise<{ ranks: RankPricing[] }> {
    return httpClient.get<{ ranks: RankPricing[] }>(API_ENDPOINTS.LEADERBOARD.RANK_PRICING);
  }

  /**
   * Renew rank
   */
  async renewRank(data: RenewRankRequest): Promise<{
    message: string;
    expiresAt: string;
  }> {
    return httpClient.post(API_ENDPOINTS.LEADERBOARD.RENEW_RANK, data);
  }
}

export const leaderboardService = new LeaderboardService();
export default leaderboardService;


