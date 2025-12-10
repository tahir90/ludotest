import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserStats, TierLevel } from '$types';
import { TIER_THRESHOLDS } from '$constants/config';
import { mockCurrentUser } from '$services/mockData';

interface UserState {
  currentUser: User | null;
  crowns: number;
  tier: TierLevel;
  level: number;
  stats: UserStats;
  loading: boolean;
}

const calculateTier = (crowns: number): TierLevel => {
  for (const [tier, range] of Object.entries(TIER_THRESHOLDS)) {
    if (crowns >= range.min && crowns <= range.max) {
      return tier as TierLevel;
    }
  }
  return 'D';
};

const initialState: UserState = {
  currentUser: mockCurrentUser,
  crowns: mockCurrentUser.crowns,
  tier: mockCurrentUser.tier,
  level: mockCurrentUser.level,
  stats: mockCurrentUser.stats,
  loading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateCrowns: (state, action: PayloadAction<number>) => {
      const newCrowns = Math.max(0, state.crowns + action.payload);
      state.crowns = newCrowns;
      state.tier = calculateTier(newCrowns);
      if (state.currentUser) {
        state.currentUser.crowns = newCrowns;
        state.currentUser.tier = state.tier;
      }
    },
    setCrowns: (state, action: PayloadAction<number>) => {
      const newCrowns = Math.max(0, action.payload);
      state.crowns = newCrowns;
      state.tier = calculateTier(newCrowns);
      if (state.currentUser) {
        state.currentUser.crowns = newCrowns;
        state.currentUser.tier = state.tier;
      }
    },
    updateTier: (state) => {
      state.tier = calculateTier(state.crowns);
      if (state.currentUser) {
        state.currentUser.tier = state.tier;
      }
    },
    updateStats: (state, action: PayloadAction<Partial<UserStats>>) => {
      state.stats = { ...state.stats, ...action.payload };
      if (state.currentUser) {
        state.currentUser.stats = state.stats;
      }
    },
    updateLevel: (state, action: PayloadAction<number>) => {
      state.level = action.payload;
      if (state.currentUser) {
        state.currentUser.level = action.payload;
      }
    },
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.crowns = action.payload.crowns;
      state.tier = action.payload.tier;
      state.level = action.payload.level;
      state.stats = action.payload.stats;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  updateCrowns,
  setCrowns,
  updateTier,
  updateStats,
  updateLevel,
  setCurrentUser,
  setLoading,
} = userSlice.actions;

export default userSlice.reducer;

