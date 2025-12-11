import React, { useEffect, useCallback, useRef } from 'react';
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
import LottieView from 'lottie-react-native';
import SoundPlayer from 'react-native-sound-player';
import { COLORS } from '$constants/colors';
import { DEVICE_WIDTH, DEVICE_HEIGHT } from '$constants/dimensions';
import { Gift } from '$types';
import { getGiftAnimationConfig } from '$constants/giftAnimations';
import { isMusicCurrentlyPlaying } from '$helpers/SoundUtils';
import { getLottieAudio } from '$assets/lottie/audio';
import { LOTTIE_ANIMATIONS } from '$assets/lottie';

interface GiftAnimationOverlayProps {
  gift: Gift;
  sender: { username: string; avatar: string };
  receiver: { username: string; avatar: string };
  quantity: number;
  onComplete: () => void;
}

export const GiftAnimationOverlay: React.FC<GiftAnimationOverlayProps> = ({
  gift,
  sender: _sender,
  receiver: _receiver,
  quantity,
  onComplete,
}) => {
  const config = getGiftAnimationConfig(gift);
  const opacity = useSharedValue(0);
  const lottieRef = useRef<LottieView>(null);
  const audioPlayingRef = useRef<boolean>(false);
  const audioAssetRef = useRef<any>(null);
  const lottieKeyRef = useRef<string | null>(null);
  const fadeOutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFinishedRef = useRef<boolean>(false);
  const animationStartedRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  // Wrap onComplete in useCallback to make it stable
  const handleComplete = useCallback(() => {
    // Only stop if we're playing Lottie audio AND background music is not playing
    // This prevents interfering with background music playback
    if (audioPlayingRef.current && !isMusicCurrentlyPlaying()) {
      try {
        SoundPlayer.stop();
        audioPlayingRef.current = false;
      } catch (e) {
        console.error('Error stopping Lottie audio:', e);
      }
    } else if (audioPlayingRef.current) {
      // Just mark as not playing, but don't stop (background music might be playing)
      audioPlayingRef.current = false;
    }
    onComplete();
  }, [onComplete]);

  // Preload audio and cache lottieKey when component mounts
  useEffect(() => {
    if (!config.lottieFile) {
      return;
    }

    // Find which Lottie animation key matches this lottieFile (cache this lookup)
    let lottieKey: string | null = null;
    for (const [key, value] of Object.entries(LOTTIE_ANIMATIONS)) {
      if (value === config.lottieFile) {
        lottieKey = key;
        break;
      }
    }

    if (lottieKey) {
      lottieKeyRef.current = lottieKey;

      // Preload audio asset if it exists
      const audioAsset = getLottieAudio(lottieKey);
      if (audioAsset) {
        audioAssetRef.current = audioAsset;
        console.log(`🎵 Preloaded audio for animation: ${lottieKey}`);

        // Pre-warm the audio player by loading the asset (if SoundPlayer supports it)
        // This reduces the delay when actually playing
        try {
          // Some audio players support preloading - try to load without playing
          // Note: react-native-sound-player doesn't have explicit preload, but
          // storing the reference helps with faster access
        } catch (e) {
          // Ignore preload errors
        }
      } else {
        audioAssetRef.current = null;
        console.log(`ℹ️ No audio file found for animation: ${lottieKey}`);
      }
    }
  }, [config.lottieFile]);

  // Handle Lottie animation start - play preloaded audio in perfect sync
  const handleAnimationStart = useCallback(() => {
    if (audioPlayingRef.current || !audioAssetRef.current) {
      return;
    }

    try {
      // Use preloaded audio asset for instant playback
      console.log(`🎬 Animation started - playing preloaded audio: ${lottieKeyRef.current}`);
      audioPlayingRef.current = true;

      // Play immediately - audio is already loaded
      SoundPlayer.playAsset(audioAssetRef.current);
      console.log('✅ Lottie audio started in sync (preloaded)');
    } catch (err) {
      console.error('❌ Error playing preloaded Lottie audio:', err);
      audioPlayingRef.current = false;
    }
  }, []);

  // Start fade out when animation completes
  const startFadeOut = useCallback(() => {
    if (animationFinishedRef.current) {
      return; // Already fading out
    }
    animationFinishedRef.current = true;

    // Start fade out immediately when animation completes
    // This ensures viewers see the full animation before it fades
    const fadeOutDuration = 300;
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
  }, [handleComplete, opacity]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Only stop if we're playing Lottie audio AND background music is not playing
      // This prevents interfering with background music playback
      if (audioPlayingRef.current && !isMusicCurrentlyPlaying()) {
        try {
          SoundPlayer.stop();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      audioPlayingRef.current = false;
      // Clear all timers
      if (audioTimerRef.current) {
        clearTimeout(audioTimerRef.current);
      }
      if (fadeOutTimerRef.current) {
        clearTimeout(fadeOutTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Prevent multiple runs - only start animation once per component instance
    if (animationStartedRef.current || !mountedRef.current) {
      console.log('⚠️ Animation already started or component unmounted, skipping');
      return;
    }
    animationStartedRef.current = true;

    // Safety check: ensure duration is valid
    const animationDuration = config.duration && config.duration > 0 ? config.duration : 2500;
    console.log('🎬 Starting gift animation for:', gift.id, 'Duration:', animationDuration, 'ms');

    // Animation sequence:
    // 1. Wait 300ms for bottom sheet to close
    // 2. Fade in (400ms)
    // 3. Lottie animation plays fully (based on known duration)
    // 4. Fade out starts when animation completes (300ms)

    const initialDelay = 300; // Wait for bottom sheet to close
    const fadeInDuration = 400;

    // Reset animation finished flag
    animationFinishedRef.current = false;

    // Start fade in
    opacity.value = withDelay(
      initialDelay,
      withTiming(1, {
        duration: fadeInDuration,
        easing: Easing.out(Easing.ease),
      })
    );

    // Trigger audio when animation starts (after fade in completes)
    audioTimerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        handleAnimationStart();
      }
    }, initialDelay + fadeInDuration);

    // Calculate when to start fade out: animation duration after fade in completes
    // This ensures fade out starts right when animation ends
    const animationStartTime = initialDelay + fadeInDuration;
    const fadeOutStartTime = animationStartTime + animationDuration;

    // Safety check: ensure fadeOutStartTime is valid
    if (!isFinite(fadeOutStartTime) || fadeOutStartTime < 0) {
      console.error('❌ Invalid fade out start time calculated:', fadeOutStartTime);
      return;
    }

    console.log('⏱️ Fade out scheduled at:', fadeOutStartTime, 'ms (animation duration:', animationDuration, 'ms)');

    // Start fade out at the calculated time (when animation should complete)
    fadeOutTimerRef.current = setTimeout(() => {
      if (mountedRef.current && !animationFinishedRef.current) {
        console.log('🎭 Starting fade out');
        startFadeOut();
      }
    }, Math.max(0, fadeOutStartTime)); // Ensure timeout is non-negative

    return () => {
      console.log('🧹 Cleaning up animation timers');
      if (audioTimerRef.current) {
        clearTimeout(audioTimerRef.current);
        audioTimerRef.current = null;
      }
      if (fadeOutTimerRef.current) {
        clearTimeout(fadeOutTimerRef.current);
        fadeOutTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

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
            ref={lottieRef}
            source={config.lottieFile}
            autoPlay={true}
            loop={false}
            style={styles.lottie}
            resizeMode="contain"
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

