import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leaderboardService, LeaderboardEntry, CrownKingQueen } from '$services/api/leaderboard.service';
import { cacheManager, CacheManager } from '$services/cache/CacheManager';
import { ENV } from '$config/env';
import { PaginationInfo } from '$types/api.types';

interface LeaderboardState {
  leaderboard: LeaderboardEntry[];
  crownKing: CrownKingQueen['crownKing'] | null;
  crownQueen: CrownKingQueen['crownQueen'] | null;
  pagination: PaginationInfo;
  cacheTimestamp: number;
  loading: boolean;
  error: string | null;
  type: 'crown' | 'win';
  timeframe: 'all_time' | 'weekly' | 'monthly';
}

const initialState: LeaderboardState = {
  leaderboard: [],
  crownKing: null,
  crownQueen: null,
  pagination: {
    hasMore: false,
    limit: 20,
  },
  cacheTimestamp: 0,
  loading: false,
  error: null,
  type: 'crown',
  timeframe: 'all_time',
};

export const fetchLeaderboard = createAsyncThunk(
  'leaderboard/fetchLeaderboard',
  async (params?: { type?: 'crown' | 'win'; timeframe?: 'all_time' | 'weekly' | 'monthly'; cursor?: string }, { rejectWithValue }) => {
    try {
      const cacheKey = CacheManager.getCacheKey('leaderboard', params);
      const cached = cacheManager.get<{ data: LeaderboardEntry[]; pagination: PaginationInfo; cacheTimestamp: number }>(cacheKey);
      
      // CacheManager already handles TTL validation - if cached exists, it's valid
      if (cached) {
        return cached;
      }

      const response = await leaderboardService.getGlobalLeaderboard(params);
      const result = {
        data: response.data,
        pagination: response.pagination,
        cacheTimestamp: Date.now(),
      };
      
      cacheManager.set(cacheKey, result, ENV.CACHE_TTL.LEADERBOARD);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.userMessage || error.message || 'Failed to fetch leaderboard');
    }
  }
);

export const fetchCrownKingQueen = createAsyncThunk(
  'leaderboard/fetchCrownKingQueen',
  async (_, { rejectWithValue }) => {
    try {
      const response = await leaderboardService.getCrownKingQueen();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.userMessage || error.message || 'Failed to fetch crown king/queen');
    }
  }
);

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setType: (state, action) => {
      state.type = action.payload;
    },
    setTimeframe: (state, action) => {
      state.timeframe = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboard = action.payload.data;
        state.pagination = action.payload.pagination;
        state.cacheTimestamp = action.payload.cacheTimestamp;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchCrownKingQueen.fulfilled, (state, action) => {
        state.crownKing = action.payload.crownKing;
        state.crownQueen = action.payload.crownQueen;
      });
  },
});

export const { clearError, setType, setTimeframe } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;


