import fs from "fs";
import path from "path";
import crypto from "crypto";

// Try conditionally using BullMQ and IORedis when available and Redis daemon is reachable
let BullMQQueue: any = null;
let BullMQWorker: any = null;
let IORedis: any = null;

try {
  const bullmq = require("bullmq");
  BullMQQueue = bullmq.Queue;
  BullMQWorker = bullmq.Worker;
} catch (e) {
  console.warn("[DurableJobQueue] BullMQ library not found, using disk-backed fallback engine.");
}

try {
  const ioredis = require("ioredis");
  IORedis = ioredis.default || ioredis;
} catch (e) {
  console.warn("[DurableJobQueue] IORedis library not found.");
}

export interface DurableJobRecord {
  id: string;
  type: string;
  status: "waiting" | "active" | "completed" | "failed" | "delayed" | "cancelled";
  progress: number; // 0 to 100
  data: any;
  result?: any;
  error?: string;
  logs: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  engine: "bullmq_redis" | "durable_local_fallback";
}

export type JobProcessor = (
  jobId: string,
  data: any,
  updateProgress: (pct: number, logMessage?: string) => Promise<void>
) => Promise<any>;

/**
 * Durable Job Queue Service
 * Moves long-running operations (like blueprint generation & command execution)
 * out of the main request-response thread.
 * Utilizes BullMQ/Redis when reachable, or a resilient persistent SQLite/Filesystem
 * fallback engine when running in isolated containers.
 */
export class DurableJobQueueService {
  private static isInitialized = false;
  private static useRedis = false;
  private static redisClient: any = null;
  private static bullQueue: any = null;
  private static bullWorker: any = null;
  
  // In-memory & filesystem durable storage for standalone / fallback mode
  private static fallbackJobs = new Map<string, DurableJobRecord>();
  private static storagePath = path.join(process.cwd(), ".abide", "durable-jobs.json");
  private static processors = new Map<string, JobProcessor>();
  private static isProcessingFallback = false;

  public static async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Ensure storage directory exists for fallback persistence
    const dir = path.dirname(this.storagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.loadFallbackFromDisk();

    // 2. Try testing Redis connection if BullMQ & IORedis are available
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST;
    if (BullMQQueue && IORedis && redisUrl) {
      try {
        console.log(`[DurableJobQueue] Testing connection to Redis at ${redisUrl}...`);
        const client = new IORedis(redisUrl, {
          maxRetriesPerRequest: 1,
          connectTimeout: 2000,
          retryStrategy: () => null // Don't retry infinitely if offline
        });

        await new Promise((resolve, reject) => {
          client.once("ready", resolve);
          client.once("error", reject);
        });

        this.redisClient = client;
        this.useRedis = true;
        
        // Initialize BullMQ Queue
        this.bullQueue = new BullMQQueue("abide-durable-tasks", { connection: this.redisClient });
        console.log(`[DurableJobQueue] Connected to Redis! BullMQ Durable Queue active.`);
      } catch (err) {
        console.warn(`[DurableJobQueue] Redis connection failed (${err}). Switching to Durable Filesystem Fallback Engine.`);
        this.useRedis = false;
      }
    } else {
      console.log(`[DurableJobQueue] REDIS_URL not configured. Operating in Durable Local Filesystem Fallback mode.`);
    }

    // 3. Start fallback processing loop for any queued local jobs
    setInterval(() => {
      this.processNextFallbackJob();
    }, 100);
  }

