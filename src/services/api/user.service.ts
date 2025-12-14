import { httpClient } from './httpClient';
import { API_ENDPOINTS } from '$config/api.config';
import { PaginationParams, PaginatedResponse } from '$types/api.types';

/**
 * User Service
 * Handles all user-related API calls
 */

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  crowns: number;
  gems: number;
  level: number;
  experience: number;
  tier: string;
  country?: string;
  countryCode?: string;
  isGuest: boolean;
  isOnline: boolean;
  createdAt: string;
}

export interface UpdateProfileRequest {
  username?: string;
  avatar?: string;
  signature?: string;
  country?: string;
  countryCode?: string;
}

export interface UserSettings {
  soundEnabled: boolean;
  soundVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  friendRequestNotifications: boolean;
  giftNotifications: boolean;
  gameInviteNotifications: boolean;
  clubNotifications: boolean;
  profileVisibility: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  allowFriendRequests: boolean;
  allowGameInvites: boolean;
  language: string;
  theme: 'light' | 'dark';
}

export interface PlayerLevelInfo {
  level: number;
  currentExperience: number;
  experienceRequired: number;
  progress: number;
  crownsReward: number;
  gemsReward: number;
}

export interface AddExperienceRequest {
  gameId?: string;
  experienceEarned: number;
  reason?: string;
  multiplier?: number;
}

export interface SearchUsersParams extends PaginationParams {
  q: string;
}

class UserService {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    return httpClient.get<UserProfile>(API_ENDPOINTS.USER.GET_CURRENT);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserProfile> {
    return httpClient.get<UserProfile>(API_ENDPOINTS.USER.GET_BY_ID(userId));
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return httpClient.patch<UserProfile>(API_ENDPOINTS.USER.UPDATE_PROFILE, data);
  }

  /**
   * Update user settings
   */
  async updateSettings(settings: Partial<UserSettings>): Promise<{ message: string }> {
    return httpClient.patch(API_ENDPOINTS.USER.UPDATE_SETTINGS, settings);
  }

  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings> {
    return httpClient.get<UserSettings>(API_ENDPOINTS.USER.UPDATE_SETTINGS);
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: any): Promise<{ avatarUrl: string }> {
    return httpClient.upload<{ avatarUrl: string }>(
      API_ENDPOINTS.USER.UPLOAD_AVATAR,
      file
    );
  }

  /**
   * Get player level info
   */
  async getPlayerLevel(): Promise<PlayerLevelInfo> {
    return httpClient.get<PlayerLevelInfo>(API_ENDPOINTS.USER.GET_LEVEL);
  }

  /**
   * Add experience
   */
  async addExperience(data: AddExperienceRequest): Promise<{
    newExperience: number;
    leveledUp: boolean;
    newLevel: number | null;
  }> {
    return httpClient.post(API_ENDPOINTS.USER.ADD_EXPERIENCE, data);
  }

  /**
   * Search users
   */
  async searchUsers(params: SearchUsersParams): Promise<PaginatedResponse<UserProfile>> {
    return httpClient.get<PaginatedResponse<UserProfile>>(
      API_ENDPOINTS.USER.SEARCH,
      { params }
    );
  }
}

export const userService = new UserService();
export default userService;


