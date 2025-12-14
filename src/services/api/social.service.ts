import { httpClient } from './httpClient';
import { API_ENDPOINTS } from '$config/api.config';
import { PaginationParams } from '$types/api.types';
import { User } from '$types';

/**
 * Social Service
 * Handles all social features (friends, blocking)
 */

export interface Friend {
  userId: string;
  username: string;
  avatarUrl: string;
  level: number;
  tier: string;
  isOnline: boolean;
  lastSeenAt: string;
  friendshipDate: string;
}

export interface FriendRequest {
  requestId: string | number;
  userId: string;
  username: string;
  avatarUrl: string;
  status: 'pending' | 'accepted' | 'rejected';
  sentAt: string;
}

export interface GetFriendRequestsParams {
  type: 'received' | 'sent';
}

export interface BlockedUser {
  userId: string;
  username: string;
  avatarUrl: string;
  blockedAt: string;
}

class SocialService {
  /**
   * Get friends list
   */
  async getFriendsList(status?: string): Promise<Friend[]> {
    const params = status ? { status } : undefined;
    const response = await httpClient.get<{ friends?: Friend[]; data?: Friend[] }>(
      API_ENDPOINTS.SOCIAL.GET_FRIENDS,
      { params }
    );
    return response.friends || response.data || [];
  }

  /**
   * Send friend request
   */
  async sendFriendRequest(userId: string): Promise<{ requestId: string | number; message: string }> {
    return httpClient.post(API_ENDPOINTS.SOCIAL.SEND_FRIEND_REQUEST, { userId });
  }

  /**
   * Get friend requests
   */
  async getFriendRequests(type: 'received' | 'sent'): Promise<FriendRequest[]> {
    const response = await httpClient.get<{ requests?: FriendRequest[]; data?: FriendRequest[] }>(
      API_ENDPOINTS.SOCIAL.GET_FRIEND_REQUESTS,
      { params: { type } }
    );
    return response.requests || response.data || [];
  }

  /**
   * Accept friend request
   */
  async acceptFriendRequest(requestId: string | number): Promise<{
    message: string;
    friendship: { userId: string; username: string };
  }> {
    return httpClient.post(API_ENDPOINTS.SOCIAL.ACCEPT_REQUEST(requestId));
  }

  /**
   * Reject friend request
   */
  async rejectFriendRequest(requestId: string | number): Promise<{ message: string }> {
    return httpClient.post(API_ENDPOINTS.SOCIAL.REJECT_REQUEST(requestId));
  }

  /**
   * Remove friend
   */
  async removeFriend(userId: string): Promise<{ message: string }> {
    return httpClient.delete(API_ENDPOINTS.SOCIAL.REMOVE_FRIEND(userId));
  }

  /**
   * Block user
   */
  async blockUser(userId: string): Promise<{ message: string }> {
    return httpClient.post(API_ENDPOINTS.SOCIAL.BLOCK_USER(userId));
  }

  /**
   * Unblock user
   */
  async unblockUser(userId: string): Promise<{ message: string }> {
    return httpClient.post(API_ENDPOINTS.SOCIAL.UNBLOCK_USER(userId));
  }

  /**
   * Get blocked users
   */
  async getBlockedUsers(): Promise<BlockedUser[]> {
    const response = await httpClient.get<{ blockedUsers?: BlockedUser[]; data?: BlockedUser[] }>(
      API_ENDPOINTS.SOCIAL.GET_BLOCKED
    );
    return response.blockedUsers || response.data || [];
  }
}

export const socialService = new SocialService();
export default socialService;


