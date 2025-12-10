import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradientColors?: string[];
  borderColor?: string;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  style,
  gradientColors = COLORS.gradientPurple,
  borderColor = COLORS.goldBorder,
}) => {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.content, { borderColor }]}>{children}</View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  gradient: {
    borderRadius: 15,
    padding: 2,
  },
  content: {
    borderRadius: 13,
    backgroundColor: COLORS.cardBackground + 'EE',
    borderWidth: 2,
    padding: 15,
  },
});

