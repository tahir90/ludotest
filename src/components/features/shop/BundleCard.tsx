import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { CrownBundle } from '$types';
import { PrimaryButton } from '$components/common';

interface BundleCardProps {
  bundle: CrownBundle;
  onPurchase: (bundle: CrownBundle) => void;
}

export const BundleCard: React.FC<BundleCardProps> = ({ bundle, onPurchase }) => {
  const formatCrowns = (crowns: number): string => {
    if (crowns >= 1000) {
      return `${(crowns / 1000).toFixed(1)}k`;
    }
    return crowns.toString();
  };

  return (
    <View style={styles.container}>
      {bundle.bestValue && (
        <View style={styles.bestBadge}>
          <Text style={styles.bestText}>BEST</Text>
        </View>
      )}
      <LinearGradient
        colors={COLORS.gradientPurple}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <Text style={styles.crownIcon}>👑</Text>
          <Text style={styles.crownAmount}>{formatCrowns(bundle.crowns)}</Text>
          {bundle.bonus > 0 && (
            <View style={styles.bonusContainer}>
              <Text style={styles.bonusText}>+{formatCrowns(bundle.bonus)} Bonus</Text>
            </View>
          )}
          <PrimaryButton
            title={`${bundle.price} ${bundle.currency}`}
            onPress={() => onPurchase(bundle)}
            style={styles.purchaseButton}
            gradientColors={[COLORS.success, COLORS.success + 'DD']}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    position: 'relative',
  },
  bestBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.error,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    zIndex: 10,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  bestText: {
    color: COLORS.white,
    fontSize: RFValue(10),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
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
    padding: 15,
    alignItems: 'center',
  },
  crownIcon: {
    fontSize: RFValue(40),
    marginBottom: 10,
  },
  crownAmount: {
    color: COLORS.gold,
    fontSize: RFValue(24),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bonusContainer: {
    backgroundColor: COLORS.success + '40',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 15,
  },
  bonusText: {
    color: COLORS.success,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  purchaseButton: {
    width: '100%',
  },
});

