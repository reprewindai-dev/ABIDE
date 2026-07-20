import crypto from "crypto";
import Redis from "ioredis";

export interface CacheStats {
  hits: number;
  misses: number;
  totalLatencySavedMs: number;
  averageFetchLatencyMs: number;
  keysCount: number;
  engine: "REDIS" | "MEMORY" | "HYBRID";
  redisStatus: "CONNECTED" | "OFFLINE" | "DISABLED";
  redisUrl?: string;
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

  // Redis instance attributes
  private redisClient: Redis | null = null;
  private isRedisDisabled = false;
  private isRedisConnected = false;
  private resolvedRedisUrl = "";

  constructor(maxEntries = 100) {
    this.maxEntries = maxEntries;
    this.initializeRedis();
  }

  /**
   * Safe initialization of lazy Redis driver to prevent application startup crashes
   */
  private initializeRedis(): void {
    const url = process.env.REDIS_URL || process.env.REDIS_HOST;
    if (!url) {
      this.isRedisDisabled = true;
      console.log("[Cache Engine] REDIS_URL not configured. Operating in high-performance MEMORY-LRU mode.");
      return;
    }

    this.resolvedRedisUrl = url;
    try {
      // Connect with short connection/command timeouts so it fails fast rather than hanging the compiler
      this.redisClient = new Redis(url, {
        connectTimeout: 1500,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 2) {
            console.warn("[Cache Engine] Redis connection failed repeatedly. Falling back to local LRU memory.");
            this.isRedisConnected = false;
            return null; // Stop retrying
          }
          return 500;
        }
      });

      this.redisClient.on("connect", () => {
        this.isRedisConnected = true;
        console.log(`[Cache Engine] Connected to Redis strategically at ${this.resolvedRedisUrl.replace(/:[^:@]+@/, ":****@")}`);
      });

      this.redisClient.on("error", (err) => {
        this.isRedisConnected = false;
        // Suppress noise in logs but log the state change
        // console.warn("[Cache Engine] Redis Client Error:", err.message);
      });
    } catch (error: any) {
      console.warn("[Cache Engine] Redis Initialization exception. Falling back to memory-LRU:", error.message);
      this.isRedisConnected = false;
    }
  }

  /**
   * Generates a deterministic hash key for caching compiled blueprints
   */
  public generateKey(notes: string, jurisdiction: string, provider: string, modelName: string, constitutionVersion: string): string {
    const rawString = `${notes.trim()}|${jurisdiction}|${provider}|${modelName}|${constitutionVersion}`;
    return crypto.createHash("sha256").update(rawString).digest("hex");
  }

  /**
   * Retrieves a compiled blueprint from cache if present.
   * Checks local memory LRU first (fast path). On a local miss, if Redis is connected,
   * checks Redis before declaring a real miss — this is what actually makes multi-instance
   * deployments share cache hits instead of each instance only ever seeing its own memory.
   */
  public async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    if (entry) {
      this.hitsCount++;
      entry.hits++;
      entry.lastAccessed = new Date().toISOString();

      // Move to end to preserve LRU ordering
      this.cache.delete(key);
      this.cache.set(key, entry);

      this.latencySavedMs += entry.latencyMs;

      // Async sync back to Redis if connected (refresh TTL)
      this.syncToRedisAsync(key, entry);

      return entry.data;
    }

    // Local miss — check Redis before giving up, so other instances' writes are visible here.
    if (this.isRedisConnected && this.redisClient) {
      const hydrated = await this.hydrateFromRedis(key);
      if (hydrated) {
        this.hitsCount++;
        const redisEntry = this.cache.get(key);
        if (redisEntry) {
          this.latencySavedMs += redisEntry.latencyMs;
        }
        return redisEntry?.data ?? null;
      }
    }

    this.missesCount++;
    return null;
  }

  /**
   * Stores a compiled blueprint into the cache using LRU eviction if full.
   * Write-Through to Redis asynchronously.
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
    const entry: CacheEntry = {
      key,
      data,
      modelName,
      jurisdiction,
      timestamp: now,
      lastAccessed: now,
      hits: 0,
      latencyMs
    };

    this.cache.set(key, entry);

    // Sync write-through to Redis asynchronously
    this.syncToRedisAsync(key, entry);
  }

  /**
   * Asynchronous non-blocking synchronization to Redis
   */
  private async syncToRedisAsync(key: string, entry: CacheEntry): Promise<void> {
    if (!this.isRedisConnected || !this.redisClient) return;
    try {
      // Store compiled blueprint with a 24-hour expiration TTL (86400 seconds)
      await this.redisClient.set(
        `apex:blueprint:${key}`,
        JSON.stringify(entry),
        "EX",
        86400
      );
    } catch (err: any) {
      // Silent catch to prevent background crashes
    }
  }

  /**
   * Hydrates memory cache from Redis in the background (used during async operations)
   */
  public async hydrateFromRedis(key: string): Promise<boolean> {
    if (!this.isRedisConnected || !this.redisClient) return false;
    try {
      const dataStr = await this.redisClient.get(`apex:blueprint:${key}`);
      if (dataStr) {
        const entry: CacheEntry = JSON.parse(dataStr);
        this.cache.set(key, entry);
        return true;
      }
    } catch (err) {
      // Fail silently
    }
    return false;
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
      engine: this.isRedisConnected ? "HYBRID" : "MEMORY",
      redisStatus: this.isRedisDisabled ? "DISABLED" : (this.isRedisConnected ? "CONNECTED" : "OFFLINE"),
      redisUrl: this.isRedisDisabled ? undefined : this.resolvedRedisUrl.replace(/:[^:@]+@/, ":****@"),
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

    // Async clear Redis keys in background
    if (this.isRedisConnected && this.redisClient) {
      this.redisClient.keys("apex:blueprint:*").then((keys) => {
        if (keys.length > 0 && this.redisClient) {
          this.redisClient.del(...keys).catch(() => {});
        }
      }).catch(() => {});
    }
  }
}

export const cacheManager = new ApexCacheManager();
