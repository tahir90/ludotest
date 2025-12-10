import { User } from './user.types';

export interface Club {
  id: string;
  name: string;
  avatar: string;
  description: string;
  owner: string;
  ownerUsername?: string;
  memberCount: number;
  maxMembers: number;
  totalCrowns: number;
  level: number;
  privacy: 'public' | 'private' | 'invite-only';
  rules?: string;
  language?: string;
  createdAt?: string;
  giftingThreshold?: number;
  currentThreshold?: number;
}

export interface ClubMember {
  userId: string;
  username: string;
  avatar: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joinedAt: string;
  crownsContributed?: number;
}

export interface MicSlot {
  id: number;
  userId?: string;
  user?: User;
  active: boolean;
  locked: boolean;
  speaking?: boolean;
}

export interface ClubMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  message: string;
  timestamp: string;
  type?: 'text' | 'gift' | 'system' | 'announcement';
  giftId?: string;
}

