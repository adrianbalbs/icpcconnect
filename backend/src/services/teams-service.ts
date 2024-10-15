import { eq } from "drizzle-orm";
import {
  DatabaseConnection,
} from "../db/index.js";
import {
    CreateTeamRequest,
    UpdateTeamRequest
} from "../schemas/index.js";
import {
    GetTeamsResponse,
    NewTeamResponse
} from "../interfaces/api-res-interfaces.js";

export class TeamsService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async createTeam(req: CreateTeamRequest): Promise<NewTeamResponse> {

    return {
        id: -1,
        stuIds: [-1, -2, -3]
     };
  }

  async updateTeam(teamId: string, req: UpdateTeamRequest): Promise<NewTeamResponse> {
    
    return {
        id: -1,
        stuIds: [-1, -2, -3]
     };
  }

  async getAllTeams(): Promise<GetTeamsResponse> {
    
    return { teams: [] };
  }

  async getTeamsFromSite(siteId: string): Promise<GetTeamsResponse> {

    return { teams: [] };
  }

  async getTeamsFromUni(uniId: string): Promise<GetTeamsResponse> {
    
    return { teams: [] };
  }
}
