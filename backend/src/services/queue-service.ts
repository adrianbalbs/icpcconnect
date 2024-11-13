import { Queue, Worker } from "bullmq";
import dotenv from "dotenv";
import { AlgorithmService } from "./algorithm-service.js";
import { getLogger } from "../utils/logger.js";

dotenv.config();

export class JobQueue {
  private readonly logger = getLogger();
  private readonly queue = new Queue("algorithm-scheduler", {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT) || 6739,
    },
  });
  private readonly worker = new Worker(
    "run-algorithm",
    async (job) => {
      await this.algorithmService.callAlgorithm(job.data.contestId);
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

  async addJob(contestId: string, cutoffDate?: Date) {
    const delay = cutoffDate
      ? Number(cutoffDate) - Number(new Date())
      : undefined;
    await this.queue.add(contestId, { contestId }, { delay, jobId: contestId });
  }

  async removeJob(contestId: string) {
    const job = await this.queue.getJob(contestId);
    await job?.remove();
  }
}
