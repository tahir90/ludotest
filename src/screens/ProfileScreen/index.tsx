import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';
import Wrapper from '$components/Wrapper';
import TopNav from '$components/layout/TopNav';
import BottomNav from '$components/layout/BottomNav';
import { UserAvatar, TierBadge, CrownCard, TabButton } from '$components/common';
import { StatCard } from '$components/features/profile/StatCard';
import { useUser } from '$hooks/useUser';
import {
  HeartIcon,
  UserPlusIcon,
  ShareIcon,
  TrophyIcon,
  ClockIcon,
  ShieldCheckIcon,
  FireIcon,
  FlagIcon,
} from 'react-native-heroicons/solid';

const ProfileScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Highlights' | 'Info'>('Highlights');
  const { user } = useUser();
  
  if (!user) {
    return null;
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)} B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)} M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)} K`;
    }
    return num.toString();
  };

  return (
    <Wrapper style={{ justifyContent: 'flex-start', paddingTop: 0 }}>
      <TopNav title="Profile" showBack={true} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <UserAvatar
            username={user.username}
            avatar={user.avatar}
            tier={user.tier}
            size={100}
            showTier={true}
          />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.username}>{user.username}</Text>
              <Text style={styles.shield}>🛡️</Text>
              <Text style={styles.emoji}>😎</Text>
            </View>
            <View style={styles.countryRow}>
              <Text style={styles.flag}>{user.countryCode || '🏳️'}</Text>
              <Text style={styles.country}>{user.country}</Text>
              <Text style={styles.id}>ID: {user.playerId || user.id}</Text>
            </View>
            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <HeartIcon size={24} color={COLORS.error} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <UserPlusIcon size={24} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <ShareIcon size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabContainer}>
          <TabButton
            label="Highlights"
            active={activeTab === 'Highlights'}
            onPress={() => setActiveTab('Highlights')}
          />
          <TabButton
            label="Info"
            active={activeTab === 'Info'}
            onPress={() => setActiveTab('Info')}
          />
        </View>

        {activeTab === 'Highlights' && (
          <>
            {/* Achievements Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionArrow}>→</Text>
                <Text style={styles.sectionTitle}>Achievements</Text>
              </View>
              <View style={styles.achievementsGrid}>
                <View style={styles.achievementCard}>
                  <TrophyIcon size={40} color={COLORS.gold} />
                  <Text style={styles.achievementTitle}>Leaderboard</Text>
                </View>
                <View style={styles.achievementCard}>
                  <Text style={styles.achievementIcon}>⭐</Text>
                  <Text style={styles.achievementTitle}>Star Club</Text>
                </View>
              </View>
            </View>

            {/* Records Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionArrow}>→</Text>
                <Text style={styles.sectionTitle}>Records</Text>
              </View>
              <View style={styles.recordsGrid}>
                <StatCard
                  title="Weekly Top Club"
                  value="0 Times"
                  icon={<TrophyIcon size={30} color={COLORS.gold} />}
                  currentRank="#300+"
                />
                <StatCard
                  title="Highest Active Time"
                  value="0 Hours"
                  icon={<ClockIcon size={30} color={COLORS.gold} />}
                  currentRank="0hrs"
                />
                <StatCard
                  title="5 Star Club"
                  value="0 Times"
                  icon={<ShieldCheckIcon size={30} color={COLORS.gold} />}
                />
                <StatCard
                  title="Level 6 Phoenix"
                  value="0 Times"
                  icon={<FireIcon size={30} color={COLORS.gold} />}
                />
                <StatCard
                  title="Clash of Clubs Win"
                  value="0 Times"
                  icon={<FlagIcon size={30} color={COLORS.gold} />}
                />
              </View>
            </View>
          </>
        )}

        {activeTab === 'Info' && (
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Level</Text>
              <Text style={styles.infoValue}>{user.level}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Signature</Text>
              <Text style={styles.infoValue}>{user.signature || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total earning</Text>
              <Text style={styles.infoValue}>
                {formatNumber(user.stats.totalCrownsEarned)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current gold</Text>
              <Text style={styles.infoValue}>
                {user.crowns.toLocaleString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Player ID</Text>
              <Text style={styles.infoValue}>{user.playerId || user.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>League</Text>
              <Text style={styles.infoValue}>{user.league || 'Bronze'}</Text>
            </View>

            <TouchableOpacity style={styles.statsButton}>
              <Text style={styles.statsButtonText}>STATS</Text>
            </TouchableOpacity>

            <View style={styles.gameStatsSection}>
              <View style={styles.gameStatsRow}>
                <Text style={styles.gameStatsLabel}>Games won:</Text>
                <Text style={styles.gameStatsValue}>
                  {user.stats.gamesWon} of {user.stats.gamesPlayed}
                </Text>
              </View>
              <View style={styles.gameStatsRow}>
                <Text style={styles.gameStatsLabel}>Team wins:</Text>
                <Text style={styles.gameStatsValue}>
                  {user.stats.teamWins || 0}
                </Text>
              </View>
              <View style={styles.gameStatsRow}>
                <Text style={styles.gameStatsLabel}>Win Rate:</Text>
                <Text style={styles.gameStatsValue}>
                  {user.stats.winRate.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.gameStatsRow}>
                <Text style={styles.gameStatsLabel}>Win streak:</Text>
                <Text style={styles.gameStatsValue}>
                  {user.stats.winStreak}
                </Text>
              </View>
            </View>
          </View>
        )}
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
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: COLORS.cardBackground + '80',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  username: {
    color: COLORS.white,
    fontSize: RFValue(20),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginRight: 10,
  },
  shield: {
    fontSize: RFValue(18),
    marginRight: 5,
  },
  emoji: {
    fontSize: RFValue(18),
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  flag: {
    fontSize: RFValue(14),
    marginRight: 5,
  },
  country: {
    color: COLORS.white,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
    marginRight: 10,
  },
  id: {
    color: COLORS.lightText,
    fontSize: RFValue(10),
    fontFamily: 'Philosopher-Bold',
  },
  socialButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.darkPurpleBg + '80',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.goldBorder + '40',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 15,
    justifyContent: 'center',
  },
  section: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionArrow: {
    color: COLORS.gold,
    fontSize: RFValue(20),
    marginRight: 10,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  achievementsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    padding: 20,
    backgroundColor: COLORS.cardBackground + '80',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  achievementIcon: {
    fontSize: RFValue(40),
    marginBottom: 10,
  },
  achievementTitle: {
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    textAlign: 'center',
  },
  recordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoSection: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.goldBorder + '20',
  },
  infoLabel: {
    color: COLORS.lightText,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
  },
  infoValue: {
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  statsButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: COLORS.primaryPurple + '80',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
    alignItems: 'center',
  },
  statsButtonText: {
    color: COLORS.white,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  gameStatsSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: COLORS.cardBackground + '80',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
  },
  gameStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  gameStatsLabel: {
    color: COLORS.lightText,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
  },
  gameStatsValue: {
    color: COLORS.gold,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;

