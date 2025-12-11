import { LOTTIE_ANIMATIONS } from '$assets/lottie';
import { Gift } from '$types';
import { getLottieDuration } from '../utils/lottieUtils';

export interface GiftAnimationConfig {
  lottieFile: any;
  duration?: number; // Total animation duration in ms (calculated dynamically if not provided)
  scale: {
    min: number; // Initial scale
    max: number; // Peak scale during animation
  };
  showNotification: boolean; // Whether to show notification bar
  // Note: Audio files are auto-detected based on Lottie JSON filename
  // If an audio file with the same name exists in src/assets/lottie/audio/, it will be played in sync
}

// Manual mapping of gift IDs to animation configurations
// Duration is calculated dynamically from Lottie JSON if not specified
export const GIFT_ANIMATION_MAP: Record<string, GiftAnimationConfig> = {
  // Basic gifts
  rose: {
    lottieFile: LOTTIE_ANIMATIONS.GivingRoseAnimation,
    // Duration calculated dynamically from JSON
    scale: { min: 0.3, max: 1.5 },
    showNotification: true,
  },
  heart: {
    lottieFile: LOTTIE_ANIMATIONS.LoveSMS,
    // Duration calculated dynamically from JSON
    scale: { min: 0.3, max: 1.4 },
    showNotification: true,
  },
  star: {
    lottieFile: null, // No lottie file, will use fallback
    duration: 2000, // Fallback duration for non-Lottie animations
    scale: { min: 0.3, max: 1.3 },
    showNotification: true,
  },
  crown: {
    lottieFile: null, // No lottie file, will use fallback
    duration: 2500, // Fallback duration for non-Lottie animations
    scale: { min: 0.3, max: 1.4 },
    showNotification: true,
  },
  
  // Premium gifts
  diamond: {
    lottieFile: LOTTIE_ANIMATIONS.GoldenDiamond,
    // Duration calculated dynamically from JSON
    scale: { min: 0.2, max: 1.6 },
    showNotification: true,
  },
  trophy: {
    lottieFile: null, // No lottie file, will use fallback
    duration: 3000, // Fallback duration for non-Lottie animations
    scale: { min: 0.3, max: 1.5 },
    showNotification: true,
  },
  crown_king: {
    lottieFile: null, // No lottie file, will use fallback
    duration: 3000, // Fallback duration for non-Lottie animations
    scale: { min: 0.3, max: 1.5 },
    showNotification: true,
  },
  legendary: {
    lottieFile: LOTTIE_ANIMATIONS.DragonGolden,
    // Duration calculated dynamically from JSON (8000ms)
    scale: { min: 0.2, max: 1.8 },
    showNotification: true,
  },
  
  // Ultra gifts
  mega_crown: {
    lottieFile: null, // No lottie file, will use fallback
    duration: 3500, // Fallback duration for non-Lottie animations
    scale: { min: 0.2, max: 1.7 },
    showNotification: true,
  },
  royal_gift: {
    lottieFile: LOTTIE_ANIMATIONS.LoveDoor,
    // Duration calculated dynamically from JSON
    scale: { min: 0.2, max: 1.8 },
    showNotification: true,
  },
  epic_gift: {
    lottieFile: LOTTIE_ANIMATIONS.Dragon,
    // Duration calculated dynamically from JSON
    scale: { min: 0.2, max: 2.0 },
    showNotification: true,
  },
  
  // New gifts
  coffee: {
    lottieFile: LOTTIE_ANIMATIONS.Coffee,
    // Duration calculated dynamically from JSON (8000ms)
    scale: { min: 0.2, max: 1.8 },
    showNotification: true,
  },
  loveblast: {
    lottieFile: LOTTIE_ANIMATIONS.LoveBlast,
    // Duration calculated dynamically from JSON (8000ms)
    scale: { min: 0.2, max: 1.8 },
    showNotification: true,
  },
};

/**
 * Get animation config for a gift, with fallback for unmapped gifts
 * Duration is calculated dynamically from Lottie JSON if available
 */
export const getGiftAnimationConfig = (gift: Gift): GiftAnimationConfig => {
  const config = GIFT_ANIMATION_MAP[gift.id];
  
  if (config) {
    // Calculate duration dynamically from Lottie JSON if not provided
    let duration = config.duration;
    if (!duration && config.lottieFile) {
      try {
        duration = getLottieDuration(config.lottieFile);
        if (duration > 0) {
          console.log(`📊 Calculated duration for ${gift.id}: ${duration}ms`);
        } else {
          console.warn(`⚠️ Could not calculate duration for ${gift.id}, using fallback`);
        }
      } catch (e) {
        console.error(`❌ Error calculating duration for ${gift.id}:`, e);
        duration = 0; // Will use fallback
      }
    }
    
    // Ensure duration is valid and positive
    const finalDuration = (duration && duration > 0) ? duration : 2500;
    
    return {
      ...config,
      duration: finalDuration, // Default to 2500ms if calculation fails
    };
  }
  
  // Fallback config for unmapped gifts
  return {
    lottieFile: null,
    duration: 2500,
    scale: { min: 0.3, max: 1.4 },
    showNotification: true,
  };
};

