import { TierLevel } from '$types';

export const TIER_THRESHOLDS: Record<TierLevel, { min: number; max: number }> = {
  D: { min: 0, max: 999 },
  DD: { min: 1000, max: 2499 },
  C: { min: 2500, max: 4999 },
  CC: { min: 5000, max: 9999 },
  B: { min: 10000, max: 19999 },
  BB: { min: 20000, max: 39999 },
  A: { min: 40000, max: 79999 },
  AA: { min: 80000, max: 149999 },
  S: { min: 150000, max: 299999 },
  SS: { min: 300000, max: 599999 },
  SSS: { min: 600000, max: Infinity }
};

export const CROWN_BUNDLES = [
  { id: 'starter', crowns: 1200, bonus: 0, price: 5, currency: 'USD' },
  { id: 'standard', crowns: 3000, bonus: 0, price: 10, currency: 'USD' },
  { id: 'bonus', crowns: 6000, bonus: 1000, price: 20, currency: 'USD' },
  { id: 'mega', crowns: 15000, bonus: 5000, price: 50, currency: 'USD', bestValue: true },
  { id: 'ultimate', crowns: 30000, bonus: 15000, price: 100, currency: 'USD' }
];

export const GIFT_CATALOG = {
  basic: [
    { id: 'rose', name: 'Rose', price: 10, animation: 'rose_anim', icon: 'rose', category: 'basic' as const, rarity: 'common' as const },
    { id: 'heart', name: 'Heart', price: 20, animation: 'heart_anim', icon: 'heart', category: 'basic' as const, rarity: 'common' as const },
    { id: 'star', name: 'Star', price: 30, animation: 'star_anim', icon: 'star', category: 'basic' as const, rarity: 'common' as const },
    { id: 'crown', name: 'Crown', price: 50, animation: 'crown_anim', icon: 'crown', category: 'basic' as const, rarity: 'rare' as const }
  ],
  premium: [
    { id: 'diamond', name: 'Diamond', price: 100, animation: 'diamond_anim', icon: 'diamond', category: 'premium' as const, rarity: 'epic' as const },
    { id: 'trophy', name: 'Trophy', price: 200, animation: 'trophy_anim', icon: 'trophy', category: 'premium' as const, rarity: 'epic' as const },
    { id: 'crown_king', name: 'Crown King', price: 300, animation: 'crown_king_anim', icon: 'crown_king', category: 'premium' as const, rarity: 'epic' as const },
    { id: 'legendary', name: 'Legendary', price: 500, animation: 'legendary_anim', icon: 'legendary', category: 'premium' as const, rarity: 'legendary' as const }
  ],
  ultra: [
    { id: 'mega_crown', name: 'Mega Crown', price: 1000, animation: 'mega_crown_anim', icon: 'mega_crown', category: 'ultra' as const, rarity: 'legendary' as const },
    { id: 'royal_gift', name: 'Royal Gift', price: 2500, animation: 'royal_gift_anim', icon: 'royal_gift', category: 'ultra' as const, rarity: 'legendary' as const },
    { id: 'epic_gift', name: 'Epic Gift', price: 5000, animation: 'epic_gift_anim', icon: 'epic_gift', category: 'ultra' as const, rarity: 'legendary' as const }
  ]
};

export const GIFT_THRESHOLDS = {
  bronze: { crowns: 1000, bonus: 0.1, duration: 3600 },
  silver: { crowns: 5000, bonus: 0.2, duration: 7200 },
  gold: { crowns: 15000, bonus: 0.3, duration: 10800 },
  platinum: { crowns: 50000, bonus: 0.5, duration: 14400 },
  legendary: { crowns: 100000, bonus: 1.0, duration: 21600 }
};

export const QUANTITY_OPTIONS = [1, 7, 17, 77, 777];

