import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';

interface QuickActionCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  onPress: () => void;
  locked?: boolean;
  timer?: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  value,
  icon,
  onPress,
  locked = false,
  timer,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={locked}
    >
      <LinearGradient
        colors={COLORS.gradientPurple}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {icon}
            {locked && (
              <View style={styles.lockOverlay}>
                <Text style={styles.lockIcon}>🔒</Text>
              </View>
            )}
          </View>
          {value ? (
            <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
              {value}
            </Text>
          ) : null}
          {title ? (
            <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit>
              {title}
            </Text>
          ) : null}
          {timer && (
            <Text style={styles.timer} numberOfLines={1}>
              {timer}
            </Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    marginHorizontal: 5,
  },
  gradient: {
    flex: 1,
    padding: 2,
    borderRadius: 15,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.cardBackground + 'EE',
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 30,
  },
  value: {
    color: COLORS.gold,
    fontSize: RFValue(20),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginTop: 0,
    textAlign: 'center',
    width: '100%',
    includeFontPadding: false,
  },
  title: {
    color: COLORS.white,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
    textAlign: 'center',
    marginTop: 4,
    width: '100%',
    lineHeight: RFValue(14),
    includeFontPadding: false,
  },
  timer: {
    color: COLORS.lightText,
    fontSize: RFValue(8),
    fontFamily: 'Philosopher-Bold',
    marginTop: 2,
  },
  lockOverlay: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    padding: 2,
  },
  lockIcon: {
    fontSize: RFValue(16),
  },
});

