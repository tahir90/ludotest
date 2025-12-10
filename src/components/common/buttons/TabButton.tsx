import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';

interface TabButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export const TabButton: React.FC<TabButtonProps> = ({ label, active, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.container, active && styles.activeContainer]}
    >
      {active ? (
        <LinearGradient
          colors={COLORS.gradientPurple}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[styles.text, styles.activeText]}>{label}</Text>
        </LinearGradient>
      ) : (
        <Text style={styles.text}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  activeContainer: {
    elevation: 3,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  gradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.goldBorder + '60',
  },
  text: {
    color: COLORS.white + '80',
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
  },
  activeText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

