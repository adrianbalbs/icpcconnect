import { DatabaseConnection } from "../db/database.js";
import { contests, studentDetails, teams, universities } from "../db/schema.js";
import { eq, inArray } from "drizzle-orm";
import { badRequest, HTTPError, notFoundError } from "../utils/errors.js";
import { DeleteResponse } from "../types/api-res.js";
import {
  CreateContest,
  GetContestResponse,
  UpdateContestResponse,
  UpdateContest,
} from "../schemas/index.js";
import { JobQueue } from "./queue-service.js";

export class ContestService {
  constructor(
    private readonly db: DatabaseConnection,
    private readonly jobQueue: JobQueue,
  ) {}

  /*
   * Create a new contest for students to participate in
   *
   * @param req -CreateContest
   *   req.name - name of contest
   *   req.earlyBirdDate -
   *   req.cutoffDate  - Cutoff for student applications
   *   req.contestDate - When the contest is running
   *   req.site - The university id corresponding to the site contest is held at
   *
   * @returns id - Internal id of the contest
   *
   */
  async create(req: CreateContest): Promise<{ id: string }> {
    const [res] = await this.db
      .insert(contests)
      .values({
        ...req,
        earlyBirdDate: new Date(req.earlyBirdDate),
        cutoffDate: new Date(req.cutoffDate),
        contestDate: new Date(req.contestDate),
      })
      .returning({
        id: contests.id,
        cutoffDate: contests.cutoffDate,
        earlyBirdDate: contests.earlyBirdDate,
      });

    await this.jobQueue.addJob(res.id, res.earlyBirdDate, res.cutoffDate);
    return { id: res.id };
  }

  /*
   * Get information about a given contest, given it's id
   *
   * @param contestId - id of the given contest
   *
   * @returns GetContestResponse
   *   response.id - Contest's Id
   *   response.name - Name of contest
   *   response.earlyBirdDate - EarlyBird date for team-matching
   *   response.cutoffDate - Cutoff date for applications
   *   response.contestDate - When contest is running
   *   response.siteId - Id of university contest is held at
   *   response.site - Name of universtiy contest is held at
   *
   * @throws NotFoundError
   *   - If contest-id is invalid / doesn't correspond to a contest
   *
   */
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

  /*
   * Get information about all currently registered contests
   *
   * @returns GetContestResponse[]
   *   response.id - Contest's Id
   *   response.name - Name of contest
   *   response.earlyBirdDate - EarlyBird date for team-matching
   *   response.cutoffDate - Cutoff date for applications
   *   response.contestDate - When contest is running
   *   response.siteId - Id of university contest is held at
   *   response.site - Name of universtiy contest is held at
   *
   */
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

  /*
   * Delete a contest, given it's associated id
   *
   * @param contestId - id of the given contest
   *
   * @returns DeleteResponse - wrapper around {status: "OK"}
   *
   * @throws BadRequest
   *   - If contest-id is invalid / doesn't correspond to a contest
   *
   */
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

    await this.db.transaction(async (tx) => {
      const contestTeams = await tx
        .select({ id: teams.id })
        .from(teams)
        .where(eq(teams.contest, contestId));

      await tx
        .update(studentDetails)
        .set({ team: null })
        .where(
          inArray(
            studentDetails.team,
            contestTeams.map((c) => c.id),
          ),
        );

      await tx.delete(contests).where(eq(contests.id, contestId));
      await this.jobQueue.removeJob(contestId);
    });
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
      .returning({
        id: contests.id,
        cutoffDate: contests.cutoffDate,
        earlyBirdDate: contests.earlyBirdDate,
      });

    await this.jobQueue.removeJob(res.id);
    await this.jobQueue.addJob(res.id, res.earlyBirdDate, res.cutoffDate);
    return req;
  }
}