  /**
   * Register a worker processor for a specific job type
   */
  public static registerWorker(type: string, processor: JobProcessor): void {
    this.processors.set(type, processor);

    // If using BullMQ, register a worker instance
    if (this.useRedis && BullMQWorker && !this.bullWorker) {
      this.bullWorker = new BullMQWorker(
        "abide-durable-tasks",
        async (job: any) => {
          const proc = this.processors.get(job.name);
          if (!proc) {
            throw new Error(`No processor registered for job type: ${job.name}`);
          }
          return proc(job.id, job.data, async (pct: number, logMsg?: string) => {
            await job.updateProgress(pct);
            if (logMsg) await job.log(logMsg);
          });
        },
        { connection: this.redisClient }
      );

      this.bullWorker.on("completed", (job: any, returnvalue: any) => {
        console.log(`[BullMQ Worker] Job ${job.id} (${job.name}) completed successfully.`);
      });

      this.bullWorker.on("failed", (job: any, err: any) => {
        console.error(`[BullMQ Worker] Job ${job?.id} (${job?.name}) failed:`, err);
      });
    }
  }

  /**
   * Enqueue a job into the durable queue
   */
  public static async enqueueJob(
    type: string,
    data: any,
    options?: { priority?: number; delay?: number; jobId?: string; initiator?: string }
  ): Promise<DurableJobRecord> {
    await this.init();
    const jobId = options?.jobId || `job_${type}_${crypto.randomBytes(4).toString("hex")}`;
    const now = new Date().toISOString();

    if (this.useRedis && this.bullQueue) {
      const bullJob = await this.bullQueue.add(type, data, {
        jobId,
        priority: options?.priority,
        delay: options?.delay
      });
      
      const record: DurableJobRecord = {
        id: bullJob.id || jobId,
        type,
        status: "waiting",
        progress: 0,
        data,
        logs: [`[${now}] Job submitted to BullMQ queue over Redis.`],
        createdAt: now,
        engine: "bullmq_redis"
      };
      return record;
    } else {
      // Durable local fallback engine
      const record: DurableJobRecord = {
        id: jobId,
        type,
        status: options?.delay && options.delay > 0 ? "delayed" : "waiting",
        progress: 0,
        data,
        logs: [`[${now}] Job enqueued in Durable Filesystem Engine (${options?.initiator || "System"}).`],
        createdAt: now,
        engine: "durable_local_fallback"
      };

      this.fallbackJobs.set(jobId, record);
      this.saveFallbackToDisk();

      if (options?.delay && options.delay > 0) {
        setTimeout(() => {
          const j = this.fallbackJobs.get(jobId);
          if (j && j.status === "delayed") {
            j.status = "waiting";
            j.logs.push(`[${new Date().toISOString()}] Delay elapsed, job transitioned to waiting.`);
            this.saveFallbackToDisk();
          }
        }, options.delay);
      }

      return record;
    }
  }

  /**
   * Get job status and details
   */
  public static async getJob(jobId: string): Promise<DurableJobRecord | null> {
    await this.init();

    if (this.useRedis && this.bullQueue) {
      try {
        const job = await this.bullQueue.getJob(jobId);
        if (!job) return null;

        const state = await job.getState();
        const logs = await this.bullQueue.getJobLogs(jobId);
        const progress = typeof job.progress === "number" ? job.progress : 0;

        return {
          id: job.id || jobId,
          type: job.name,
          status: this.mapBullState(state),
          progress,
          data: job.data,
          result: job.returnvalue,
          error: job.failedReason,
          logs: logs?.logs || [],
          createdAt: new Date(job.timestamp).toISOString(),
          startedAt: job.processedOn ? new Date(job.processedOn).toISOString() : undefined,
          completedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : undefined,
          engine: "bullmq_redis"
        };
      } catch (err) {
        console.error(`[DurableJobQueue] Error fetching BullMQ job ${jobId}:`, err);
        return null;
      }
    } else {
      return this.fallbackJobs.get(jobId) || null;
    }
  }

