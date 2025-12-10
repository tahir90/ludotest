import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { Gift } from '$types';
import { PlayIcon } from 'react-native-heroicons/solid';

interface GiftCardProps {
  gift: Gift;
  selected: boolean;
  onPress: () => void;
}

export const GiftCard: React.FC<GiftCardProps> = ({ gift, selected, onPress }) => {
  const getRarityColor = (rarity?: string): string[] => {
    switch (rarity) {
      case 'legendary':
        return [COLORS.gold, COLORS.primaryPurple];
      case 'epic':
        return [COLORS.primaryMagenta, COLORS.primaryPurple];
      case 'rare':
        return [COLORS.primaryPurple, COLORS.primaryMagenta];
      default:
        return COLORS.gradientPurple;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={selected ? getRarityColor(gift.rarity) : COLORS.gradientPurple}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <Text style={styles.giftIcon}>
            {gift.icon === 'rose' ? '🌹' :
             gift.icon === 'heart' ? '❤️' :
             gift.icon === 'star' ? '⭐' :
             gift.icon === 'crown' ? '👑' :
             gift.icon === 'diamond' ? '💎' :
             gift.icon === 'trophy' ? '🏆' :
             gift.icon === 'mega_crown' ? '👑' : '🎁'}
          </Text>
          <Text style={styles.giftName}>{gift.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.crownIcon}>👑</Text>
            <Text style={styles.price}>{gift.price}</Text>
          </View>
          {gift.animation && (
            <View style={styles.playIcon}>
              <PlayIcon size={16} color={COLORS.white} />
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  selected: {
    borderWidth: 3,
    borderColor: COLORS.gold,
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
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  giftIcon: {
    fontSize: RFValue(40),
    marginBottom: 10,
  },
  giftName: {
    color: COLORS.white,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkPurpleBg + '80',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  crownIcon: {
    fontSize: RFValue(14),
    marginRight: 5,
  },
  price: {
    color: COLORS.gold,
    fontSize: RFValue(14),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  playIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: COLORS.warning,
    borderRadius: 10,
    padding: 4,
  },
});

