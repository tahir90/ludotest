import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { TierBadge } from '../badges/TierBadge';
import { TierLevel } from '$types';

interface UserAvatarProps {
  username: string;
  avatar?: string;
  tier: TierLevel;
  size?: number;
  showTier?: boolean;
  showBorder?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  avatar,
  tier,
  size = 50,
  showTier = true,
  showBorder = true,
}) => {
  const getTierBorderColor = (tier: TierLevel): string[] => {
    switch (tier) {
      case 'S':
      case 'SS':
      case 'SSS':
        return [COLORS.gold, COLORS.primaryPurple];
      case 'A':
      case 'AA':
        return [COLORS.lightGrey, COLORS.white];
      case 'B':
      case 'BB':
        return [COLORS.gold, COLORS.lightGold];
      default:
        return [COLORS.grey, COLORS.lightGrey];
    }
  };

  const borderColors = showBorder ? getTierBorderColor(tier) : [COLORS.transparent, COLORS.transparent];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LinearGradient
        colors={borderColors}
        style={styles.borderGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.avatarContainer, { width: size - 4, height: size - 4 }]}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={[styles.avatarText, { fontSize: RFValue(size * 0.4) }]}>
                {username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
      {showTier && (
        <View style={styles.tierBadge}>
          <TierBadge tier={tier} size="small" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  borderGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: COLORS.primaryPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryPurple,
  },
  avatarText: {
    color: COLORS.white,
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
  tierBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: COLORS.darkPurpleBg,
    borderRadius: 10,
    padding: 2,
  },
});

