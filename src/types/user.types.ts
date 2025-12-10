export type TierLevel = 'D' | 'DD' | 'C' | 'CC' | 'B' | 'BB' | 'A' | 'AA' | 'S' | 'SS' | 'SSS';

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  winStreak: number;
  totalCrownsEarned: number;
  teamWins?: number;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  crowns: number;
  tier: TierLevel;
  level: number;
  country: string;
  countryCode?: string;
  stats: UserStats;
  signature?: string;
  league?: string;
  playerId?: string;
  isOnline?: boolean;
  lastActive?: string;
}

export interface FriendRequest {
  id: string;
  from: User;
  to: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

