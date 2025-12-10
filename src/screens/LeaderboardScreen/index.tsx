import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';
import Wrapper from '$components/Wrapper';
import TopNav from '$components/layout/TopNav';
import BottomNav from '$components/layout/BottomNav';
import { TabButton } from '$components/common';
import { LeaderboardRow } from '$components/features/leaderboard/LeaderboardRow';
import { Top3Showcase } from '$components/features/leaderboard/Top3Showcase';
import {
  mockGlobalLeaderboard,
  mockRegionalLeaderboard,
} from '$services/mockData';
import { LeaderboardEntry } from '$types';
import { navigate } from '$helpers/navigationUtils';

const LeaderboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'Global' | 'Regional' | 'Friends' | 'Clubs'
  >('Global');

  const getCurrentLeaderboard = (): LeaderboardEntry[] => {
    switch (activeTab) {
      case 'Global':
        return mockGlobalLeaderboard.entries;
      case 'Regional':
        return mockRegionalLeaderboard.entries;
      case 'Friends':
        return mockGlobalLeaderboard.entries.slice(0, 20);
      case 'Clubs':
        return [];
      default:
        return [];
    }
  };

  const entries = getCurrentLeaderboard();
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const handleEntryPress = (entry: LeaderboardEntry) => {
    navigate('ProfileScreen', { userId: entry.id });
  };

  return (
    <Wrapper style={{ justifyContent: 'flex-start', paddingTop: 0 }}>
      <TopNav title="Leaderboard" showBack={true} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Bar */}
        <View style={styles.tabContainer}>
          <TabButton
            label="Global"
            active={activeTab === 'Global'}
            onPress={() => setActiveTab('Global')}
          />
          <TabButton
            label="Regional"
            active={activeTab === 'Regional'}
            onPress={() => setActiveTab('Regional')}
          />
          <TabButton
            label="Friends"
            active={activeTab === 'Friends'}
            onPress={() => setActiveTab('Friends')}
          />
          <TabButton
            label="Clubs"
            active={activeTab === 'Clubs'}
            onPress={() => setActiveTab('Clubs')}
          />
        </View>

        {/* Top 3 Showcase (only for Global) */}
        {activeTab === 'Global' && top3.length >= 3 && (
          <Top3Showcase
            first={top3[0]}
            second={top3[1]}
            third={top3[2]}
            onPress={handleEntryPress}
          />
        )}

        {/* Rest of Leaderboard */}
        <View style={styles.listContainer}>
          {rest.length > 0 ? (
            rest.map((entry, index) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                rank={index + 4}
                onPress={() => handleEntryPress(entry)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No entries found</Text>
            </View>
          )}
        </View>
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 15,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  listContainer: {
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
});

export default LeaderboardScreen;

