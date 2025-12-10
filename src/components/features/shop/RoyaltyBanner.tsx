import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { PrimaryButton } from '$components/common';

export const RoyaltyBanner: React.FC = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primaryPurple, COLORS.primaryMagenta, COLORS.deepPurple]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <Text style={styles.crownIcon}>👑</Text>
          <Text style={styles.title}>CROWN TIERS</Text>
          <Text style={styles.description}>
            Collect Crowns to progress through tiers from D to SSS and unlock exclusive rewards!
          </Text>
          <PrimaryButton
            title="View My Tier"
            onPress={() => {}}
            style={styles.button}
            gradientColors={[COLORS.success, COLORS.success + 'DD']}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  gradient: {
    padding: 2,
    borderRadius: 15,
  },
  content: {
    backgroundColor: COLORS.cardBackground + 'EE',
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '60',
    padding: 20,
    alignItems: 'center',
  },
  crownIcon: {
    fontSize: RFValue(50),
    marginBottom: 10,
  },
  title: {
    color: COLORS.gold,
    fontSize: RFValue(24),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: RFValue(20),
  },
  button: {
    width: '80%',
  },
});

