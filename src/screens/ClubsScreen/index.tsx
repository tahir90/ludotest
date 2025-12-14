import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';
import Wrapper from '$components/Wrapper';
import TopNav from '$components/layout/TopNav';
import BottomNav from '$components/layout/BottomNav';
import { TabButton, PrimaryButton } from '$components/common';
import { ClubListItem } from '$components/features/clubs/ClubListItem';
import { Club } from '$types';
import { navigate } from '$helpers/navigationUtils';
import { MagnifyingGlassIcon, PlusIcon } from 'react-native-heroicons/solid';
import { useClubs } from '$hooks/useClubs';
import { clubService, Club as ApiClub } from '$services/api/club.service';
import { useEffect } from 'react';

const ClubsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'My Club' | 'Discover' | 'Top Clubs'>('My Club');
  const [searchQuery, setSearchQuery] = useState('');
  const { myClub, clubs, setLoading } = useClubs();
  const [discoverClubs, setDiscoverClubs] = useState<Club[]>([]);
  const [topClubs, setTopClubs] = useState<Club[]>([]);
  const [loading, setLoadingState] = useState(false);

  // Load clubs based on active tab
  useEffect(() => {
    const loadClubs = async () => {
      setLoadingState(true);
      try {
        if (activeTab === 'Discover') {
          const response = await clubService.getAllClubs({
            search: searchQuery || undefined,
            privacy: 'public',
            limit: 50,
          });
          // Map ApiClub[] to Club[]
          const mappedClubs: Club[] = response.data.map((club) => {
            // If it's ClubDetails, extract threshold info
            const details = club as any;
            return {
              id: club.id,
              name: club.name,
              avatar: club.avatarUrl || '',
              description: club.description || '',
              owner: club.owner.id,
              ownerUsername: club.owner.username,
              memberCount: club.memberCount,
              maxMembers: club.maxMembers,
              totalCrowns: 0, // Not in API response - see API_GAPS.md
              level: club.level,
              privacy: club.privacy,
              language: club.language,
              giftingThreshold: details.giftingThreshold?.target || 0, // Not in base Club response - see API_GAPS.md
              currentThreshold: details.giftingThreshold?.current || 0, // Not in base Club response - see API_GAPS.md
            };
          });
          setDiscoverClubs(mappedClubs);
        } else if (activeTab === 'Top Clubs') {
          const response = await clubService.getAllClubs({
            limit: 50,
          });
          // Map and sort by totalCrowns (will be 0 until API provides it)
          const mappedClubs: Club[] = response.data.map((club) => ({
            id: club.id,
            name: club.name,
            avatar: club.avatarUrl || '',
            description: club.description || '',
            owner: club.owner.id,
            ownerUsername: club.owner.username,
            memberCount: club.memberCount,
            maxMembers: club.maxMembers,
            totalCrowns: 0, // Not in API response - see API_GAPS.md
            level: club.level,
            privacy: club.privacy,
            language: club.language,
            giftingThreshold: 0,
            currentThreshold: 0,
          }));
          // Sort by level (since totalCrowns is not available)
          setTopClubs(mappedClubs.sort((a, b) => b.level - a.level));
        }
      } catch (error) {
        console.error('Failed to load clubs:', error);
      } finally {
        setLoadingState(false);
      }
    };

    if (activeTab !== 'My Club') {
      loadClubs();
    }
  }, [activeTab, searchQuery]);

  const handleClubPress = (club: Club) => {
    navigate('ClubRoomScreen', { clubId: club.id });
  };

  const handleCreateClub = () => {
    navigate('CreateClubScreen', {});
  };

  const filteredClubs = activeTab === 'Discover' 
    ? discoverClubs.filter(
        (club) =>
          club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          club.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Map myClub from Redux to Club type if needed
  const mappedMyClub: Club | null = myClub ? {
    id: myClub.id,
    name: myClub.name,
    avatar: myClub.avatar,
    description: myClub.description,
    owner: myClub.owner,
    ownerUsername: myClub.ownerUsername,
    memberCount: myClub.memberCount,
    maxMembers: myClub.maxMembers,
    totalCrowns: myClub.totalCrowns,
    level: myClub.level,
    privacy: myClub.privacy,
    rules: myClub.rules,
    language: myClub.language,
    giftingThreshold: myClub.giftingThreshold,
    currentThreshold: myClub.currentThreshold,
  } : null;

  return (
    <Wrapper style={{ justifyContent: 'flex-start', paddingTop: 0 }}>
      <TopNav title="Clubs" showBack={false} />
      
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
              placeholder="Search clubs..."
              placeholderTextColor={COLORS.lightGrey}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabContainer}>
          <TabButton
            label="My Club"
            active={activeTab === 'My Club'}
            onPress={() => setActiveTab('My Club')}
          />
          <TabButton
            label="Discover"
            active={activeTab === 'Discover'}
            onPress={() => setActiveTab('Discover')}
          />
          <TabButton
            label="Top Clubs"
            active={activeTab === 'Top Clubs'}
            onPress={() => setActiveTab('Top Clubs')}
          />
        </View>

        {/* Content */}
        {activeTab === 'My Club' && (
          <View style={styles.myClubContainer}>
            {mappedMyClub ? (
              <>
                <ClubListItem
                  club={mappedMyClub}
                  onPress={() => handleClubPress(mappedMyClub)}
                />
                <PrimaryButton
                  title="Enter Club"
                  onPress={() => handleClubPress(mappedMyClub)}
                  style={styles.enterButton}
                />
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>You're not in any club yet</Text>
                <PrimaryButton
                  title="Create Club"
                  onPress={handleCreateClub}
                  style={styles.enterButton}
                />
              </View>
            )}
          </View>
        )}

        {activeTab === 'Discover' && (
          <View style={styles.clubsList}>
            {loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Loading clubs...</Text>
              </View>
            ) : filteredClubs.length > 0 ? (
              filteredClubs.map((club) => (
                <ClubListItem
                  key={club.id}
                  club={club}
                  onPress={() => handleClubPress(club)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No clubs found</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'Top Clubs' && (
          <View style={styles.clubsList}>
            {loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Loading top clubs...</Text>
              </View>
            ) : topClubs.length > 0 ? (
              topClubs.map((club, index) => (
                <View key={club.id} style={styles.rankedClub}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <ClubListItem
                    club={club}
                    onPress={() => handleClubPress(club)}
                  />
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No clubs found</Text>
              </View>
            )}
          </View>
        )}

        {/* Create Club Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateClub}
          activeOpacity={0.8}
        >
          <PlusIcon size={24} color={COLORS.white} />
          <Text style={styles.createButtonText}>Create Club</Text>
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
  myClubContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  enterButton: {
    marginTop: 15,
  },
  clubsList: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  rankedClub: {
    position: 'relative',
    marginBottom: 15,
  },
  rankBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: COLORS.gold,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  rankText: {
    color: COLORS.white,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
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
  createButton: {
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
  createButtonText: {
    color: COLORS.white,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ClubsScreen;

