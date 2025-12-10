import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CrownBundle, Purchase } from '$types';
import { CROWN_BUNDLES } from '$constants/config';
import { mockPurchaseHistory } from '$services/mockData';

interface ShopState {
  bundles: CrownBundle[];
  purchaseHistory: Purchase[];
  loading: boolean;
}

const initialState: ShopState = {
  bundles: CROWN_BUNDLES,
  purchaseHistory: mockPurchaseHistory,
  loading: false,
};

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    loadBundles: (state, action: PayloadAction<CrownBundle[]>) => {
      state.bundles = action.payload;
    },
    purchaseBundle: (state, action: PayloadAction<Purchase>) => {
      state.purchaseHistory.unshift(action.payload);
    },
    addToPurchaseHistory: (state, action: PayloadAction<Purchase>) => {
      state.purchaseHistory.unshift(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  loadBundles,
  purchaseBundle,
  addToPurchaseHistory,
  setLoading: setShopLoading,
} = shopSlice.actions;

export default shopSlice.reducer;

