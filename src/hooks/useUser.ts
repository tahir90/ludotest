import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from './useAppStore';
import {
  updateCrowns,
  setCrowns,
  updateTier,
  updateStats,
  updateLevel,
  setCurrentUser,
  updateUserProfile,
  syncUserData,
} from '$redux/reducers/userSlice';
import { userService, UpdateProfileRequest, UserSettings } from '$services/api/user.service';

export const useUser = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.currentUser);
  const crowns = useAppSelector((state) => state.user.crowns);
  const tier = useAppSelector((state) => state.user.tier);
  const level = useAppSelector((state) => state.user.level);
  const stats = useAppSelector((state) => state.user.stats);
  const loading = useAppSelector((state) => state.user.loading);
  const settings = useAppSelector((state) => state.user.settings);

  /**
   * Update profile with API
   */
  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    try {
      await dispatch(updateUserProfile(data)).unwrap();
      return true;
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      return false;
    }
  }, [dispatch]);

  /**
   * Update settings
   */
  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    try {
      await userService.updateSettings(newSettings);
      // Optionally dispatch action to update settings in Redux
      return true;
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      return false;
    }
  }, []);

  /**
   * Upload avatar
   */
  const uploadAvatar = useCallback(async (file: any, onProgress?: (progress: number) => void) => {
    try {
      const response = await userService.uploadAvatar(file);
      // Update profile with new avatar URL
      await dispatch(updateUserProfile({ avatar: response.avatarUrl })).unwrap();
      return response.avatarUrl;
    } catch (error: any) {
      console.error('Failed to upload avatar:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Sync user data
   */
  const syncData = useCallback(async () => {
    try {
      await dispatch(syncUserData()).unwrap();
      return true;
    } catch (error: any) {
      console.error('Failed to sync user data:', error);
      return false;
    }
  }, [dispatch]);

  /**
   * Get player level info
   */
  const getPlayerLevel = useCallback(async () => {
    try {
      return await userService.getPlayerLevel();
    } catch (error: any) {
      console.error('Failed to get player level:', error);
      throw error;
    }
  }, []);

  /**
   * Add experience
   */
  const addExperience = useCallback(async (data: {
    gameId?: string;
    experienceEarned: number;
    reason?: string;
    multiplier?: number;
  }) => {
    try {
      const response = await userService.addExperience(data);
      if (response.leveledUp && response.newLevel) {
        dispatch(updateLevel(response.newLevel));
      }
      return response;
    } catch (error: any) {
      console.error('Failed to add experience:', error);
      throw error;
    }
  }, [dispatch]);

  return {
    user,
    crowns,
    tier,
    level,
    stats,
    loading,
    settings,
    updateCrowns: (amount: number) => dispatch(updateCrowns(amount)),
    setCrowns: (amount: number) => dispatch(setCrowns(amount)),
    updateTier: () => dispatch(updateTier()),
    updateStats: (newStats: Partial<typeof stats>) => dispatch(updateStats(newStats)),
    updateLevel: (newLevel: number) => dispatch(updateLevel(newLevel)),
    setCurrentUser: (newUser: typeof user) => {
      if (newUser) dispatch(setCurrentUser(newUser));
    },
    updateProfile,
    updateSettings,
    uploadAvatar,
    syncData,
    getPlayerLevel,
    addExperience,
  };
};

