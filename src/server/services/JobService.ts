import { DurableJobQueueService, JobProcessor } from "../../services/durable-job-queue";

export class JobService {
  private static initialized = false;

  /**
   * Initializes the durable job queue engine and registers core workers.
   */
  public static init(blueprintWorkerProcessor?: JobProcessor): void {
    if (this.initialized) return;
    DurableJobQueueService.init();
    if (blueprintWorkerProcessor) {
      DurableJobQueueService.registerWorker("blueprint_generation", async (jobId: string, data: any, updateProgress) => {
        await updateProgress(10, "Initializing blueprint compilation in worker pipeline...");
        return await blueprintWorkerProcessor(jobId, data, updateProgress);
      });
    }
    this.initialized = true;
  }

  public static registerWorker(type: string, processor: JobProcessor): void {
    DurableJobQueueService.registerWorker(type, processor);
  }

  public static async listJobs(filter?: { type?: string; status?: string; limit?: number }) {
    return await DurableJobQueueService.listJobs(filter);
  }

  public static async getJob(jobId: string) {
    return await DurableJobQueueService.getJob(jobId);
  }

  public static async enqueueJob(type: string, data: any, opts?: { priority?: number; delay?: number; initiator?: string; jobId?: string }) {
    return await DurableJobQueueService.enqueueJob(type, data, opts);
  }

  public static async cancelJob(jobId: string): Promise<boolean> {
    return await DurableJobQueueService.cancelJob(jobId);
  }

  public static async getStats() {
    return await DurableJobQueueService.getStats();
  }

  public static async waitForJobResult(jobId: string, timeoutMs: number = 60000) {
    return await DurableJobQueueService.waitForJobResult(jobId, timeoutMs);
  }
}
