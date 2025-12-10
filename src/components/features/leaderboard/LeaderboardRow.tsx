import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { LeaderboardEntry } from '$types';
import { UserAvatar, TierBadge, CrownCard } from '$components/common';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
  onPress?: () => void;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  entry,
  rank,
  onPress,
}) => {
  const getRankColor = (rank: number): string[] => {
    if (rank === 1) return COLORS.gradientGold;
    if (rank === 2) return ['#C0C0C0', '#E8E8E8'];
    if (rank === 3) return ['#CD7F32', '#E6A85C'];
    return COLORS.gradientPurple;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getRankColor(rank)}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.content}>
          <View style={styles.rankContainer}>
            <Text style={styles.rankText}>#{rank}</Text>
          </View>
          <UserAvatar
            username={entry.username}
            avatar={entry.avatar}
            tier={entry.tier}
            size={50}
            showTier={true}
          />
          <View style={styles.infoContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.username} numberOfLines={1}>
                {entry.username}
              </Text>
              <TierBadge tier={entry.tier} size="small" />
            </View>
            <View style={styles.statsRow}>
              <CrownCard crowns={entry.crowns} size="small" />
              <Text style={styles.winRate}>
                {entry.stats.winRate.toFixed(1)}% WR
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  gradient: {
    padding: 2,
    borderRadius: 15,
  },
  content: {
    backgroundColor: COLORS.cardBackground + 'EE',
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    color: COLORS.gold,
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  infoContainer: {
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
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginRight: 10,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  winRate: {
    color: COLORS.lightText,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
    marginLeft: 10,
  },
});

