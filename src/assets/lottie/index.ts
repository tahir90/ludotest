// Lottie animation assets (.json files)
// Using require() for lottie-react-native
export const LOTTIE_ANIMATIONS = {
  Dragon: require('./Dragon.json'),
  DragonGolden: require('./dragongolden_transparent.json'),
  GivingRoseAnimation: require('./Giving Rose Animation.json'),
  GoldenDiamond: require('./golden diamond.json'),
  LoveSMS: require('./love SMS.json'),
  LoveDoor: require('./love door.json'),
} as const;

export type LottieAnimationKey = keyof typeof LOTTIE_ANIMATIONS;

