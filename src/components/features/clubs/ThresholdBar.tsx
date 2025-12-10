import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';
import { ProgressBar } from '$components/common';
import { GIFT_THRESHOLDS } from '$constants/config';

interface ThresholdBarProps {
  current: number;
}

export const ThresholdBar: React.FC<ThresholdBarProps> = ({ current }) => {
  const getCurrentThreshold = () => {
    if (current >= GIFT_THRESHOLDS.legendary.crowns) {
      return { level: 'Legendary', ...GIFT_THRESHOLDS.legendary };
    }
    if (current >= GIFT_THRESHOLDS.platinum.crowns) {
      return { level: 'Platinum', ...GIFT_THRESHOLDS.platinum };
    }
    if (current >= GIFT_THRESHOLDS.gold.crowns) {
      return { level: 'Gold', ...GIFT_THRESHOLDS.gold };
    }
    if (current >= GIFT_THRESHOLDS.silver.crowns) {
      return { level: 'Silver', ...GIFT_THRESHOLDS.silver };
    }
    return { level: 'Bronze', ...GIFT_THRESHOLDS.bronze };
  };

  const threshold = getCurrentThreshold();
  const progress = (current / threshold.crowns) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Gifting Progress</Text>
        <Text style={styles.level}>{threshold.level}</Text>
      </View>
      <ProgressBar
        progress={progress}
        current={current}
        total={threshold.crowns}
        showLabel={true}
        height={20}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: COLORS.cardBackground + '80',
    borderRadius: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: COLORS.white,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
  },
  level: {
    color: COLORS.gold,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
});

