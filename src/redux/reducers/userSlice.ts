import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User, UserStats, TierLevel } from '$types';
import { TIER_THRESHOLDS } from '$constants/config';
import { authService, AuthResponse } from '$services/api/auth.service';
import { userService, UserProfile, UserSettings } from '$services/api/user.service';
import { socialAuthManager } from '$services/auth/SocialAuthManager';

interface UserState {
  currentUser: User | null;
  crowns: number;
  tier: TierLevel;
  level: number;
  stats: UserStats;
  loading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  settings: UserSettings | null;
  error: string | null;
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
  currentUser: null,
  crowns: 0,
  tier: 'D',
  level: 1,
  stats: {
    gamesPlayed: 0,
    gamesWon: 0,
    winRate: 0,
    winStreak: 0,
    totalCrownsEarned: 0,
  },
  loading: false,
  isAuthenticated: false,
  isGuest: false,
  settings: null,
  error: null,
};

// Helper to map API user to app User type
const mapApiUserToUser = (apiUser: AuthResponse['user'] | UserProfile | any): User => {
  // Validate apiUser is not null/undefined
  if (!apiUser || typeof apiUser !== 'object') {
    throw new Error('Invalid user data: apiUser is null or undefined');
  }

  // Check if it's AuthResponse['user'] (has fewer fields) or UserProfile (has more fields)
  // Safe check: only use 'in' operator if apiUser is an object
  const hasAvatarUrl = apiUser && typeof apiUser === 'object' && 'avatarUrl' in apiUser;
  const hasCountry = apiUser && typeof apiUser === 'object' && 'country' in apiUser;
  const isAuthResponse = !hasAvatarUrl && !hasCountry;
  
  // Extract stats if available from API response
  const apiStats = (apiUser as any).stats;
  const stats: UserStats = apiStats ? {
    gamesPlayed: apiStats.gamesPlayed || 0,
    gamesWon: apiStats.gamesWon || 0,
    winRate: apiStats.winRate || 0,
    winStreak: apiStats.winStreak || 0,
    totalCrownsEarned: apiStats.totalCrownsEarned || 0,
    teamWins: apiStats.teamWins,
  } : {
    gamesPlayed: 0,
    gamesWon: 0,
    winRate: 0,
    winStreak: 0,
    totalCrownsEarned: 0,
  };
  
  return {
    id: apiUser.id || '',
    username: apiUser.username || '',
    avatar: hasAvatarUrl ? (apiUser.avatarUrl || '') : '',
    crowns: apiUser.crowns || 0,
    tier: (apiUser.tier || 'D') as TierLevel,
    level: apiUser.level || 1,
    country: hasCountry ? (apiUser.country || '') : '',
    countryCode: (apiUser && typeof apiUser === 'object' && 'countryCode' in apiUser) ? apiUser.countryCode : undefined,
    stats,
    isOnline: (apiUser && typeof apiUser === 'object' && 'isOnline' in apiUser) ? apiUser.isOnline : false,
  };
};

// Async Thunks
export const loginAsGuest = createAsyncThunk(
  'user/loginAsGuest',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.guestLogin();
      
      // Validate response structure
      if (!response || !response.user) {
        throw new Error('Invalid response: user data is missing');
      }
      
      return {
        user: mapApiUserToUser(response.user),
        isGuest: response.user.isGuest || false,
      };
    } catch (error: any) {
      console.error('Guest login error:', error);
      return rejectWithValue(error.userMessage || error.message || 'Login failed');
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'user/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const socialResult = await socialAuthManager.signInWithGoogle();
      const response = await authService.googleLogin(socialResult);
      return {
        user: mapApiUserToUser(response.user),
        isGuest: response.user.isGuest,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Google login failed');
    }
  }
);

export const loginWithApple = createAsyncThunk(
  'user/loginWithApple',
  async (_, { rejectWithValue }) => {
    try {
      const socialResult = await socialAuthManager.signInWithApple();
      const response = await authService.appleLogin(socialResult);
      return {
        user: mapApiUserToUser(response.user),
        isGuest: response.user.isGuest,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Apple login failed');
    }
  }
);

export const loginWithFacebook = createAsyncThunk(
  'user/loginWithFacebook',
  async (_, { rejectWithValue }) => {
    try {
      const socialResult = await socialAuthManager.signInWithFacebook();
      const response = await authService.facebookLogin(socialResult);
      return {
        user: mapApiUserToUser(response.user),
        isGuest: response.user.isGuest,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Facebook login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return true;
    } catch (error: any) {
      // Even if API call fails, clear local state
      return true;
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await userService.getCurrentUser();
      return mapApiUserToUser(profile);
    } catch (error: any) {
      return rejectWithValue(error.userMessage || error.message || 'Failed to fetch user');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (data: { username?: string; avatar?: string; signature?: string; country?: string; countryCode?: string }, { rejectWithValue }) => {
    try {
      const profile = await userService.updateProfile(data);
      return mapApiUserToUser(profile);
    } catch (error: any) {
      return rejectWithValue(error.userMessage || error.message || 'Failed to update profile');
    }
  }
);

export const syncUserData = createAsyncThunk(
  'user/syncUserData',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await userService.getCurrentUser();
      return mapApiUserToUser(profile);
    } catch (error: any) {
      return rejectWithValue(error.userMessage || error.message || 'Failed to sync user data');
    }
  }
);

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
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login thunks
    builder
      .addCase(loginAsGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsGuest.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.crowns = action.payload.user.crowns;
        state.tier = action.payload.user.tier;
        state.level = action.payload.user.level;
        state.stats = action.payload.user.stats;
        state.isAuthenticated = true;
        state.isGuest = action.payload.isGuest;
      })
      .addCase(loginAsGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.crowns = action.payload.user.crowns;
        state.tier = action.payload.user.tier;
        state.level = action.payload.user.level;
        state.stats = action.payload.user.stats;
        state.isAuthenticated = true;
        state.isGuest = action.payload.isGuest;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(loginWithApple.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithApple.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.crowns = action.payload.user.crowns;
        state.tier = action.payload.user.tier;
        state.level = action.payload.user.level;
        state.stats = action.payload.user.stats;
        state.isAuthenticated = true;
        state.isGuest = action.payload.isGuest;
      })
      .addCase(loginWithApple.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(loginWithFacebook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithFacebook.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.crowns = action.payload.user.crowns;
        state.tier = action.payload.user.tier;
        state.level = action.payload.user.level;
        state.stats = action.payload.user.stats;
        state.isAuthenticated = true;
        state.isGuest = action.payload.isGuest;
      })
      .addCase(loginWithFacebook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.currentUser = null;
        state.crowns = 0;
        state.tier = 'D';
        state.level = 1;
        state.stats = {
          gamesPlayed: 0,
          gamesWon: 0,
          winRate: 0,
          winStreak: 0,
          totalCrownsEarned: 0,
        };
        state.isAuthenticated = false;
        state.isGuest = false;
        state.settings = null;
        state.error = null;
      });

    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.crowns = action.payload.crowns;
        state.tier = action.payload.tier;
        state.level = action.payload.level;
        state.stats = action.payload.stats;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.crowns = action.payload.crowns;
        state.tier = action.payload.tier;
        state.level = action.payload.level;
        state.stats = action.payload.stats;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Sync user data
    builder
      .addCase(syncUserData.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.crowns = action.payload.crowns;
        state.tier = action.payload.tier;
        state.level = action.payload.level;
        state.stats = action.payload.stats;
      });
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
  clearError,
} = userSlice.actions;

export default userSlice.reducer;

