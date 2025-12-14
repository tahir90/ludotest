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
import { LeaderboardEntry } from '$types';
import { navigate } from '$helpers/navigationUtils';
import { useLeaderboard } from '$hooks/useLeaderboard';
import { useEffect } from 'react';
import { leaderboardService } from '$services/api/leaderboard.service';

const LeaderboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'Global' | 'Regional' | 'Friends' | 'Clubs'
  >('Global');
  const { fetchLeaderboard } = useLeaderboard();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Load leaderboard based on active tab
  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        if (activeTab === 'Global') {
          const response = await leaderboardService.getGlobalLeaderboard({
            type: 'crown',
            timeframe: 'all_time',
            limit: 100,
          });
          // Map API response to LeaderboardEntry[]
          const mappedEntries: LeaderboardEntry[] = response.data.map((entry, index) => ({
            id: entry.userId,
            username: entry.username,
            avatar: entry.avatarUrl || '', // Map avatarUrl to avatar - see API_GAPS.md
            crowns: (entry as any).crowns || entry.score || 0, // API may use 'score' or 'crowns' - see API_GAPS.md
            tier: entry.tier as any,
            level: entry.level,
            country: '', // Not in API - see API_GAPS.md
            countryCode: undefined, // Not in API - see API_GAPS.md
            rank: entry.rank || index + 1, // rank may not be in API - see API_GAPS.md
            stats: { // Not in API - see API_GAPS.md
              gamesPlayed: 0,
              gamesWon: 0,
              winRate: 0,
              winStreak: 0,
              totalCrownsEarned: 0,
            },
            isOnline: false, // Not in API - see API_GAPS.md
          }));
          setEntries(mappedEntries);
        } else if (activeTab === 'Regional') {
          // Regional leaderboard endpoint not implemented - see API_GAPS.md
          console.warn('Regional leaderboard not implemented in API');
          setEntries([]);
        } else if (activeTab === 'Friends') {
          // Friends leaderboard endpoint not implemented - see API_GAPS.md
          console.warn('Friends leaderboard not implemented in API');
          setEntries([]);
        } else if (activeTab === 'Clubs') {
          // Clubs leaderboard endpoint not implemented - see API_GAPS.md
          console.warn('Clubs leaderboard not implemented in API');
          setEntries([]);
        }
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [activeTab]);

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
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Loading leaderboard...</Text>
            </View>
          ) : rest.length > 0 ? (
            rest.map((entry, index) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                rank={entry.rank || index + 4}
                onPress={() => handleEntryPress(entry)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {activeTab === 'Regional' || activeTab === 'Friends' || activeTab === 'Clubs'
                  ? 'This leaderboard is not yet available'
                  : 'No entries found'}
              </Text>
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

