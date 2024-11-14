import { DatabaseConnection } from "../db/database.js";
import z from "zod";
import { contests, universities } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { badRequest, HTTPError, notFoundError } from "../utils/errors.js";
import { DeleteResponse } from "../types/api-res.js";
import {
  CreateContest,
  GetContestResponse,
  UpdateContestResponse,
  UpdateContest,
} from "../schemas/index.js";


export class ContestService {
  constructor(private readonly db: DatabaseConnection) {}

  async create(req: CreateContest): Promise<{ id: string }> {
    const [res] = await this.db
      .insert(contests)
      .values({
        ...req,
        earlyBirdDate: new Date(req.earlyBirdDate),
        cutoffDate: new Date(req.cutoffDate),
        contestDate: new Date(req.contestDate),
      })
      .returning({ id: contests.id });
    return res;
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
    return { status: "OK" };
  }

  async update(
    contestId: string,
    req: UpdateContest,
  ): Promise<UpdateContestResponse> {
    await this.db
      .update(contests)
      .set({
        ...req,
        earlyBirdDate: new Date(req.earlyBirdDate),
        cutoffDate: new Date(req.cutoffDate),
        contestDate: new Date(req.contestDate),
      })
      .where(eq(contests.id, contestId));
    return req;
  }
}
