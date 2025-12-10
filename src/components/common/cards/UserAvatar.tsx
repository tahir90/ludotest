import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '$constants/colors';
import { TierBadge } from '../badges/TierBadge';
import { TierLevel } from '$types';
import { UserIcon } from 'react-native-heroicons/solid';

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
  const [imageError, setImageError] = React.useState(false);
  
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
  
  // Generate random gradient and emoji color based on username for consistency
  const getAvatarStyle = (username: string): { gradient: string[], emojiColor: string } => {
    const styles = [
      { gradient: ['#FF6B6B', '#FF8E53'], emojiColor: '#FFF' },      // Bright Red-Orange
      { gradient: ['#4ECDC4', '#44A08D'], emojiColor: '#FFF' },      // Bright Teal-Green
      { gradient: ['#A770EF', '#CF8BF3'], emojiColor: '#FFF' },      // Bright Purple-Pink
      { gradient: ['#FFA500', '#FF6347'], emojiColor: '#FFF' },      // Orange-Tomato
      { gradient: ['#56CCF2', '#2F80ED'], emojiColor: '#FFF' },      // Sky Blue
      { gradient: ['#F093FB', '#F5576C'], emojiColor: '#FFF' },      // Hot Pink
      { gradient: ['#FFD93D', '#FFB800'], emojiColor: '#000' },      // Bright Yellow (dark emoji)
      { gradient: ['#43E97B', '#38F9D7'], emojiColor: '#FFF' },      // Neon Green-Cyan
      { gradient: ['#FA8BFF', '#2BD2FF'], emojiColor: '#FFF' },      // Pink-Cyan
      { gradient: ['#FF512F', '#F09819'], emojiColor: '#FFF' },      // Red-Orange
      { gradient: ['#E96443', '#904E95'], emojiColor: '#FFF' },      // Coral-Purple
      { gradient: ['#00F260', '#0575E6'], emojiColor: '#FFF' },      // Lime-Blue
      { gradient: ['#FFD200', '#F7971E'], emojiColor: '#000' },      // Gold (dark emoji)
      { gradient: ['#FC6076', '#FF9A44'], emojiColor: '#FFF' },      // Rose-Orange
      { gradient: ['#13547A', '#80D0C7'], emojiColor: '#FFF' },      // Deep Blue-Aqua
    ];
    
    // Hash username to get consistent style
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % styles.length;
    return styles[index];
  };

  const borderColors = showBorder ? getTierBorderColor(tier) : [COLORS.transparent, COLORS.transparent];
  const avatarStyle = getAvatarStyle(username);
  
  // Check if we should show placeholder
  const hasValidAvatar = avatar && 
    (avatar.startsWith('http://') || avatar.startsWith('https://')) && 
    !imageError;
  
  const showPlaceholder = !hasValidAvatar;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LinearGradient
        colors={borderColors}
        style={styles.borderGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <LinearGradient
          colors={avatarStyle.gradient}
          style={[styles.avatarContainer, { width: size - 4, height: size - 4 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.avatarEmoji, { fontSize: size * 0.5, color: avatarStyle.emojiColor }]}>
            👤
          </Text>
          {hasValidAvatar && (
            <Image 
              source={{ uri: avatar }} 
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
              onError={() => setImageError(true)}
              onLoad={() => console.log('✅ Avatar loaded:', avatar)}
            />
          )}
        </LinearGradient>
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
  avatarEmoji: {
    textAlign: 'center',
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

