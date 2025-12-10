import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';

interface ProgressBarProps {
  progress: number; // 0-100
  total?: number;
  current?: number;
  showLabel?: boolean;
  label?: string;
  height?: number;
  gradientColors?: string[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  total,
  current,
  showLabel = false,
  label,
  height = 20,
  gradientColors = COLORS.gradientGold,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          {label && <Text style={styles.label}>{label}</Text>}
          {(total !== undefined && current !== undefined) && (
            <Text style={styles.value}>
              {current} / {total}
            </Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <LinearGradient
          colors={gradientColors}
          style={[styles.fill, { width: `${clampedProgress}%`, height }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    color: COLORS.white,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
  },
  value: {
    color: COLORS.gold,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
  },
  track: {
    width: '100%',
    backgroundColor: COLORS.darkPurpleBg + '80',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.goldBorder + '40',
  },
  fill: {
    borderRadius: 10,
  },
});

