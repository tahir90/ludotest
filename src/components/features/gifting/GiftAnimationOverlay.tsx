import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { COLORS } from '$constants/colors';
import { DEVICE_WIDTH, DEVICE_HEIGHT } from '$constants/dimensions';
import { Gift } from '$types';
import { getGiftAnimationConfig } from '$constants/giftAnimations';
import { playSound } from '$helpers/SoundUtils';

interface GiftAnimationOverlayProps {
  gift: Gift;
  sender: { username: string; avatar: string };
  receiver: { username: string; avatar: string };
  quantity: number;
  onComplete: () => void;
}

export const GiftAnimationOverlay: React.FC<GiftAnimationOverlayProps> = ({
  gift,
  sender,
  receiver,
  quantity,
  onComplete,
}) => {
  const config = getGiftAnimationConfig(gift);
  const opacity = useSharedValue(0);

  // Wrap onComplete in useCallback to make it stable
  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Play sound if configured
    if (config.sound) {
      playSound(config.sound).catch(console.error);
    }

    // Animation sequence:
    // 1. Wait 300ms for bottom sheet to close
    // 2. Fade in (400ms)
    // 3. Hold for lottie animation duration
    // 4. Fade out (300ms)

    const initialDelay = 300; // Wait for bottom sheet to close
    const fadeInDuration = 400;
    const holdDuration = config.duration - fadeInDuration - 300;
    const fadeOutDuration = 300;

    // Start animation with delay
    opacity.value = withDelay(
      initialDelay,
      withTiming(1, {
        duration: fadeInDuration,
        easing: Easing.out(Easing.ease),
      })
    );

    // Hold, then fade out
    const timer = setTimeout(() => {
      opacity.value = withTiming(
        0,
        {
          duration: fadeOutDuration,
          easing: Easing.in(Easing.ease),
        },
        (finished) => {
          'worklet';
          if (finished) {
            runOnJS(handleComplete)();
          }
        }
      );
    }, initialDelay + fadeInDuration + Math.max(holdDuration, 1000));

    return () => clearTimeout(timer);
  }, [config, handleComplete, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Get gift icon emoji for fallback
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

  // Check if lottieFile is valid (not null/undefined)
  const hasValidLottieFile = config.lottieFile != null && config.lottieFile !== undefined;

  return (
    <Animated.View style={[styles.overlay, containerStyle]} pointerEvents="none">
      <Animated.View style={[styles.container, animatedStyle]}>
        {hasValidLottieFile ? (
          <LottieView
            source={config.lottieFile}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
        ) : (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackIcon}>{getGiftIcon()}</Text>
          </View>
        )}
        
        {quantity > 1 && (
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>x{quantity}</Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT,
  },
  lottie: {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT,
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackIcon: {
    fontSize: RFValue(120),
  },
  quantityBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.gold + 'DD',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  quantityText: {
    color: COLORS.white,
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
    fontWeight: 'bold',
  },
});

