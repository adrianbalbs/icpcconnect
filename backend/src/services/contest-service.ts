import { DatabaseConnection } from "../db/database.js";
import z from "zod";
import { contests, universities } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { badRequest, HTTPError, notFoundError } from "../utils/errors.js";
import { DeleteResponse } from "../types/api-res.js";

export const CreateContestRequestSchema = z.strictObject({
  name: z.string().min(1),
  description: z.string().default(""),
  earlyBirdDate: z.date(),
  cutoffDate: z.date(),
  contestDate: z.date(),
  site: z.number(),
});
export type CreateContestRequest = z.infer<typeof CreateContestRequestSchema>;

export const UpdateContestRequestSchema = CreateContestRequestSchema.partial();
export type UpdateContestRequest = z.infer<typeof UpdateContestRequestSchema>;
export type UpdateContestResponse = UpdateContestRequest;

export type GetContestResponse = {
  id: string;
  description: string;
  earlyBirdDate: Date;
  cutoffDate: Date;
  contestDate: Date;
  site: string;
};

export class ContestService {
  constructor(private readonly db: DatabaseConnection) {}

  async create(req: CreateContestRequest): Promise<{ id: string }> {
    const [{ id }] = await this.db
      .insert(contests)
      .values(req)
      .returning({ id: contests.id });
    return { id };
  }

  async get(contestId: string): Promise<GetContestResponse> {
    const [contest] = await this.db
      .select({
        id: contests.id,
        description: contests.description,
        earlyBirdDate: contests.earlyBirdDate,
        cutoffDate: contests.cutoffDate,
        contestDate: contests.contestDate,
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
    req: UpdateContestRequest,
  ): Promise<UpdateContestResponse> {
    if (Object.keys(req).length > 0) {
      await this.db.update(contests).set(req).where(eq(contests.id, contestId));
    }
    return req;
  }
}
