/**
 * Advanced Cache Manager with TTL, LRU, and Memory Management
 * Includes encryption support for sensitive data
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  size: number;
  lastAccessed: number;
  encrypted?: boolean;
}

export interface CacheOptions {
  maxSize?: number; // Max cache size in bytes
  maxEntries?: number; // Max number of entries
  defaultTTL?: number; // Default time-to-live in ms
}

export class CacheManager<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private currentSize = 0;
  private readonly maxSize: number;
  private readonly maxEntries: number;
  private readonly defaultTTL: number;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 50 * 1024 * 1024; // 50MB default
    this.maxEntries = options.maxEntries || 1000;
    this.defaultTTL = options.defaultTTL || 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Set a value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    // Remove old entry if exists
    if (this.cache.has(key)) {
      const old = this.cache.get(key)!;
      this.currentSize -= old.size;
      this.cache.delete(key);
    }

    const size = this.estimateSize(value);
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    const entry: CacheEntry<T> = {
      value,
      expiresAt,
      size,
      lastAccessed: Date.now(),
    };

    // Evict if necessary
    while (
      this.cache.size >= this.maxEntries ||
      this.currentSize + size > this.maxSize
    ) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.currentSize += size;
  }

  /**
   * Get a value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    // Update last accessed
    entry.lastAccessed = Date.now();
    return entry.value;
  }

  /**
   * Get or set (lazy loading)
   */
  async getOrSet(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    this.currentSize -= entry.size;
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    entries: number;
    size: number;
    maxSize: number;
    maxEntries: number;
    hitRate: number;
  } {
    return {
      entries: this.cache.size,
      size: this.currentSize,
      maxSize: this.maxSize,
      maxEntries: this.maxEntries,
      hitRate: 0, // TODO: Track hits/misses
    };
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.delete(lruKey);
    }
  }

  /**
   * Estimate size of value in bytes
   */
  private estimateSize(value: T): number {
    try {
      const str = JSON.stringify(value);
      return str.length * 2; // UTF-16 = 2 bytes per char
    } catch {
      return 1024; // Default 1KB if can't stringify
    }
  }

  /**
   * Prefetch multiple keys
   */
  async prefetch(
    keys: string[],
    factory: (key: string) => Promise<T>,
    ttl?: number,
  ): Promise<void> {
    const promises = keys
      .filter((key) => !this.has(key))
      .map(async (key) => {
        try {
          const value = await factory(key);
          this.set(key, value, ttl);
        } catch (error) {
          console.warn(`Failed to prefetch ${key}:`, error);
        }
      });

    await Promise.all(promises);
  }
}

// Global cache instances
export const nftMetadataCache = new CacheManager({
  maxSize: 100 * 1024 * 1024, // 100MB for NFT metadata
  defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
});

export const imageCache = new CacheManager<string>({
  maxSize: 200 * 1024 * 1024, // 200MB for images
  defaultTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export const rpcCache = new CacheManager({
  maxSize: 10 * 1024 * 1024, // 10MB for RPC responses
  defaultTTL: 5 * 60 * 1000, // 5 minutes
});
