import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';
import Wrapper from '$components/Wrapper';
import TopNav from '$components/layout/TopNav';
import BottomNav from '$components/layout/BottomNav';
import { TabButton, PrimaryButton } from '$components/common';
import { FriendCard } from '$components/features/social/FriendCard';
import { User } from '$types';
import { navigate } from '$helpers/navigationUtils';
import { MagnifyingGlassIcon, UserPlusIcon } from 'react-native-heroicons/solid';
import { useSocial } from '$hooks/useSocial';
import { useEffect } from 'react';
import { userService } from '$services/api/user.service';

const FriendsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Friends' | 'Requests' | 'Find'>('Friends');
  const [searchQuery, setSearchQuery] = useState('');
  const { fetchFriends, getFriendRequests } = useSocial();
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const [findUsers, setFindUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'Friends') {
          const friendsList = await fetchFriends();
          // Map Friend[] to User[]
          const mappedFriends: User[] = friendsList.map((friend) => ({
            id: friend.userId,
            username: friend.username,
            avatar: friend.avatarUrl,
            crowns: 0, // Not in Friend interface
            tier: friend.tier as any,
            level: friend.level,
            country: '', // Not in Friend interface
            countryCode: undefined,
            stats: {
              gamesPlayed: 0,
              gamesWon: 0,
              winRate: 0,
              winStreak: 0,
              totalCrownsEarned: 0,
            },
            isOnline: friend.isOnline,
            lastActive: friend.lastSeenAt,
          }));
          setFriends(mappedFriends);
        } else if (activeTab === 'Requests') {
          const requests = await getFriendRequests('received');
          // Map FriendRequest[] to User[]
          const mappedRequests: User[] = requests.map((req) => ({
            id: req.userId,
            username: req.username,
            avatar: req.avatarUrl,
            crowns: 0, // Not in FriendRequest interface
            tier: 'D' as any,
            level: 0, // Not in FriendRequest interface
            country: '',
            countryCode: undefined,
            stats: {
              gamesPlayed: 0,
              gamesWon: 0,
              winRate: 0,
              winStreak: 0,
              totalCrownsEarned: 0,
            },
          }));
          setFriendRequests(mappedRequests);
        } else if (activeTab === 'Find') {
          // Search users - only search if query is provided
          if (searchQuery.trim()) {
            try {
              const searchResponse = await userService.searchUsers({ q: searchQuery, limit: 20 });
              // Map UserProfile[] to User[]
              const mappedUsers: User[] = (searchResponse.data || []).map((profile) => ({
                id: profile.id,
                username: profile.username,
                avatar: profile.avatarUrl || '',
                crowns: profile.crowns,
                tier: profile.tier as any,
                level: profile.level,
                country: profile.country || '',
                countryCode: profile.countryCode,
                stats: {
                  gamesPlayed: 0, // Not in UserProfile
                  gamesWon: 0,
                  winRate: 0,
                  winStreak: 0,
                  totalCrownsEarned: 0,
                },
                isOnline: profile.isOnline,
              }));
              setFindUsers(mappedUsers);
            } catch (error) {
              console.error('Failed to search users:', error);
              setFindUsers([]);
            }
          } else {
            setFindUsers([]);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab, searchQuery, fetchFriends, getFriendRequests]);

  const getCurrentData = (): User[] => {
    switch (activeTab) {
      case 'Friends':
        return friends;
      case 'Requests':
        return friendRequests;
      case 'Find':
        return findUsers;
      default:
        return [];
    }
  };

  const filteredData = getCurrentData().filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.country && user.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleChat = (friend: User) => {
    // Navigate to chat
    console.log('Chat with', friend.username);
  };

  const handleGift = (friend: User) => {
    navigate('GiftShopScreen', { recipientId: friend.id });
  };

  const handleProfile = (friend: User) => {
    navigate('ProfileScreen', { userId: friend.id });
  };

  const handleAddFriend = () => {
    // Navigate to add friend screen
    console.log('Add friend');
  };

  return (
    <Wrapper style={{ justifyContent: 'flex-start', paddingTop: 0 }}>
      <TopNav title="Friends" showBack={false} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MagnifyingGlassIcon size={20} color={COLORS.lightGrey} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search friends..."
              placeholderTextColor={COLORS.lightGrey}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabContainer}>
          <TabButton
            label="Friends"
            active={activeTab === 'Friends'}
            onPress={() => setActiveTab('Friends')}
          />
          <TabButton
            label="Requests"
            active={activeTab === 'Requests'}
            onPress={() => setActiveTab('Requests')}
          />
          <TabButton
            label="Find"
            active={activeTab === 'Find'}
            onPress={() => setActiveTab('Find')}
          />
        </View>

        {/* Friends List */}
        {filteredData.length > 0 ? (
          <View style={styles.friendsList}>
            {filteredData.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onChat={() => handleChat(friend)}
                onGift={() => handleGift(friend)}
                onProfile={() => handleProfile(friend)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {activeTab === 'Friends'
                ? 'No friends yet'
                : activeTab === 'Requests'
                ? 'No friend requests'
                : 'No users found'}
            </Text>
          </View>
        )}

        {/* Add Friend Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddFriend}
          activeOpacity={0.8}
        >
          <UserPlusIcon size={24} color={COLORS.white} />
          <Text style={styles.addButtonText}>Add Friend</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground + '80',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    marginLeft: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 15,
    justifyContent: 'center',
  },
  friendsList: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.lightText,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: COLORS.primaryPurple + '80',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default FriendsScreen;

