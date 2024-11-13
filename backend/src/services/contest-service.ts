import { DatabaseConnection } from "../db/database.js";
import z from "zod";
import { contests, universities } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { badRequest, HTTPError, notFoundError } from "../utils/errors.js";
import { DeleteResponse } from "../types/api-res.js";
import { JobQueue } from "./queue-service.js";

export const CreateContestSchema = z
  .strictObject({
    name: z.string().min(5),
    earlyBirdDate: z
      .string()
      .transform((dateStr) => new Date(dateStr))
      .refine((date) => date > new Date(), {
        message: "Early Bird Date must be in the future",
      }),
    cutoffDate: z
      .string()
      .transform((dateStr) => new Date(dateStr))
      .refine((date) => date > new Date(), {
        message: "Cutoff Date must be in the future",
      }),
    contestDate: z
      .string()
      .transform((dateStr) => new Date(dateStr))
      .refine((date) => date > new Date(), {
        message: "Contest Date must be in the future",
      }),
    site: z.number(),
  })
  .refine((data) => data.earlyBirdDate <= data.cutoffDate, {
    message: "Early Bird Date should be before Cutoff Date",
    path: ["earlyBirdDate"],
  })
  .refine((data) => data.cutoffDate <= data.contestDate, {
    message: "Cutoff Date should be before Contest Date",
    path: ["cutoffDate"],
  });

export type CreateContest = z.infer<typeof CreateContestSchema>;
export const UpdateContestSchema = CreateContestSchema;
export type UpdateContest = z.infer<typeof UpdateContestSchema>;
export type UpdateContestResponse = UpdateContest;

export type GetContestResponse = {
  id: string;
  name: string;
  earlyBirdDate: Date;
  cutoffDate: Date;
  contestDate: Date;
  siteId: number;
  site: string;
};

export class ContestService {
  constructor(
    private readonly db: DatabaseConnection,
    private readonly jobQueue: JobQueue,
  ) {}

  async create(req: CreateContest): Promise<{ id: string }> {
    const [res] = await this.db
      .insert(contests)
      .values({
        ...req,
        earlyBirdDate: new Date(req.earlyBirdDate),
        cutoffDate: new Date(req.cutoffDate),
        contestDate: new Date(req.contestDate),
      })
      .returning({ id: contests.id, cutoffDate: contests.cutoffDate });

    await this.jobQueue.addJob(res.id, res.cutoffDate);
    return { id: res.id };
  }

  async get(contestId: string): Promise<GetContestResponse> {
    const [contest] = await this.db
      .select({
        id: contests.id,
        name: contests.name,
        earlyBirdDate: contests.earlyBirdDate,
        cutoffDate: contests.cutoffDate,
        contestDate: contests.contestDate,
        siteId: universities.id,
        site: universities.name,
      })
      .from(contests)
      .innerJoin(universities, eq(contests.site, universities.id))
      .where(eq(contests.id, contestId))
      .limit(1);

    if (!contest) {
      throw new HTTPError(notFoundError);
    }
    return contest;
  }

  async getAll(): Promise<{ allContests: GetContestResponse[] }> {
    const allContests = await this.db
      .select({
        id: contests.id,
        name: contests.name,
        earlyBirdDate: contests.earlyBirdDate,
        cutoffDate: contests.cutoffDate,
        contestDate: contests.contestDate,
        siteId: universities.id,
        site: universities.name,
      })
      .from(contests)
      .innerJoin(universities, eq(contests.site, universities.id));

    return { allContests };
  }

  async delete(contestId: string): Promise<DeleteResponse> {
    const [contest] = await this.db
      .select()
      .from(contests)
      .innerJoin(universities, eq(contests.site, universities.id))
      .where(eq(contests.id, contestId))
      .limit(1);

    if (!contest) {
      throw new HTTPError(badRequest);
    }

    await this.db.delete(contests).where(eq(contests.id, contestId));
    await this.jobQueue.removeJob(contestId);
    return { status: "OK" };
  }

  async update(
    contestId: string,
    req: UpdateContest,
  ): Promise<UpdateContestResponse> {
    const [res] = await this.db
      .update(contests)
      .set({
        ...req,
        earlyBirdDate: new Date(req.earlyBirdDate),
        cutoffDate: new Date(req.cutoffDate),
        contestDate: new Date(req.contestDate),
      })
      .where(eq(contests.id, contestId))
      .returning({ id: contests.id, cutoffDate: contests.cutoffDate });

    await this.jobQueue.removeJob(res.id);
    await this.jobQueue.addJob(res.id, res.cutoffDate);
    return req;
  }
}
