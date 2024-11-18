import { Queue, Worker } from "bullmq";
import dotenv from "dotenv";
import { AlgorithmService } from "./algorithm-service.js";
import { getLogger } from "../utils/logger.js";
import { env } from "../env.js";

dotenv.config();

export class JobQueue {
  private readonly logger = getLogger();
  readonly queue = new Queue("algorithm-scheduler", {
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
    },
  });
  private readonly worker = new Worker(
    "algorithm-scheduler",
    async (job) => {
      await this.algorithmService.run(job.data.contestId);
      this.logger.info(`Algorithm finished running`);
    },
    {
      connection: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
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

  /*
   * Add a contest to the job-queue, to run team-matching algorithm
   * on both the earlyBird and cutoff dates
   *
   * @param contestId - contest-id of the contest we are queueing
   * @param earlyBirdDate - The early-bird date of the contest, when the team-matching algo will first run
   * @param cutoffDate - Cut-off date for submissions, will re-run the team-mathching algo
   *
   */
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

  /*
   * Remove a contest's job from the job-queue
   *
   * @param contestId - contest-id of the contest we are removing
   *
   */
  async removeJob(contestId: string) {
    const earlyBirdJob = await this.queue.getJob(contestId + ":early");
    await earlyBirdJob?.remove();
    const cutoffJob = await this.queue.getJob(contestId + ":cutoff");
    await cutoffJob?.remove();
    this.logger.info(`Job ${contestId} removed from queue`);
  }
}
