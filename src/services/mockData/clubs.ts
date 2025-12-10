import { Club, ClubMember, MicSlot, ClubMessage } from '$types';

export const mockClubs: Club[] = [
  {
    id: 'club_1',
    name: 'AAO NAAA',
    avatar: 'https://i.pravatar.cc/150?img=60',
    description: 'Hey buddy, welcome aboard! Respect each other & make new friends.',
    owner: 'user_owner_1',
    ownerUsername: 'KING',
    memberCount: 45,
    maxMembers: 50,
    totalCrowns: 500000,
    level: 5,
    privacy: 'public',
    rules: 'Respect each other & make new friends',
    language: 'English',
    giftingThreshold: 15000,
    currentThreshold: 8500
  },
  {
    id: 'club_2',
    name: 'Elite Players',
    avatar: 'https://i.pravatar.cc/150?img=61',
    description: 'Join the elite! Top players only.',
    owner: 'user_owner_2',
    ownerUsername: 'EliteMaster',
    memberCount: 200,
    maxMembers: 200,
    totalCrowns: 2000000,
    level: 10,
    privacy: 'private',
    rules: 'Must be tier A or above',
    language: 'English',
    giftingThreshold: 50000,
    currentThreshold: 35000
  },
  {
    id: 'club_3',
    name: 'Crown Hunters',
    avatar: 'https://i.pravatar.cc/150?img=62',
    description: 'Hunt for crowns together!',
    owner: 'user_owner_3',
    ownerUsername: 'Hunter',
    memberCount: 120,
    maxMembers: 200,
    totalCrowns: 800000,
    level: 7,
    privacy: 'public',
    rules: 'Active players only',
    language: 'English',
    giftingThreshold: 25000,
    currentThreshold: 12000
  }
];

export const mockMyClub: Club = mockClubs[0];

export const mockClubMembers: ClubMember[] = [
  {
    userId: 'user_owner_1',
    username: 'KING',
    avatar: 'https://i.pravatar.cc/150?img=10',
    role: 'owner',
    joinedAt: '2024-01-01T00:00:00Z',
    crownsContributed: 50000
  },
  {
    userId: 'user_123',
    username: 'THE_LUJU_777',
    avatar: 'https://i.pravatar.cc/150?img=5',
    role: 'member',
    joinedAt: '2024-01-15T00:00:00Z',
    crownsContributed: 10000
  }
];

export const mockMicSlots: MicSlot[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  active: false,
  locked: true
}));

export const mockClubMessages: ClubMessage[] = [
  {
    id: 'msg_1',
    userId: 'system',
    username: 'System',
    avatar: 'system',
    message: 'Hey buddy, welcome aboard! Respect each other & make new friends. ✨🎉',
    timestamp: new Date().toISOString(),
    type: 'announcement'
  },
  {
    id: 'msg_2',
    userId: 'user_123',
    username: 'THE_LUJU_777',
    avatar: 'https://i.pravatar.cc/150?img=5',
    message: 'Hello everyone!',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    type: 'text'
  }
];

