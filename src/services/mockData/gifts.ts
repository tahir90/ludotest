import { Gift, GiftTransaction } from '$types';
import { GIFT_CATALOG } from '$constants/config';

export const mockGifts: Gift[] = [
  ...GIFT_CATALOG.basic,
  ...GIFT_CATALOG.premium,
  ...GIFT_CATALOG.ultra
];

export const mockGiftTransactions: GiftTransaction[] = [
  {
    id: 'gift_txn_1',
    giftId: 'rose',
    sender: 'user_123',
    receiver: 'user_456',
    quantity: 10,
    totalCrowns: 100,
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'gift_txn_2',
    giftId: 'diamond',
    sender: 'user_789',
    receiver: 'user_123',
    quantity: 5,
    totalCrowns: 500,
    timestamp: new Date(Date.now() - 1800000).toISOString()
  }
];

