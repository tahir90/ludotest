import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { COLORS } from '$constants/colors';

interface CounterBadgeProps {
  count: number;
  style?: any;
  maxCount?: number;
}

export const CounterBadge: React.FC<CounterBadgeProps> = ({
  count,
  style,
  maxCount = 99,
}) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{displayCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  text: {
    color: COLORS.white,
    fontSize: RFValue(10),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
});

