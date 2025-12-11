import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS } from '$constants/colors';
import { DEVICE_WIDTH } from '$constants/dimensions';
import { Gift } from '$types';
import { UserAvatar } from '$components/common';

interface GiftNotificationBarProps {
  gift: Gift;
  sender: { username: string; avatar: string };
  quantity: number;
  onComplete: () => void;
  autoDismissTime?: number;
}

export const GiftNotificationBar: React.FC<GiftNotificationBarProps> = ({
  gift,
  sender,
  quantity,
  onComplete,
  autoDismissTime = 3500,
}) => {
  const translateX = useSharedValue(-DEVICE_WIDTH);
  const opacity = useSharedValue(0);

  // Wrap onComplete in useCallback to make it stable
  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Wait 300ms for bottom sheet to close, then slide in
    const initialDelay = 300;

    // Slide in animation with delay
    translateX.value = withDelay(
      initialDelay,
      withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      })
    );
    
    opacity.value = withDelay(
      initialDelay,
      withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      })
    );

    // Auto-dismiss after delay
    const timer = setTimeout(() => {
      translateX.value = withTiming(-DEVICE_WIDTH, {
        duration: 300,
        easing: Easing.in(Easing.ease),
      });
      
      opacity.value = withTiming(
        0,
        {
          duration: 300,
          easing: Easing.in(Easing.ease),
        },
        (finished) => {
          'worklet';
          if (finished) {
            runOnJS(handleComplete)();
          }
        }
      );
    }, initialDelay + autoDismissTime);

    return () => clearTimeout(timer);
  }, [handleComplete, translateX, opacity, autoDismissTime]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  // Get gift icon emoji
  const getGiftIcon = () => {
    switch (gift.icon) {
      case 'rose': return '🌹';
      case 'heart': return '❤️';
      case 'star': return '⭐';
      case 'crown': return '👑';
      case 'diamond': return '💎';
      case 'trophy': return '🏆';
      default: return '🎁';
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.content}>
        <UserAvatar
          username={sender.username}
          avatar={sender.avatar}
          tier="C"
          size={32}
          showTier={false}
        />
        <View style={styles.textContainer}>
          <Text style={styles.username} numberOfLines={1}>
            {sender.username}
          </Text>
          <Text style={styles.message} numberOfLines={1}>
            sent {gift.name} {getGiftIcon()}
            {quantity > 1 && ` x${quantity}`}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 9998,
    paddingHorizontal: 15,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground + 'F0',
    borderRadius: 25,
    padding: 10,
    paddingRight: 15,
    borderWidth: 2,
    borderColor: COLORS.goldBorder + '80',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: DEVICE_WIDTH * 0.85,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  username: {
    color: COLORS.gold,
    fontSize: RFValue(12),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  message: {
    color: COLORS.white,
    fontSize: RFValue(11),
    fontFamily: 'Philosopher-Regular',
  },
});

