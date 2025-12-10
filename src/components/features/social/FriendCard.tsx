import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { User } from '$types';
import { UserAvatar, TierBadge, CrownCard } from '$components/common';
import { ChatBubbleLeftRightIcon, GiftIcon } from 'react-native-heroicons/solid';

interface FriendCardProps {
  friend: User;
  onChat?: () => void;
  onGift?: () => void;
  onProfile?: () => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({
  friend,
  onChat,
  onGift,
  onProfile,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onProfile}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={COLORS.gradientPurple}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <UserAvatar
            username={friend.username}
            avatar={friend.avatar}
            tier={friend.tier}
            size={60}
            showTier={true}
          />
          <View style={styles.infoContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.username}>{friend.username}</Text>
              <TierBadge tier={friend.tier} size="small" />
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.level}>Level {friend.level}</Text>
              <Text style={styles.country}>{friend.country}</Text>
            </View>
            <CrownCard crowns={friend.crowns} size="small" />
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onChat}
                activeOpacity={0.8}
              >
                <ChatBubbleLeftRightIcon size={20} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onGift}
                activeOpacity={0.8}
              >
                <GiftIcon size={20} color={COLORS.gold} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
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
    padding: 15,
    flexDirection: 'row',
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
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  level: {
    color: COLORS.gold,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
    marginRight: 15,
  },
  country: {
    color: COLORS.lightText,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: COLORS.darkPurpleBg + '80',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.goldBorder + '40',
  },
});

