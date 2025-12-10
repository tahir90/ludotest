import { useAppSelector, useAppDispatch } from './useAppStore';
import {
  loadBundles,
  purchaseBundle,
  addToPurchaseHistory,
  setShopLoading,
} from '$redux/reducers/shopSlice';
import { CrownBundle, Purchase } from '$types';

export const useShop = () => {
  const dispatch = useAppDispatch();
  const bundles = useAppSelector((state) => state.shop.bundles);
  const purchaseHistory = useAppSelector((state) => state.shop.purchaseHistory);
  const loading = useAppSelector((state) => state.shop.loading);

  return {
    bundles,
    purchaseHistory,
    loading,
    loadBundles: (newBundles: CrownBundle[]) => dispatch(loadBundles(newBundles)),
    purchaseBundle: (purchase: Purchase) => dispatch(purchaseBundle(purchase)),
    addToPurchaseHistory: (purchase: Purchase) => dispatch(addToPurchaseHistory(purchase)),
    setLoading: (isLoading: boolean) => dispatch(setShopLoading(isLoading)),
  };
};

