import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { LeaderboardEntry } from '$types';
import { UserAvatar, TierBadge, CrownCard } from '$components/common';

interface Top3ShowcaseProps {
  first: LeaderboardEntry;
  second: LeaderboardEntry;
  third: LeaderboardEntry;
  onPress?: (entry: LeaderboardEntry) => void;
}

export const Top3Showcase: React.FC<Top3ShowcaseProps> = ({
  first,
  second,
  third,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Second Place */}
      <View style={[styles.podium, styles.secondPlace]}>
        <View style={styles.podiumContent}>
          <Text style={styles.rankBadge}>2</Text>
          <UserAvatar
            username={second.username}
            avatar={second.avatar}
            tier={second.tier}
            size={70}
            showTier={true}
          />
          <Text style={styles.username} numberOfLines={1}>
            {second.username}
          </Text>
          <CrownCard crowns={second.crowns} size="small" />
        </View>
      </View>

      {/* First Place */}
      <View style={[styles.podium, styles.firstPlace]}>
        <View style={styles.podiumContent}>
          <View style={styles.crownContainer}>
            <Text style={styles.crownIcon}>👑</Text>
          </View>
          <Text style={styles.rankBadge}>1</Text>
          <UserAvatar
            username={first.username}
            avatar={first.avatar}
            tier={first.tier}
            size={90}
            showTier={true}
          />
          <Text style={styles.username} numberOfLines={1}>
            {first.username}
          </Text>
          <CrownCard crowns={first.crowns} size="medium" />
          <TierBadge tier={first.tier} size="medium" />
        </View>
      </View>

      {/* Third Place */}
      <View style={[styles.podium, styles.thirdPlace]}>
        <View style={styles.podiumContent}>
          <Text style={styles.rankBadge}>3</Text>
          <UserAvatar
            username={third.username}
            avatar={third.avatar}
            tier={third.tier}
            size={70}
            showTier={true}
          />
          <Text style={styles.username} numberOfLines={1}>
            {third.username}
          </Text>
          <CrownCard crowns={third.crowns} size="small" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 20,
    height: 250,
  },
  podium: {
    flex: 1,
    maxWidth: 120,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  firstPlace: {
    height: '100%',
    marginHorizontal: 5,
    zIndex: 10,
  },
  secondPlace: {
    height: '85%',
  },
  thirdPlace: {
    height: '75%',
  },
  podiumContent: {
    flex: 1,
    backgroundColor: COLORS.cardBackground + 'EE',
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 15,
  },
  crownContainer: {
    position: 'absolute',
    top: -20,
    zIndex: 20,
  },
  crownIcon: {
    fontSize: RFValue(40),
  },
  rankBadge: {
    color: COLORS.gold,
    fontSize: RFValue(24),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  username: {
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
});

