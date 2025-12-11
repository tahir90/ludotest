import { LOTTIE_ANIMATIONS } from '$assets/lottie';
import { Gift } from '$types';

export interface GiftAnimationConfig {
  lottieFile: any;
  duration: number; // Total animation duration in ms
  scale: {
    min: number; // Initial scale
    max: number; // Peak scale during animation
  };
  sound?: string; // Sound effect name
  showNotification: boolean; // Whether to show notification bar
}

// Manual mapping of gift IDs to animation configurations
export const GIFT_ANIMATION_MAP: Record<string, GiftAnimationConfig> = {
  // Basic gifts
  rose: {
    lottieFile: LOTTIE_ANIMATIONS.GivingRoseAnimation,
    duration: 3000,
    scale: { min: 0.3, max: 1.5 },
    sound: 'cheer',
    showNotification: true,
  },
  heart: {
    lottieFile: LOTTIE_ANIMATIONS.LoveSMS,
    duration: 2500,
    scale: { min: 0.3, max: 1.4 },
    sound: 'cheer',
    showNotification: true,
  },
  star: {
    lottieFile: null, // No lottie file, will use fallback
    duration: 2000,
    scale: { min: 0.3, max: 1.3 },
    sound: 'cheer',
    showNotification: true,
  },
  crown: {
    lottieFile: null, // No lottie file, will use fallback
    duration: 2500,
    scale: { min: 0.3, max: 1.4 },
    sound: 'cheer',
    showNotification: true,
  },
  
  // Premium gifts
  diamond: {
    lottieFile: LOTTIE_ANIMATIONS.GoldenDiamond,
    duration: 3500,
    scale: { min: 0.2, max: 1.6 },
    sound: 'cheer',
    showNotification: true,
  },
  trophy: {
    lottieFile: null, // No lottie file, will use fallback
    duration: 3000,
    scale: { min: 0.3, max: 1.5 },
    sound: 'cheer',
    showNotification: true,
  },
  crown_king: {
    lottieFile: null, // No lottie file, will use fallback
    duration: 3000,
    scale: { min: 0.3, max: 1.5 },
    sound: 'cheer',
    showNotification: true,
  },
  legendary: {
    lottieFile: LOTTIE_ANIMATIONS.DragonGolden,
    duration: 5000,
    scale: { min: 0.2, max: 1.8 },
    sound: 'cheer',
    showNotification: true,
  },
  
  // Ultra gifts
  mega_crown: {
    lottieFile: null, // No lottie file, will use fallback
    duration: 3500,
    scale: { min: 0.2, max: 1.7 },
    sound: 'cheer',
    showNotification: true,
  },
  royal_gift: {
    lottieFile: LOTTIE_ANIMATIONS.LoveDoor,
    duration: 4000,
    scale: { min: 0.2, max: 1.8 },
    sound: 'cheer',
    showNotification: true,
  },
  epic_gift: {
    lottieFile: LOTTIE_ANIMATIONS.Dragon,
    duration: 4500,
    scale: { min: 0.2, max: 2.0 },
    sound: 'cheer',
    showNotification: true,
  },
};

/**
 * Get animation config for a gift, with fallback for unmapped gifts
 */
export const getGiftAnimationConfig = (gift: Gift): GiftAnimationConfig => {
  const config = GIFT_ANIMATION_MAP[gift.id];
  
  if (config) {
    return config;
  }
  
  // Fallback config for unmapped gifts
  return {
    lottieFile: null,
    duration: 2500,
    scale: { min: 0.3, max: 1.4 },
    sound: 'cheer',
    showNotification: true,
  };
};

