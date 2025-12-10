import { CrownBundle, Purchase } from '$types';
import { CROWN_BUNDLES } from '$constants/config';

export const mockBundles: CrownBundle[] = CROWN_BUNDLES;

export const mockPurchaseHistory: Purchase[] = [
  {
    id: 'purchase_1',
    bundleId: 'standard',
    crowns: 3000,
    bonus: 0,
    price: 10,
    currency: 'USD',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    transactionId: 'txn_123456'
  },
  {
    id: 'purchase_2',
    bundleId: 'bonus',
    crowns: 6000,
    bonus: 1000,
    price: 20,
    currency: 'USD',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    transactionId: 'txn_789012'
  }
];

