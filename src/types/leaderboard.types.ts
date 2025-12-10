import { User } from './user.types';

export interface LeaderboardEntry extends User {
  rank: number;
  change?: number; // rank change from previous period
}

export interface Leaderboard {
  type: 'global' | 'regional' | 'friends' | 'clubs';
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  entries: LeaderboardEntry[];
  lastUpdated: string;
}

export interface CrownKing {
  userId: string;
  username: string;
  avatar: string;
  crowns: number;
  tier: string;
  wins?: number;
  winRate?: number;
  type: 'crown' | 'win';
  period: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
}