  /**
   * List all jobs in the queue with optional filtering
   */
  public static async listJobs(filter?: { type?: string; status?: string; limit?: number }): Promise<DurableJobRecord[]> {
    await this.init();

    if (this.useRedis && this.bullQueue) {
      try {
        const types: any[] = filter?.status ? [this.unmapBullState(filter.status)] : ["waiting", "active", "completed", "failed", "delayed"];
        const jobs = await this.bullQueue.getJobs(types, 0, filter?.limit || 50);
        
        const records: DurableJobRecord[] = [];
        for (const job of jobs) {
          if (!job) continue;
          if (filter?.type && job.name !== filter.type) continue;
          const state = await job.getState();
          const progress = typeof job.progress === "number" ? job.progress : 0;
          records.push({
            id: job.id || "unknown",
            type: job.name,
            status: this.mapBullState(state),
            progress,
            data: job.data,
            result: job.returnvalue,
            error: job.failedReason,
            logs: [],
            createdAt: new Date(job.timestamp).toISOString(),
            startedAt: job.processedOn ? new Date(job.processedOn).toISOString() : undefined,
            completedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : undefined,
            engine: "bullmq_redis"
          });
        }
        return records;
      } catch (err) {
        console.error(`[DurableJobQueue] Error listing BullMQ jobs:`, err);
        return [];
      }
    } else {
      let list = Array.from(this.fallbackJobs.values());
      if (filter?.type) {
        list = list.filter(j => j.type === filter.type);
      }
      if (filter?.status) {
        list = list.filter(j => j.status === filter.status);
      }
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      if (filter?.limit) {
        list = list.slice(0, filter.limit);
      }
      return list;
    }
  }

  /**
   * Cancel a job
   */
  public static async cancelJob(jobId: string): Promise<boolean> {
    await this.init();

    if (this.useRedis && this.bullQueue) {
      try {
        const job = await this.bullQueue.getJob(jobId);
        if (job) {
          await job.remove();
          return true;
        }
        return false;
      } catch (err) {
        return false;
      }
    } else {
      const job = this.fallbackJobs.get(jobId);
      if (!job) return false;
      if (job.status === "waiting" || job.status === "active" || job.status === "delayed") {
        job.status = "cancelled";
        job.completedAt = new Date().toISOString();
        job.logs.push(`[${job.completedAt}] Job cancelled by request.`);
        this.saveFallbackToDisk();
        return true;
      }
      return false;
    }
  }

