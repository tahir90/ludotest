import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { giftingService, GiftCatalog, GiftHistoryEntry, SendGiftResponse } from '$services/api/gifting.service';
import { cacheManager, CacheManager } from '$services/cache/CacheManager';
import { ENV } from '$config/env';
import { PaginationInfo } from '$types/api.types';

interface GiftAnimation {
  giftId: string;
  animationUrl: string;
  audioUrl: string;
  duration: number;
  sender: {
    userId: string;
    username: string;
    avatar: string;
  };
}

interface GiftingState {
  catalog: GiftCatalog | null;
  history: GiftHistoryEntry[];
  pendingAnimations: GiftAnimation[];
  pagination: PaginationInfo;
  loading: boolean;
  error: string | null;
}

const initialState: GiftingState = {
  catalog: null,
  history: [],
  pendingAnimations: [],
  pagination: {
    hasMore: false,
    limit: 20,
  },
  loading: false,
  error: null,
};

export const fetchGiftCatalog = createAsyncThunk(
  'gifting/fetchGiftCatalog',
  async (category?: 'basic' | 'premium' | 'ultra', { rejectWithValue }) => {
    try {
      const cacheKey = CacheManager.getCacheKey('gift_catalog', { category });
      const cached = cacheManager.get<GiftCatalog>(cacheKey);
      
      if (cached) {
        return cached;
      }

      const response = await giftingService.getGiftCatalog({ category });
      cacheManager.set(cacheKey, response, ENV.CACHE_TTL.GIFT_CATALOG);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.userMessage || error.message || 'Failed to fetch gift catalog');
    }
  }
);

export const sendGift = createAsyncThunk(
  'gifting/sendGift',
  async (data: {
    giftId: string;
    recipientType: 'user' | 'club';
    recipientId: string;
    quantity: number;
    message?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await giftingService.sendGift(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.userMessage || error.message || 'Failed to send gift');
    }
  }
);

export const fetchGiftHistory = createAsyncThunk(
  'gifting/fetchGiftHistory',
  async (params?: { type?: 'sent' | 'received'; cursor?: string }, { rejectWithValue }) => {
    try {
      const response = await giftingService.getGiftHistory(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.userMessage || error.message || 'Failed to fetch gift history');
    }
  }
);

const giftingSlice = createSlice({
  name: 'gifting',
  initialState,
  reducers: {
    addPendingAnimation: (state, action) => {
      state.pendingAnimations.push(action.payload);
    },
    removePendingAnimation: (state, action) => {
      state.pendingAnimations = state.pendingAnimations.filter(
        (anim) => anim.giftId !== action.payload
      );
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGiftCatalog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGiftCatalog.fulfilled, (state, action) => {
        state.loading = false;
        state.catalog = action.payload;
      })
      .addCase(fetchGiftCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(sendGift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendGift.fulfilled, (state, action) => {
        state.loading = false;
        // Add animation to queue if provided
        if (action.payload.animation) {
          state.pendingAnimations.push({
            giftId: action.payload.giftId,
            ...action.payload.animation,
            sender: {
              userId: '', // Will be filled from context
              username: '',
              avatar: '',
            },
          });
        }
      })
      .addCase(sendGift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchGiftHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGiftHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchGiftHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addPendingAnimation, removePendingAnimation, clearError } = giftingSlice.actions;
export default giftingSlice.reducer;


