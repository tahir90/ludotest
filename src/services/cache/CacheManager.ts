import { MMKV } from 'react-native-mmkv';
import { ENV } from '$config/env';

/**
 * Cache Manager
 * Handles time-based cache invalidation and LRU cache
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private static instance: CacheManager | null = null;
  private storage: MMKV;
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private maxMemoryCacheSize: number = 50; // Max entries in memory cache

  private constructor() {
    this.storage = new MMKV({
      id: 'api_cache',
    });
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      if (Date.now() < memoryEntry.timestamp + memoryEntry.ttl) {
        return memoryEntry.data as T;
      } else {
        // Expired, remove from memory
        this.memoryCache.delete(key);
      }
    }

    // Check persistent cache
    try {
      const cached = this.storage.getString(key);
      if (cached) {
        const entry: CacheEntry<T> = JSON.parse(cached);
        if (Date.now() < entry.timestamp + entry.ttl) {
          // Move to memory cache for faster access
          this.setMemoryCache(key, entry.data, entry.ttl);
          return entry.data;
        } else {
          // Expired, remove
          this.storage.delete(key);
        }
      }
    } catch (error) {
      console.error('[CacheManager] Error reading cache:', error);
    }

    return null;
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, ttl: number = ENV.CACHE_TTL.USER_PROFILE): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Store in memory cache
    this.setMemoryCache(key, data, ttl);

    // Store in persistent cache
    try {
      this.storage.set(key, JSON.stringify(entry));
    } catch (error) {
      console.error('[CacheManager] Error writing cache:', error);
    }
  }

  /**
   * Set memory cache with LRU eviction
   */
  private setMemoryCache<T>(key: string, data: T, ttl: number): void {
    // If cache is full, remove oldest entry
    if (this.memoryCache.size >= this.maxMemoryCacheSize) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Invalidate cache
   */
  invalidate(key: string): void {
    this.memoryCache.delete(key);
    this.storage.delete(key);
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern: string): void {
    // Invalidate memory cache
    const keysToDelete: string[] = [];
    this.memoryCache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.memoryCache.delete(key));

    // Note: MMKV doesn't support pattern matching, so we'd need to track keys
    // For now, we'll just clear memory cache with patterns
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.memoryCache.clear();
    this.storage.clearAll();
  }

  /**
   * Get cache key for API endpoint
   */
  static getCacheKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? `_${JSON.stringify(params)}` : '';
    return `cache_${endpoint}${paramString}`;
  }
}

export { CacheManager };
export const cacheManager = CacheManager.getInstance();
export default cacheManager;


