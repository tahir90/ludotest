import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { TierLevel } from '$types';

interface TierBadgeProps {
  tier: TierLevel;
  size?: 'small' | 'medium' | 'large';
}

const getTierColors = (tier: TierLevel): string[] => {
  switch (tier) {
    case 'D':
    case 'DD':
      return [COLORS.darkGrey, COLORS.grey];
    case 'C':
    case 'CC':
      return ['#C0C0C0', '#E8E8E8'];
    case 'B':
    case 'BB':
      return [COLORS.gold, COLORS.lightGold];
    case 'A':
    case 'AA':
      return ['#E5E4E2', '#F5F5F5'];
    case 'S':
      return ['#B9F2FF', '#E0F7FF'];
    case 'SS':
      return [COLORS.primaryPurple, COLORS.primaryMagenta];
    case 'SSS':
      return [COLORS.gold, COLORS.primaryMagenta, COLORS.primaryPurple];
    default:
      return [COLORS.darkGrey, COLORS.grey];
  }
};

const getTierSize = (size: 'small' | 'medium' | 'large'): number => {
  switch (size) {
    case 'small':
      return RFValue(10);
    case 'medium':
      return RFValue(14);
    case 'large':
      return RFValue(18);
    default:
      return RFValue(14);
  }
};

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, size = 'medium' }) => {
  const colors = getTierColors(tier);
  const fontSize = getTierSize(size);
  const padding = size === 'small' ? 4 : size === 'medium' ? 6 : 8;
  const borderRadius = size === 'small' ? 8 : size === 'medium' ? 10 : 12;

  return (
    <LinearGradient
      colors={colors}
      style={[styles.badge, { padding, borderRadius }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={[styles.text, { fontSize }]}>{tier}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1.5,
    borderColor: COLORS.goldBorder + '80',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 30,
  },
  text: {
    color: COLORS.white,
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    textShadowColor: COLORS.black + '80',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

