import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { User } from '$types';
import { UserAvatar, TierBadge } from '$components/common';
import { CheckIcon } from 'react-native-heroicons/solid';

interface PlayerSlotProps {
  player?: User;
  ready: boolean;
  isHost: boolean;
  slotNumber: number;
  onPress?: () => void;
}

export const PlayerSlot: React.FC<PlayerSlotProps> = ({
  player,
  ready,
  isHost,
  slotNumber,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!player}
    >
      <LinearGradient
        colors={player ? COLORS.gradientPurple : [COLORS.darkGrey + '80', COLORS.grey + '80']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {player ? (
            <>
              <UserAvatar
                username={player.username}
                avatar={player.avatar}
                tier={player.tier}
                size={60}
                showTier={true}
              />
              <Text style={styles.username} numberOfLines={1}>
                {player.username}
              </Text>
              {isHost && (
                <View style={styles.hostBadge}>
                  <Text style={styles.crownIcon}>👑</Text>
                  <Text style={styles.hostText}>Host</Text>
                </View>
              )}
              {ready && (
                <View style={styles.readyBadge}>
                  <CheckIcon size={16} color={COLORS.success} />
                  <Text style={styles.readyText}>Ready</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptySlot}>
              <Text style={styles.emptyText}>Slot {slotNumber}</Text>
              <Text style={styles.emptySubtext}>Waiting...</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
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
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
  },
  username: {
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold + '40',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 5,
  },
  hostText: {
    color: COLORS.gold,
    fontSize: RFValue(10),
    fontFamily: 'Philosopher-Bold',
    marginLeft: 4,
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '40',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 5,
  },
  readyText: {
    color: COLORS.success,
    fontSize: RFValue(10),
    fontFamily: 'Philosopher-Bold',
    marginLeft: 4,
  },
  crownIcon: {
    fontSize: RFValue(14),
  },
  emptySlot: {
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.lightGrey,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
    marginBottom: 5,
  },
  emptySubtext: {
    color: COLORS.lightGrey + '80',
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
  },
});

