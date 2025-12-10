import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';
import { ProgressBar, PrimaryButton } from '$components/common';
import { FireIcon } from 'react-native-heroicons/solid';

interface StreakSectionProps {
  currentStreak: number;
  targetStreak: number;
  timeRemaining?: string;
}

export const StreakSection: React.FC<StreakSectionProps> = ({
  currentStreak,
  targetStreak,
  timeRemaining = '2d 0h',
}) => {
  const progress = (currentStreak / targetStreak) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <FireIcon size={24} color={COLORS.gold} />
          <Text style={styles.title}>STREAK STARS</Text>
        </View>
        <Text style={styles.timer}>{timeRemaining}</Text>
      </View>
      <ProgressBar
        progress={progress}
        current={currentStreak}
        total={targetStreak}
        showLabel={true}
        height={25}
      />
      <PrimaryButton
        title="Play to Streak Up"
        onPress={() => {}}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: COLORS.cardBackground + '80',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
    marginHorizontal: 15,
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  timer: {
    color: COLORS.gold,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
  },
  button: {
    marginTop: 10,
  },
});

