import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useAppStore';
import { leaderboardService } from '$services/api/leaderboard.service';

/**
 * useLeaderboard Hook
 * Provides leaderboard data and methods
 */

export const useLeaderboard = () => {
  const dispatch = useAppDispatch();
  const leaderboard = useAppSelector((state) => state.leaderboard?.leaderboard || []);
  const crownKing = useAppSelector((state) => state.leaderboard?.crownKing || null);
  const crownQueen = useAppSelector((state) => state.leaderboard?.crownQueen || null);
  const loading = useAppSelector((state) => state.leaderboard?.loading || false);
  const pagination = useAppSelector((state) => state.leaderboard?.pagination || {
    hasMore: false,
    limit: 20,
  });

  /**
   * Fetch global leaderboard
   */
  const fetchLeaderboard = useCallback(async (params?: {
    type?: 'crown' | 'win';
    timeframe?: 'all_time' | 'weekly' | 'monthly';
    cursor?: string;
    limit?: number;
  }) => {
    try {
      // Dispatch Redux action if available
      // await dispatch(fetchLeaderboard(params)).unwrap();
      return await leaderboardService.getGlobalLeaderboard({
        type: params?.type || 'crown',
        timeframe: params?.timeframe || 'all_time',
        cursor: params?.cursor,
        limit: params?.limit,
      });
    } catch (error: any) {
      console.error('Failed to fetch leaderboard:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Fetch crown king and queen
   */
  const fetchCrownKingQueen = useCallback(async () => {
    try {
      // await dispatch(fetchCrownKingQueen()).unwrap();
      return await leaderboardService.getCrownKingQueen();
    } catch (error: any) {
      console.error('Failed to fetch crown king/queen:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Get rank pricing
   */
  const getRankPricing = useCallback(async () => {
    try {
      return await leaderboardService.getRankPricing();
    } catch (error: any) {
      console.error('Failed to get rank pricing:', error);
      throw error;
    }
  }, []);

  /**
   * Renew rank
   */
  const renewRank = useCallback(async (rankId: string, duration: 'weekly' | 'monthly' | 'seasonal') => {
    try {
      return await leaderboardService.renewRank({
        rankId,
        duration,
      });
    } catch (error: any) {
      console.error('Failed to renew rank:', error);
      throw error;
    }
  }, []);

  return {
    leaderboard,
    crownKing,
    crownQueen,
    loading,
    pagination,
    fetchLeaderboard,
    fetchCrownKingQueen,
    getRankPricing,
    renewRank,
  };
};


