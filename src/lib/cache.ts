/**
 * In-memory cache with TTL support.
 * Stores scrape results per username to avoid redundant requests.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private ttl: number;

  constructor(ttl: number = DEFAULT_TTL) {
    this.ttl = ttl;
  }

  /**
   * Get cached data for a key. Returns null if not found or expired.
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Store data with the current timestamp.
   */
  set<T>(key: string, data: T): void {
    this.store.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Remove a specific key from cache.
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Purge all expired entries.
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now - entry.timestamp > this.ttl) {
        this.store.delete(key);
      }
    }
  }
}

// Separate cache instances for each platform
export const instagramCache = new MemoryCache();
export const tiktokCache = new MemoryCache();
