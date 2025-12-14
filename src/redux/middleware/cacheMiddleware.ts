import { Middleware } from '@reduxjs/toolkit';
import { CacheManager, cacheManager } from '$services/cache/CacheManager';

/**
 * Cache Middleware
 * Automatically caches and hydrates Redux state
 */

interface CacheableAction {
  type: string;
  payload?: any;
  meta?: {
    cache?: {
      key: string;
      ttl?: number;
      invalidate?: string[];
    };
  };
}

export const cacheMiddleware: Middleware = (store) => (next) => (action: CacheableAction) => {
  // Handle cache invalidation
  if (action.meta?.cache?.invalidate) {
    action.meta.cache.invalidate.forEach((key) => {
      cacheManager.invalidate(key);
    });
  }

  // Handle cache storage
  if (action.meta?.cache?.key) {
    const { key, ttl } = action.meta.cache;
    const state = store.getState();
    
    // Extract relevant state slice
    const cacheableData = extractCacheableData(state, key);
    
    if (cacheableData) {
      cacheManager.set(key, cacheableData, ttl);
    }
  }

  // Handle cache hydration
  const result = next(action);

  // Check if action should trigger cache hydration
  if (shouldHydrateFromCache(action)) {
    const cacheKey = getCacheKeyForAction(action);
    if (cacheKey) {
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        // Dispatch action to hydrate state from cache
        // This would be a custom action that updates state with cached data
        // store.dispatch(hydrateFromCache(cacheKey, cachedData));
      }
    }
  }

  return result;
};

/**
 * Extract cacheable data from state
 */
function extractCacheableData(state: any, key: string): any {
  // Map cache keys to state slices
  const keyMap: Record<string, string> = {
    'user:profile': 'user.currentUser',
    'leaderboard:global': 'leaderboard.leaderboard',
    'shop:items': 'shop.items',
    'gifts:catalog': 'gifting.catalog',
    'club:details': 'club.currentClub',
  };

  const statePath = keyMap[key];
  if (!statePath) {
    return null;
  }

  const paths = statePath.split('.');
  let data = state;
  
  for (const path of paths) {
    if (data && typeof data === 'object' && path in data) {
      data = data[path];
    } else {
      return null;
    }
  }

  return data;
}

/**
 * Check if action should hydrate from cache
 */
function shouldHydrateFromCache(action: CacheableAction): boolean {
  // Actions that should trigger cache hydration
  const hydrateActions = [
    'user/fetchCurrentUser/pending',
    'leaderboard/fetchLeaderboard/pending',
    'shop/fetchShopItems/pending',
    'gifting/fetchGiftCatalog/pending',
    'club/fetchClubDetails/pending',
  ];

  return hydrateActions.includes(action.type);
}

/**
 * Get cache key for action
 */
function getCacheKeyForAction(action: CacheableAction): string | null {
  const keyMap: Record<string, string> = {
    'user/fetchCurrentUser/pending': 'user:profile',
    'leaderboard/fetchLeaderboard/pending': 'leaderboard:global',
    'shop/fetchShopItems/pending': 'shop:items',
    'gifting/fetchGiftCatalog/pending': 'gifts:catalog',
    'club/fetchClubDetails/pending': 'club:details',
  };

  return keyMap[action.type] || null;
}

export default cacheMiddleware;


