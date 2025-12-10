import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { DEVICE_WIDTH } from '$constants/dimensions';

interface GameModeCardProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  gradientColors?: string[];
  timer?: string;
  locked?: boolean;
}

export const GameModeCard: React.FC<GameModeCardProps> = ({
  title,
  icon,
  onPress,
  gradientColors = COLORS.gradientPurple,
  timer,
  locked = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={locked}
    >
      <LinearGradient
        colors={gradientColors}
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
          <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit>
            {title}
          </Text>
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
    width: (DEVICE_WIDTH - 60) / 2,
    height: 120,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
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
    padding: 10,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flex: 1,
  },
  title: {
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
    paddingTop: 4,
    paddingBottom: 4,
  },
  timer: {
    color: COLORS.gold,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
    marginTop: 5,
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
    fontSize: RFValue(20),
  },
});

