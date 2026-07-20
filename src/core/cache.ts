import crypto from "crypto";

export interface CacheStats {
  hits: number;
  misses: number;
  totalLatencySavedMs: number;
  averageFetchLatencyMs: number;
  keysCount: number;
  items: Array<{
    key: string;
    modelName: string;
    jurisdiction: string;
    timestamp: string;
    lastAccessed: string;
    hits: number;
    latencyMs: number;
  }>;
}

interface CacheEntry {
  key: string;
  data: any;
  modelName: string;
  jurisdiction: string;
  timestamp: string;
  lastAccessed: string;
  hits: number;
  latencyMs: number;
}

export class ApexCacheManager {
  private cache = new Map<string, CacheEntry>();
  private maxEntries = 100;
  private hitsCount = 0;
  private missesCount = 0;
  private latencySavedMs = 0;
  private fetchLatencyHistory: number[] = [];

  constructor(maxEntries = 100) {
    this.maxEntries = maxEntries;
  }

  /**
   * Generates a deterministic hash key for caching compiled blueprints
   */
  public generateKey(notes: string, jurisdiction: string, provider: string, modelName: string, constitutionVersion: string): string {
    const rawString = `${notes.trim()}|${jurisdiction}|${provider}|${modelName}|${constitutionVersion}`;
    return crypto.createHash("sha256").update(rawString).digest("hex");
  }

  /**
   * Retrieves a compiled blueprint from cache if present
   */
  public get(key: string): any | null {
    const entry = this.cache.get(key);
    if (entry) {
      this.hitsCount++;
      entry.hits++;
      entry.lastAccessed = new Date().toISOString();
      
      // Move to end to preserve LRU ordering
      this.cache.delete(key);
      this.cache.set(key, entry);

      this.latencySavedMs += entry.latencyMs;
      return entry.data;
    }
    this.missesCount++;
    return null;
  }

  /**
   * Stores a compiled blueprint into the cache using LRU eviction if full
   */
  public set(key: string, data: any, modelName: string, jurisdiction: string, latencyMs: number): void {
    // If key already exists, delete it first to refresh position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry (the first key in Map)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.fetchLatencyHistory.push(latencyMs);
    if (this.fetchLatencyHistory.length > 50) {
      this.fetchLatencyHistory.shift();
    }

    const now = new Date().toISOString();
    this.cache.set(key, {
      key,
      data,
      modelName,
      jurisdiction,
      timestamp: now,
      lastAccessed: now,
      hits: 0,
      latencyMs
    });
  }

  /**
   * Returns complete telemetry and metrics on cache performance
   */
  public getStats(): CacheStats {
    const totalFetches = this.fetchLatencyHistory.length;
    const avgLatency = totalFetches > 0 
      ? Math.round(this.fetchLatencyHistory.reduce((a, b) => a + b, 0) / totalFetches)
      : 0;

    const items = Array.from(this.cache.values()).map(entry => ({
      key: entry.key,
      modelName: entry.modelName,
      jurisdiction: entry.jurisdiction,
      timestamp: entry.timestamp,
      lastAccessed: entry.lastAccessed,
      hits: entry.hits,
      latencyMs: entry.latencyMs
    }));

    return {
      hits: this.hitsCount,
      misses: this.missesCount,
      totalLatencySavedMs: this.latencySavedMs,
      averageFetchLatencyMs: avgLatency,
      keysCount: this.cache.size,
      items
    };
  }

  /**
   * Purges the entire cache for full blueprint recompilation
   */
  public clear(): void {
    this.cache.clear();
    this.hitsCount = 0;
    this.missesCount = 0;
    this.latencySavedMs = 0;
    this.fetchLatencyHistory = [];
  }
}

export const cacheManager = new ApexCacheManager();
