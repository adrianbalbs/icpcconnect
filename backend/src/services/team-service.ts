import { eq, inArray } from "drizzle-orm";
import {
  DatabaseConnection,
  teams,
  students,
} from "../db/index.js";
import {
  CreateTeamRequest,
  UpdateTeamRequest,
} from "../schemas/index.js";
import { badRequest, HTTPError } from "../utils/errors.js";

export class TeamService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async createTeam(req: CreateTeamRequest) {
    const {
      name,
      university,
    } = req;

    /*
    const members = await this.db
      .query.students.findMany({
        where: inArray(students.userId, memberIds)
      });
    */

    const [id] = await this.db 
      .insert(teams)
      .values({
        name,
        university,
     //   members,
      })
      .returning({teamId: teams.id})

    return id
  }

  async getTeam(teamId: string) {
    const team = await this.db.query.teams.findFirst({
        where: eq(teams.id, teamId),
        columns: {university: false},
        with: {members: true, university: true}, 
      })

    if (team == undefined) {
      throw new HTTPError(badRequest);
    }

    return team;
  }

  async getAllTeams() {
    return await this.db.query.teams.findMany({
        columns: {university: false},
        with: {members: true, university: true}, 
      })
  }

  async updateTeam(teamId: string, updatedDetails: UpdateTeamRequest) {
    const {
      university,
      name,
      memberIds,
    } = updatedDetails;

    const members = await this.db
      .query.students.findMany({
        where: inArray(students.userId, memberIds)
      });

    await this.db
      .update(teams)
      .set({ university, name })
      //.set({ university, name, members })
      .where(eq(teams.id, teamId));

    return {
      id: teamId,
      university, 
      name,
      members: members,
    };
  }

  async deleteTeam(teamId: string) {
    const [team] = await this.db
      .select({ teamId: teams.id })
      .from(teams)
      .where(eq(teams.id, teamId))

    if (!team) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: `Team with id: ${teamId} does not exist`,
      });
    }

    await this.db.delete(teams).where(eq(teams.id, teamId));
    return { status: "OK" };
  }
}
