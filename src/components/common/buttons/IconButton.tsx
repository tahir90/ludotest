import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  gradientColors?: string[];
  style?: ViewStyle;
  disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 50,
  gradientColors,
  style,
  disabled = false,
}) => {
  const colors = gradientColors || [COLORS.primaryPurple + '80', COLORS.primaryMagenta + '80'];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.container, { width: size, height: size }, style, disabled && styles.disabled]}
    >
      <LinearGradient
        colors={colors}
        style={[styles.gradient, { width: size, height: size, borderRadius: size / 2 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.iconContainer}>{icon}</View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

