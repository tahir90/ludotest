import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useAppStore';
import { socialService } from '$services/api/social.service';

/**
 * useSocial Hook
 * Provides social features (friends, friend requests, blocking)
 */

export const useSocial = () => {
  const dispatch = useAppDispatch();
  const friends = useAppSelector((state) => state.social?.friends || []);
  const friendRequests = useAppSelector((state) => state.social?.friendRequests || []);
  const blockedUsers = useAppSelector((state) => state.social?.blockedUsers || []);
  const loading = useAppSelector((state) => state.social?.loading || false);
  const error = useAppSelector((state) => state.social?.error || null);

  /**
   * Fetch friends list
   */
  const fetchFriends = useCallback(async () => {
    try {
      // Dispatch Redux action if available
      // await dispatch(fetchFriends()).unwrap();
      const friendsList = await socialService.getFriendsList();
      return friendsList;
    } catch (error: any) {
      console.error('Failed to fetch friends:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Send friend request
   */
  const sendFriendRequest = useCallback(async (userId: string) => {
    try {
      // await dispatch(sendFriendRequest(userId)).unwrap();
      return await socialService.sendFriendRequest(userId);
    } catch (error: any) {
      console.error('Failed to send friend request:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Get friend requests
   */
  const getFriendRequests = useCallback(async (type: 'received' | 'sent' = 'received') => {
    try {
      // await dispatch(fetchFriendRequests(type)).unwrap();
      return await socialService.getFriendRequests(type);
    } catch (error: any) {
      console.error('Failed to get friend requests:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Accept friend request
   */
  const acceptFriendRequest = useCallback(async (requestId: string | number) => {
    try {
      // await dispatch(handleFriendRequest({ requestId, action: 'accept' })).unwrap();
      return await socialService.acceptFriendRequest(requestId);
    } catch (error: any) {
      console.error('Failed to accept friend request:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Reject friend request
   */
  const rejectFriendRequest = useCallback(async (requestId: string | number) => {
    try {
      // await dispatch(handleFriendRequest({ requestId, action: 'reject' })).unwrap();
      return await socialService.rejectFriendRequest(requestId);
    } catch (error: any) {
      console.error('Failed to reject friend request:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Remove friend
   */
  const removeFriend = useCallback(async (userId: string) => {
    try {
      return await socialService.removeFriend(userId);
    } catch (error: any) {
      console.error('Failed to remove friend:', error);
      throw error;
    }
  }, []);

  /**
   * Block user
   */
  const blockUser = useCallback(async (userId: string) => {
    try {
      return await socialService.blockUser(userId);
    } catch (error: any) {
      console.error('Failed to block user:', error);
      throw error;
    }
  }, []);

  /**
   * Unblock user
   */
  const unblockUser = useCallback(async (userId: string) => {
    try {
      return await socialService.unblockUser(userId);
    } catch (error: any) {
      console.error('Failed to unblock user:', error);
      throw error;
    }
  }, []);

  /**
   * Get blocked users
   */
  const getBlockedUsers = useCallback(async () => {
    try {
      return await socialService.getBlockedUsers();
    } catch (error: any) {
      console.error('Failed to get blocked users:', error);
      throw error;
    }
  }, []);

  return {
    friends,
    friendRequests,
    blockedUsers,
    loading,
    error,
    fetchFriends,
    sendFriendRequest,
    getFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    getBlockedUsers,
  };
};


