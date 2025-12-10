import { User, LeaderboardEntry } from '$types';

export const mockCurrentUser: User = {
  id: 'user_123',
  username: 'THE_LUJU_777',
  avatar: 'https://i.pravatar.cc/150?img=1',
  crowns: 4230650,
  tier: 'C',
  level: 22,
  country: 'Pakistan',
  countryCode: 'PK',
  stats: {
    gamesPlayed: 6087,
    gamesWon: 2459,
    winRate: 40.4,
    winStreak: 1,
    totalCrownsEarned: 45100000000,
    teamWins: 509
  },
  signature: 'PROFESSIONAL - III',
  league: 'Bronze',
  playerId: 'AZUU8415',
  isOnline: true
};

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: 'user_1',
    username: 'CrownKing2024',
    avatar: 'https://i.pravatar.cc/150?img=10',
    crowns: 2500000,
    tier: 'SS',
    level: 150,
    country: 'USA',
    countryCode: 'US',
    rank: 1,
    stats: {
      gamesPlayed: 50000,
      gamesWon: 35000,
      winRate: 70,
      winStreak: 15,
      totalCrownsEarned: 5000000000
    },
    isOnline: true
  },
  {
    id: 'user_2',
    username: 'LudoMaster',
    avatar: 'https://i.pravatar.cc/150?img=9',
    crowns: 1800000,
    tier: 'S',
    level: 120,
    country: 'India',
    countryCode: 'IN',
    rank: 2,
    stats: {
      gamesPlayed: 40000,
      gamesWon: 28000,
      winRate: 70,
      winStreak: 12,
      totalCrownsEarned: 3800000000
    },
    isOnline: true
  },
  {
    id: 'user_3',
    username: 'DiceRoller',
    avatar: 'https://i.pravatar.cc/150?img=8',
    crowns: 1500000,
    tier: 'S',
    level: 100,
    country: 'UK',
    countryCode: 'GB',
    rank: 3,
    stats: {
      gamesPlayed: 35000,
      gamesWon: 24000,
      winRate: 68.5,
      winStreak: 10,
      totalCrownsEarned: 3000000000
    },
    isOnline: false
  }
];

// Generate more mock users for top 100
for (let i = 4; i <= 100; i++) {
  const tiers: Array<'D' | 'DD' | 'C' | 'CC' | 'B' | 'BB' | 'A' | 'AA' | 'S' | 'SS' | 'SSS'> = 
    ['D', 'DD', 'C', 'CC', 'B', 'BB', 'A', 'AA', 'S', 'SS', 'SSS'];
  const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
  const baseCrowns = 1000000 - (i * 5000);
  
  mockLeaderboard.push({
    id: `user_${i}`,
    username: `Player${i}`,
    avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
    crowns: Math.max(baseCrowns, 10000),
    tier: randomTier,
    level: Math.floor(Math.random() * 100) + 1,
    country: 'Unknown',
    countryCode: 'XX',
    rank: i,
    stats: {
      gamesPlayed: Math.floor(Math.random() * 30000) + 1000,
      gamesWon: Math.floor(Math.random() * 20000) + 500,
      winRate: Math.random() * 30 + 40,
      winStreak: Math.floor(Math.random() * 10),
      totalCrownsEarned: baseCrowns * 1000
    },
    isOnline: Math.random() > 0.5
  });
}

