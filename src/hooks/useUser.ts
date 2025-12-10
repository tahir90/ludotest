import { useAppSelector, useAppDispatch } from './useAppStore';
import {
  updateCrowns,
  setCrowns,
  updateTier,
  updateStats,
  updateLevel,
  setCurrentUser,
} from '$redux/reducers/userSlice';

export const useUser = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.currentUser);
  const crowns = useAppSelector((state) => state.user.crowns);
  const tier = useAppSelector((state) => state.user.tier);
  const level = useAppSelector((state) => state.user.level);
  const stats = useAppSelector((state) => state.user.stats);
  const loading = useAppSelector((state) => state.user.loading);

  return {
    user,
    crowns,
    tier,
    level,
    stats,
    loading,
    updateCrowns: (amount: number) => dispatch(updateCrowns(amount)),
    setCrowns: (amount: number) => dispatch(setCrowns(amount)),
    updateTier: () => dispatch(updateTier()),
    updateStats: (newStats: Partial<typeof stats>) => dispatch(updateStats(newStats)),
    updateLevel: (newLevel: number) => dispatch(updateLevel(newLevel)),
    setCurrentUser: (newUser: typeof user) => {
      if (newUser) dispatch(setCurrentUser(newUser));
    },
  };
};

