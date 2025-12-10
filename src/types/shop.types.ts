export interface CrownBundle {
  id: string;
  crowns: number;
  bonus: number;
  price: number;
  currency: string;
  bestValue?: boolean;
  icon?: string;
}

export interface Purchase {
  id: string;
  bundleId: string;
  crowns: number;
  bonus: number;
  price: number;
  currency: string;
  timestamp: string;
  transactionId: string;
}

export interface Gift {
  id: string;
  name: string;
  category: 'basic' | 'premium' | 'ultra';
  price: number;
  animation: string;
  icon: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface GiftTransaction {
  id: string;
  giftId: string;
  sender: string;
  receiver: string;
  quantity: number;
  totalCrowns: number;
  timestamp: string;
}

