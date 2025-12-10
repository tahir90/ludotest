import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';
import Wrapper from '$components/Wrapper';
import TopNav from '$components/layout/TopNav';
import BottomNav from '$components/layout/BottomNav';
import { TabButton, PrimaryButton } from '$components/common';
import { ClubListItem } from '$components/features/clubs/ClubListItem';
import { mockClubs, mockMyClub } from '$services/mockData';
import { Club } from '$types';
import { navigate } from '$helpers/navigationUtils';
import { MagnifyingGlassIcon, PlusIcon } from 'react-native-heroicons/solid';

const ClubsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'My Club' | 'Discover' | 'Top Clubs'>('My Club');
  const [searchQuery, setSearchQuery] = useState('');

  const handleClubPress = (club: Club) => {
    navigate('ClubRoomScreen', { clubId: club.id });
  };

  const handleCreateClub = () => {
    navigate('CreateClubScreen', {});
  };

  const filteredClubs = mockClubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {activeTab === 'My Club' && mockMyClub && (
          <View style={styles.myClubContainer}>
            <ClubListItem
              club={mockMyClub}
              onPress={() => handleClubPress(mockMyClub)}
            />
            <PrimaryButton
              title="Enter Club"
              onPress={() => handleClubPress(mockMyClub)}
              style={styles.enterButton}
            />
          </View>
        )}

        {activeTab === 'Discover' && (
          <View style={styles.clubsList}>
            {filteredClubs.length > 0 ? (
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
            {mockClubs
              .sort((a, b) => b.totalCrowns - a.totalCrowns)
              .map((club, index) => (
                <View key={club.id} style={styles.rankedClub}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <ClubListItem
                    club={club}
                    onPress={() => handleClubPress(club)}
                  />
                </View>
              ))}
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