  /**
   * Get queue statistics
   */
  public static async getStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    engine: "bullmq_redis" | "durable_local_fallback";
  }> {
    await this.init();

    if (this.useRedis && this.bullQueue) {
      try {
        const counts = await this.bullQueue.getJobCounts("waiting", "active", "completed", "failed");
        return {
          waiting: counts.waiting || 0,
          active: counts.active || 0,
          completed: counts.completed || 0,
          failed: counts.failed || 0,
          engine: "bullmq_redis"
        };
      } catch (err) {
        return { waiting: 0, active: 0, completed: 0, failed: 0, engine: "bullmq_redis" };
      }
    } else {
      let waiting = 0, active = 0, completed = 0, failed = 0;
      for (const job of this.fallbackJobs.values()) {
        if (job.status === "waiting" || job.status === "delayed") waiting++;
        else if (job.status === "active") active++;
        else if (job.status === "completed") completed++;
        else if (job.status === "failed" || job.status === "cancelled") failed++;
      }
      return { waiting, active, completed, failed, engine: "durable_local_fallback" };
    }
  }

  /**
   * Helper to wait for a job result (useful for moving synchronous route handlers
   * out of thread into background workers while maintaining synchronous response compatibility)
   */
  public static async waitForJobResult(jobId: string, timeoutMs: number = 30000): Promise<any> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const job = await this.getJob(jobId);
      if (!job) throw new Error(`Job ${jobId} not found.`);
      if (job.status === "completed") return job.result;
      if (job.status === "failed") throw new Error(job.error || "Job failed during execution.");
      if (job.status === "cancelled") throw new Error("Job was cancelled.");
      
      await new Promise(r => setTimeout(r, 100));
    }
    throw new Error(`Timeout waiting for job ${jobId} to complete after ${timeoutMs}ms.`);
  }

  // --- Internal Fallback Engine Processing ---

  private static async processNextFallbackJob(): Promise<void> {
    if (this.isProcessingFallback) return;
    this.isProcessingFallback = true;

    try {
      // Find the oldest waiting job
      let nextJob: DurableJobRecord | null = null;
      for (const job of this.fallbackJobs.values()) {
        if (job.status === "waiting") {
          if (!nextJob || job.createdAt < nextJob.createdAt) {
            nextJob = job;
          }
        }
      }

      if (!nextJob) return;

      const processor = this.processors.get(nextJob.type);
      if (!processor) {
        nextJob.status = "failed";
        nextJob.error = `No worker registered for job type '${nextJob.type}'`;
        nextJob.completedAt = new Date().toISOString();
        nextJob.logs.push(`[${nextJob.completedAt}] ERROR: ${nextJob.error}`);
        this.saveFallbackToDisk();
        return;
      }

      // Execute job in background
      nextJob.status = "active";
      nextJob.startedAt = new Date().toISOString();
      nextJob.logs.push(`[${nextJob.startedAt}] Worker picked up job for processing.`);
      this.saveFallbackToDisk();

      const jobId = nextJob.id;
      const updateProgress = async (pct: number, logMsg?: string) => {
        const j = this.fallbackJobs.get(jobId);
        if (j && j.status === "active") {
          j.progress = Math.max(0, Math.min(100, pct));
          if (logMsg) {
            j.logs.push(`[${new Date().toISOString()}] ${logMsg}`);
          }
          this.saveFallbackToDisk();
        }
      };

      try {
        const result = await processor(nextJob.id, nextJob.data, updateProgress);
        const j = this.fallbackJobs.get(jobId);
        if (j && j.status === "active") {
          j.status = "completed";
          j.progress = 100;
          j.result = result;
          j.completedAt = new Date().toISOString();
          j.logs.push(`[${j.completedAt}] Job completed successfully.`);
          this.saveFallbackToDisk();
        }
      } catch (err: any) {
        const j = this.fallbackJobs.get(jobId);
        if (j && j.status === "active") {
          j.status = "failed";
          j.error = err.message || String(err);
          j.completedAt = new Date().toISOString();
          j.logs.push(`[${j.completedAt}] JOB FAILED: ${j.error}`);
          this.saveFallbackToDisk();
        }
      }
    } finally {
      this.isProcessingFallback = false;
    }
  }

  private static saveFallbackToDisk(): void {
    try {
      const obj: Record<string, DurableJobRecord> = {};
      for (const [id, job] of this.fallbackJobs.entries()) {
        obj[id] = job;
      }
      fs.writeFileSync(this.storagePath, JSON.stringify(obj, null, 2), "utf8");
    } catch (err) {
      console.error("[DurableJobQueue] Failed to persist fallback jobs to disk:", err);
    }
  }

  private static loadFallbackFromDisk(): void {
    try {
      if (fs.existsSync(this.storagePath)) {
        const raw = fs.readFileSync(this.storagePath, "utf8");
        const obj = JSON.parse(raw);
        for (const [id, job] of Object.entries(obj)) {
          const rec = job as DurableJobRecord;
          // If a job was 'active' when server restarted, revert to 'waiting' or mark failed
          if (rec.status === "active") {
            rec.status = "waiting";
            rec.logs.push(`[${new Date().toISOString()}] Re-queued after server restart.`);
          }
          this.fallbackJobs.set(id, rec);
        }
      }
    } catch (err) {
      console.error("[DurableJobQueue] Failed to load fallback jobs from disk:", err);
    }
  }

  private static mapBullState(state: string): DurableJobRecord["status"] {
    switch (state) {
      case "active": return "active";
      case "completed": return "completed";
      case "failed": return "failed";
      case "delayed": return "delayed";
      case "waiting":
      case "prioritized": return "waiting";
      default: return "waiting";
    }
  }

  private static unmapBullState(status: string): string {
    switch (status) {
      case "active": return "active";
      case "completed": return "completed";
      case "failed": return "failed";
      case "delayed": return "delayed";
      default: return "waiting";
    }
  }
}
