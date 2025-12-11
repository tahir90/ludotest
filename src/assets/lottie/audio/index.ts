// Lottie animation audio assets (.mp3 files)
// These audio files are played in sync with Lottie animations
// Audio files should have the same name as their corresponding JSON files (with .mp3 extension)
import { default as DragonGoldenTransparent } from './dragongolden_transparent.mp3';

// Mapping from Lottie animation key to audio asset
// The key should match the Lottie JSON filename (without .json extension)
export const LOTTIE_AUDIO: Record<string, any> = {
  'dragongolden_transparent': DragonGoldenTransparent,
  'DragonGolden': DragonGoldenTransparent, // Alias for convenience
};

// Mapping from Lottie animation keys to their JSON filenames (without .json extension)
// This is used to auto-detect audio files
export const LOTTIE_TO_AUDIO_MAP: Record<string, string> = {
  'Dragon': 'Dragon',
  'DragonGolden': 'dragongolden_transparent',
  'GivingRoseAnimation': 'Giving Rose Animation',
  'GoldenDiamond': 'golden diamond',
  'LoveSMS': 'love SMS',
  'LoveDoor': 'love door',
};

/**
 * Get audio asset for a Lottie animation key
 * Returns null if no audio file exists
 */
export const getLottieAudio = (lottieKey: string): any | null => {
  // First try direct key lookup
  if (LOTTIE_AUDIO[lottieKey]) {
    return LOTTIE_AUDIO[lottieKey];
  }
  
  // Then try mapping from Lottie key to audio filename
  const audioKey = LOTTIE_TO_AUDIO_MAP[lottieKey];
  if (audioKey && LOTTIE_AUDIO[audioKey]) {
    return LOTTIE_AUDIO[audioKey];
  }
  
  return null;
};

export type LottieAudioKey = keyof typeof LOTTIE_AUDIO;

