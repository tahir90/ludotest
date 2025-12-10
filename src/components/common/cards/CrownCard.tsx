import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';

interface CrownCardProps {
  crowns: number;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const formatCrowns = (crowns: number): string => {
  if (crowns >= 1000000) {
    return `${(crowns / 1000000).toFixed(2)}M`;
  }
  if (crowns >= 1000) {
    return `${(crowns / 1000).toFixed(2)}K`;
  }
  return crowns.toLocaleString();
};

export const CrownCard: React.FC<CrownCardProps> = ({
  crowns,
  showIcon = true,
  size = 'medium',
}) => {
  const fontSize = size === 'small' ? RFValue(12) : size === 'medium' ? RFValue(14) : RFValue(18);
  const iconSize = size === 'small' ? RFValue(14) : size === 'medium' ? RFValue(18) : RFValue(24);

  return (
    <View style={styles.container}>
      {showIcon && <Text style={[styles.icon, { fontSize: iconSize }]}>👑</Text>}
      <Text style={[styles.text, { fontSize }]}>{formatCrowns(crowns)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 5,
  },
  text: {
    color: COLORS.gold,
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
});

