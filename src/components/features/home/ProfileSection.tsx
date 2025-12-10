import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';
import { UserAvatar, TierBadge, CrownCard } from '$components/common';
import { User } from '$types';
import { navigate } from '$helpers/navigationUtils';
import { useUser } from '$hooks/useUser';

interface ProfileSectionProps {
  user: User;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ user }) => {
  const handleProfilePress = () => {
    navigate('ProfileScreen', {});
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleProfilePress}
      activeOpacity={0.8}
    >
      <UserAvatar
        username={user.username}
        avatar={user.avatar}
        tier={user.tier}
        size={60}
        showTier={true}
      />
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.username}>{user.username}</Text>
          <TierBadge tier={user.tier} size="small" />
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.level}>Level {user.level}</Text>
          <Text style={styles.country}>{user.country}</Text>
        </View>
        <CrownCard crowns={user.crowns} size="small" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.cardBackground + '80',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
    marginHorizontal: 15,
    marginTop: 70,
    marginBottom: 10,
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
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginRight: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  level: {
    color: COLORS.gold,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    marginRight: 15,
  },
  country: {
    color: COLORS.lightText,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
  },
});

