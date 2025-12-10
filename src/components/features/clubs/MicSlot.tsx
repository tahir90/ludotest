import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { MicSlot as MicSlotType } from '$types';
import { UserAvatar } from '$components/common';
import { MicrophoneIcon, LockClosedIcon } from 'react-native-heroicons/solid';

interface MicSlotProps {
  slot: MicSlotType;
  onPress?: () => void;
}

export const MicSlot: React.FC<MicSlotProps> = ({ slot, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={slot.locked}
    >
      <LinearGradient
        colors={
          slot.active
            ? COLORS.gradientGold
            : slot.locked
            ? [COLORS.darkGrey + '80', COLORS.grey + '80']
            : COLORS.gradientPurple
        }
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {slot.user ? (
            <>
              <UserAvatar
                username={slot.user.username}
                avatar={slot.user.avatar}
                tier={slot.user.tier}
                size={50}
                showTier={false}
              />
              {slot.speaking && (
                <View style={styles.speakingIndicator}>
                  <View style={styles.wave} />
                  <View style={[styles.wave, styles.waveDelay]} />
                  <View style={[styles.wave, styles.waveDelay2]} />
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptySlot}>
              {slot.locked ? (
                <LockClosedIcon size={24} color={COLORS.lightGrey} />
              ) : (
                <MicrophoneIcon size={24} color={COLORS.lightGrey} />
              )}
            </View>
          )}
          <Text style={styles.slotNumber}>{slot.id}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    margin: 5,
  },
  gradient: {
    flex: 1,
    padding: 2,
    borderRadius: 30,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.cardBackground + 'EE',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emptySlot: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotNumber: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    color: COLORS.white,
    fontSize: RFValue(10),
    fontFamily: 'Philosopher-Bold',
    backgroundColor: COLORS.darkPurpleBg + 'CC',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  speakingIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wave: {
    width: 3,
    height: 8,
    backgroundColor: COLORS.success,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  waveDelay: {
    animationDelay: '0.1s',
  },
  waveDelay2: {
    animationDelay: '0.2s',
  },
});

