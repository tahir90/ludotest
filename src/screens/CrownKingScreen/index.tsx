import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import Wrapper from '$components/Wrapper';
import TopNav from '$components/layout/TopNav';
import BottomNav from '$components/layout/BottomNav';
import { TabButton, PrimaryButton } from '$components/common';
import { UserAvatar, TierBadge, CrownCard } from '$components/common';
import { CrownKing } from '$types';
import LottieView from 'lottie-react-native';
import { ANIMATATIONS } from '$assets/animation';
import { useLeaderboard } from '$hooks/useLeaderboard';
import { leaderboardService } from '$services/api/leaderboard.service';

const CrownKingScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Crown King' | 'Win King'>(
    'Crown King'
  );
  const [crownKing, setCrownKing] = useState<CrownKing | null>(null);
  const [winKing, setWinKing] = useState<CrownKing | null>(null);
  const [loading, setLoading] = useState(false);

  // Load crown king/queen data
  useEffect(() => {
    const loadCrownKingQueen = async () => {
      setLoading(true);
      try {
        const response = await leaderboardService.getCrownKingQueen();
        
        // Map API response to CrownKing
        const mappedCrownKing: CrownKing = {
          userId: response.crownKing.userId,
          username: response.crownKing.username,
          avatar: response.crownKing.avatarUrl || '', // Map avatarUrl to avatar
          crowns: response.crownKing.totalCrowns,
          tier: response.crownKing.tier,
          wins: 0, // Not in API - see API_GAPS.md
          winRate: 0, // Not in API - see API_GAPS.md
          type: 'crown',
          period: 'weekly', // Not in API - see API_GAPS.md
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Not in API
          endDate: new Date().toISOString(), // Not in API
        };
        
        const mappedWinKing: CrownKing = {
          userId: response.crownQueen.userId,
          username: response.crownQueen.username,
          avatar: response.crownQueen.avatarUrl || '',
          crowns: response.crownQueen.totalCrowns,
          tier: response.crownQueen.tier,
          wins: 0, // Not in API - see API_GAPS.md
          winRate: 0, // Not in API - see API_GAPS.md
          type: 'win',
          period: 'weekly',
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        };
        
        setCrownKing(mappedCrownKing);
        setWinKing(mappedWinKing);
      } catch (error) {
        console.error('Failed to load crown king/queen:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCrownKingQueen();
  }, []);

  const currentKing: CrownKing | null =
    activeTab === 'Crown King' ? crownKing : winKing;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toString();
  };

  return (
    <Wrapper style={{ justifyContent: 'flex-start', paddingTop: 0 }}>
      <TopNav title="Crown Royalty" showBack={true} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Bar */}
        <View style={styles.tabContainer}>
          <TabButton
            label="Crown King"
            active={activeTab === 'Crown King'}
            onPress={() => setActiveTab('Crown King')}
          />
          <TabButton
            label="Win King"
            active={activeTab === 'Win King'}
            onPress={() => setActiveTab('Win King')}
          />
        </View>

        {/* King/Queen Showcase */}
        <View style={styles.showcaseContainer}>
          <LinearGradient
            colors={COLORS.gradientGold}
            style={styles.showcaseGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.showcaseContent}>
              {/* Animated Crown */}
              <View style={styles.crownContainer}>
                <Text style={styles.crownIcon}>👑</Text>
              </View>

              {loading ? (
                <Text style={styles.loadingText}>Loading...</Text>
              ) : currentKing ? (
                <>
                  {/* Royal Avatar */}
                  <UserAvatar
                    username={currentKing.username}
                    avatar={currentKing.avatar}
                    tier={currentKing.tier as any}
                    size={120}
                    showTier={true}
                  />

                  {/* Royal Name */}
                  <Text style={styles.royalName}>{currentKing.username}</Text>
                  <Text style={styles.royalTitle}>
                    {activeTab === 'Crown King' ? 'Crown King' : 'Win King'}
                  </Text>

                  {/* Royal Stats */}
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>
                        {activeTab === 'Crown King' ? 'Crowns' : 'Wins'}
                      </Text>
                      <Text style={styles.statValue}>
                        {activeTab === 'Crown King'
                          ? formatNumber(currentKing.crowns)
                          : currentKing.wins?.toLocaleString() || '0'}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Tier</Text>
                      <TierBadge tier={currentKing.tier as any} size="large" />
                    </View>
                    {currentKing.winRate && currentKing.winRate > 0 && (
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Win Rate</Text>
                        <Text style={styles.statValue}>
                          {currentKing.winRate.toFixed(1)}%
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              ) : (
                <Text style={styles.loadingText}>No data available</Text>
              )}

              {/* Challenge Button */}
              <PrimaryButton
                title="Challenge the King"
                onPress={() => {}}
                style={styles.challengeButton}
                gradientColors={COLORS.gradientGold}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Runner Up Section */}
        <View style={styles.runnerUpSection}>
          <Text style={styles.runnerUpTitle}>Runner Ups</Text>
          <View style={styles.runnerUpCards}>
            <View style={styles.runnerUpCard}>
              <Text style={styles.runnerUpRank}>#2</Text>
              <UserAvatar
                username="LudoMaster"
                avatar="avatar_master"
                tier="S"
                size={60}
                showTier={true}
              />
              <Text style={styles.runnerUpName}>LudoMaster</Text>
              <CrownCard crowns={1800000} size="small" />
            </View>
            <View style={styles.runnerUpCard}>
              <Text style={styles.runnerUpRank}>#3</Text>
              <UserAvatar
                username="DiceRoller"
                avatar="avatar_dice"
                tier="S"
                size={60}
                showTier={true}
              />
              <Text style={styles.runnerUpName}>DiceRoller</Text>
              <CrownCard crowns={1500000} size="small" />
            </View>
          </View>
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
    marginBottom: 20,
    justifyContent: 'center',
  },
  showcaseContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  showcaseGradient: {
    padding: 3,
    borderRadius: 20,
  },
  showcaseContent: {
    backgroundColor: COLORS.cardBackground + 'EE',
    borderRadius: 17,
    borderWidth: 3,
    borderColor: COLORS.goldBorder,
    padding: 30,
    alignItems: 'center',
  },
  crownContainer: {
    marginBottom: 20,
  },
  crownIcon: {
    fontSize: RFValue(60),
  },
  royalName: {
    color: COLORS.white,
    fontSize: RFValue(28),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  royalTitle: {
    color: COLORS.gold,
    fontSize: RFValue(20),
    fontFamily: 'Philosopher-Bold',
    marginBottom: 20,
  },
  statsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.goldBorder + '40',
  },
  statLabel: {
    color: COLORS.lightText,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
  },
  statValue: {
    color: COLORS.gold,
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  challengeButton: {
    width: '100%',
    marginTop: 10,
  },
  runnerUpSection: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  runnerUpTitle: {
    color: COLORS.gold,
    fontSize: RFValue(20),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  runnerUpCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  runnerUpCard: {
    width: '48%',
    padding: 15,
    backgroundColor: COLORS.cardBackground + '80',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
    alignItems: 'center',
  },
  runnerUpRank: {
    color: COLORS.gold,
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  runnerUpName: {
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    marginTop: 10,
    marginBottom: 10,
  },
  loadingText: {
    color: COLORS.lightText,
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
    textAlign: 'center',
    padding: 40,
  },
});

export default CrownKingScreen;

