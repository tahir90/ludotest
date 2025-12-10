import { Leaderboard, CrownKing } from '$types';
import { mockLeaderboard } from './users';

export const mockGlobalLeaderboard: Leaderboard = {
  type: 'global',
  period: 'all-time',
  entries: mockLeaderboard,
  lastUpdated: new Date().toISOString()
};

export const mockRegionalLeaderboard: Leaderboard = {
  type: 'regional',
  period: 'weekly',
  entries: mockLeaderboard.slice(0, 50),
  lastUpdated: new Date().toISOString()
};

export const mockCrownKing: CrownKing = {
  userId: 'user_1',
  username: 'CrownKing2024',
  avatar: 'https://i.pravatar.cc/150?img=10',
  crowns: 2500000,
  tier: 'SS',
  wins: 35000,
  winRate: 70,
  type: 'crown',
  period: 'weekly',
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date().toISOString()
};

export const mockWinKing: CrownKing = {
  userId: 'user_2',
  username: 'LudoMaster',
  avatar: 'https://i.pravatar.cc/150?img=9',
  crowns: 1800000,
  tier: 'S',
  wins: 40000,
  winRate: 75,
  type: 'win',
  period: 'weekly',
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date().toISOString()
};

