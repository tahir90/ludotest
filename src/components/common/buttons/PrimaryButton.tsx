import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { playSound } from '$helpers/SoundUtils';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradientColors?: string[];
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
  gradientColors = COLORS.gradientPurple,
  icon,
}) => {
  const handlePress = () => {
    if (!disabled) {
      playSound('ui');
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.container, style, disabled && styles.disabled]}
    >
      <LinearGradient
        colors={disabled ? [COLORS.grey, COLORS.darkGrey] : gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: COLORS.goldBorder,
    borderRadius: 10,
    minHeight: 50,
  },
  iconContainer: {
    marginRight: 10,
  },
  text: {
    color: COLORS.white,
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: COLORS.lightGrey,
  },
});

