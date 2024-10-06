import { eq } from "drizzle-orm";
import {
  DatabaseConnection,
  teams,
  students,
  universities,
} from "../db/index.js";
import {
  CreateTeamRequest,
  UpdateTeamRequest,
} from "../schemas/index.js";
import { badRequest, HTTPError } from "../utils/errors.js";
import { passwordUtils } from "../utils/encrypt.js";

export class TeamService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async createTeam(req: CreateTeamRequest) {
    return { teamId: 0 };
  }

  async getTeam(teamId: string) {
    const team = await this.db.query.teams.findFirst({
        where: eq(teams.id, teamId),
        columns: {university: false},
        with: {members: true, university: true}, 
      })

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

    return {
      id: teamId,
      university, 
      name,
      members: memberIds,
    };
  }

  async deleteTeam(teamId: string) {
    return { status: "OK" };
  }
}
