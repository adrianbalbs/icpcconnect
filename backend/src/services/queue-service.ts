import { Queue, Worker } from "bullmq";
import dotenv from "dotenv";
import { AlgorithmService } from "./algorithm-service.js";
import { getLogger } from "../utils/logger.js";

dotenv.config();

export class JobQueue {
  private readonly logger = getLogger();
  readonly queue = new Queue("algorithm-scheduler", {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  });
  private readonly worker = new Worker(
    "algorithm-scheduler",
    async (job) => {
      await this.algorithmService.callAlgorithm(job.data.contestId);
      this.logger.info(`Algorithm finished running`);
    },
    {
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT) || 6739,
      },
    },
  );

  constructor(private readonly algorithmService: AlgorithmService) {
    this.worker.on("completed", (job) => {
      this.logger.info(`Job ${job.id} has completed`);
    });

    this.worker.on("failed", (job, err) => {
      this.logger.info(`Job ${job?.id} has failed with ${err.message}`);
    });
  }

  private calculateDelay(targetDate: Date) {
    return Number(targetDate) - Date.now();
  }

  async addJob(contestId: string, earlyBirdDate: Date, cutoffDate: Date) {
    const earlyBirdDelay = this.calculateDelay(earlyBirdDate);
    await this.queue.add(
      "Early Bird Team Formation",
      { contestId },
      { delay: earlyBirdDelay, jobId: contestId + ":early" },
    );

    const cutoffDelay = this.calculateDelay(cutoffDate);

    await this.queue.add(
      "Final Team Formation",
      { contestId },
      { delay: cutoffDelay, jobId: contestId + ":cutoff" },
    );
    this.logger.info(`Job ${contestId} added to queue`);
  }

  async removeJob(contestId: string) {
    const earlyBirdJob = await this.queue.getJob(contestId + ":early");
    await earlyBirdJob?.remove();
    const cutoffJob = await this.queue.getJob(contestId + ":cutoff");
    await cutoffJob?.remove();
    this.logger.info(`Job ${contestId} removed from queue`);
  }
}
