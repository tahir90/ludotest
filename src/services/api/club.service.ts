import { httpClient } from './httpClient';
import { API_ENDPOINTS } from '$config/api.config';
import { PaginationParams, PaginatedResponse } from '$types/api.types';

/**
 * Club Service
 * Handles all club-related API calls
 */

export interface Club {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  privacy: 'public' | 'private';
  language?: string;
  level: number;
  memberCount: number;
  maxMembers: number;
  owner: {
    id: string;
    username: string;
    avatarUrl: string;
  };
}

export interface CreateClubRequest {
  name: string;
  description?: string;
  rules?: string;
  privacy: 'public' | 'private';
  language?: string;
  avatar?: string;
}

export interface ClubDetails extends Club {
  rules?: string;
  experience: number;
  giftingThreshold: {
    current: number;
    target: number;
    level: string;
    progress: number;
  };
  isMember: boolean;
  memberRole?: 'owner' | 'admin' | 'member';
  joinedAt?: string;
}

export interface ClubMember {
  userId: string;
  username: string;
  avatarUrl: string;
  role: 'owner' | 'admin' | 'member';
  level: number;
  tier: string;
  joinedAt: string;
  contribution: number;
}

export interface ClubMessage {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  message: string;
  type: 'text' | 'gift' | 'system';
  timestamp: string;
}

export interface ClubEvent {
  eventId: string;
  title: string;
  description: string;
  goalType: string;
  goalTarget: number;
  currentProgress: number;
  status: 'active' | 'upcoming' | 'completed';
  startsAt: string;
  endsAt: string;
  rewards: {
    clubExperience: number;
    memberCrownsBonus: number;
  };
}

export interface ClubLevelInfo {
  level: number;
  experience: number;
  experienceRequired: number;
  progress: number;
  nextLevelRewards: {
    maxMembers: number;
    features: string[];
  };
}

export interface GetClubsParams extends PaginationParams {
  search?: string;
  language?: string;
  privacy?: 'public' | 'private' | 'all';
  minLevel?: number;
}

export interface JoinClubRequest {
  password?: string;
}

class ClubService {
  /**
   * Get all clubs
   */
  async getAllClubs(params?: GetClubsParams): Promise<PaginatedResponse<Club>> {
    const response = await httpClient.get<{
      clubs?: Club[];
      data?: Club[];
      pagination?: any;
    }>(API_ENDPOINTS.CLUB.GET_ALL, { params });
    
    // httpClient returns response.data.data, so response is already the data object
    // Handle both possible response structures
    const clubs = response.clubs || response.data || [];
    const pagination = response.pagination || { hasMore: false, limit: 20 };
    
    return {
      data: clubs,
      pagination,
    };
  }

  /**
   * Create club
   */
  async createClub(data: CreateClubRequest): Promise<Club> {
    return httpClient.post<Club>(API_ENDPOINTS.CLUB.CREATE, data);
  }

  /**
   * Get club details
   */
  async getClubDetails(clubId: string): Promise<ClubDetails> {
    return httpClient.get<ClubDetails>(API_ENDPOINTS.CLUB.GET_DETAILS(clubId));
  }

  /**
   * Join club
   */
  async joinClub(clubId: string, data?: JoinClubRequest): Promise<{
    message: string;
    clubId: string;
    role: string;
  }> {
    return httpClient.post(API_ENDPOINTS.CLUB.JOIN(clubId), data || {});
  }

  /**
   * Leave club
   */
  async leaveClub(clubId: string): Promise<{ message: string }> {
    return httpClient.post(API_ENDPOINTS.CLUB.LEAVE(clubId));
  }

  /**
   * Get club members
   */
  async getClubMembers(clubId: string, params?: PaginationParams & { role?: string }): Promise<PaginatedResponse<ClubMember>> {
    const response = await httpClient.get<{
      members?: ClubMember[];
      data?: ClubMember[];
      pagination?: any;
    }>(API_ENDPOINTS.CLUB.GET_MEMBERS(clubId), { params });
    
    const members = response.members || response.data || [];
    const pagination = response.pagination || { hasMore: false, limit: 20 };
    
    return {
      data: members,
      pagination,
    };
  }

  /**
   * Kick member
   */
  async kickMember(clubId: string, userId: string): Promise<{ message: string }> {
    return httpClient.post(API_ENDPOINTS.CLUB.KICK_MEMBER(clubId, userId));
  }

  /**
   * Change member role
   */
  async changeRole(clubId: string, userId: string, role: 'admin' | 'member'): Promise<{ message: string }> {
    return httpClient.patch(API_ENDPOINTS.CLUB.CHANGE_ROLE(clubId, userId), { role });
  }

  /**
   * Get club messages
   */
  async getClubMessages(clubId: string, params?: { before?: string; limit?: number }): Promise<ClubMessage[]> {
    const response = await httpClient.get<{ messages?: ClubMessage[]; data?: ClubMessage[] }>(
      API_ENDPOINTS.CLUB.GET_MESSAGES(clubId),
      { params }
    );
    return response.messages || response.data || [];
  }

  /**
   * Send club message
   */
  async sendClubMessage(clubId: string, message: string, type: 'text' | 'gift' = 'text'): Promise<ClubMessage> {
    const response = await httpClient.post<{ id: string; message: string; timestamp: string }>(
      API_ENDPOINTS.CLUB.SEND_MESSAGE(clubId),
      { message, type }
    );
    return response as any;
  }

  /**
   * Get club events
   */
  async getClubEvents(clubId: string, status?: 'active' | 'upcoming' | 'completed'): Promise<ClubEvent[]> {
    const response = await httpClient.get<{ events?: ClubEvent[]; data?: ClubEvent[] }>(
      API_ENDPOINTS.CLUB.GET_EVENTS(clubId),
      { params: status ? { status } : undefined }
    );
    return response.events || response.data || [];
  }

  /**
   * Get club level info
   */
  async getClubLevel(clubId: string): Promise<ClubLevelInfo> {
    return httpClient.get<ClubLevelInfo>(API_ENDPOINTS.CLUB.GET_LEVEL(clubId));
  }
}

export const clubService = new ClubService();
export default clubService;


