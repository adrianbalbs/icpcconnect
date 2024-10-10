import { v4 as uuidv4 } from "uuid";
import {
  Database,
  DatabaseConnection,
  seed,
  universities,
  users,
  teams,
} from "../db/index.js";
import {
  CreateTeamRequest,
  UpdateTeamRequest,
} from "../schemas/team-schema.js";
import { TeamService } from "./index.js";
import { badRequest, HTTPError } from "../utils/errors.js";

let db: DatabaseConnection;
let teamService: TeamService;

beforeAll(async () => {
  db = Database.getConnection();
  await seed(db);
  teamService = new TeamService(db);
});

afterAll(async () => {
  await db.delete(teams)
  await db.delete(users);
  await db.delete(universities);
  Database.endConnection();
});

describe("TeamService tests", () => {
  it("Should register a new team", async () => {
    const req: CreateTeamRequest = {
      name: "epicTeam",
      university: 1,
      memberIds: [],
    };

    const result = await teamService.createTeam(req);
    expect(result.teamId).not.toBeNull();
  });

  it("Should get the teams's details with a uuid", async () => {
    const req: CreateTeamRequest = {
      name: "epicTeam",
      university: 1,
      memberIds: [],
    };

    const { teamId } = await teamService.createTeam(req);
    const result = await teamService.getTeam(teamId);
    expect(result).not.toBeNull();
  });

  it("Show throw an error if the team cannot be found by uuid", async () => {
    const teamId = uuidv4();
    await expect(teamService.getTeam(teamId)).rejects.toThrow(
      new HTTPError(badRequest),
    );
  });

  it("Should update the teams details", async () => {
    const team: CreateTeamRequest = {
      name: "epicTeam",
      university: 1,
      memberIds: [],
    };

    const { teamId } = await teamService.createTeam(team);
    const prevDetails = await teamService.getTeam(teamId);

    const req: UpdateTeamRequest = {
      name: "reallyEpicTeam",
      university: 1,
      memberIds: [],
    };
    const newDetails = await teamService.updateTeam(teamId, req);
    expect(newDetails).not.toEqual(prevDetails);
  });

  it("Should remove the team from the database", async () => {
    const req: CreateTeamRequest = {
      name: "epicTeam",
      university: 1,
      memberIds: [],
    };

    const { teamId } = await teamService.createTeam(req);
    const prev = await teamService.getTeam(teamId);
    expect(prev).not.toBeNull();

    await expect(teamService.deleteTeam(teamId)).resolves.toStrictEqual({
      status: "OK",
    });

    await expect(teamService.getTeam(teamId)).rejects.toThrow(
      new HTTPError(badRequest),
    );
  });

  it("Throw when deleting a team that does not exist", async () => {
    await expect(teamService.deleteTeam(uuidv4())).rejects.toThrow(
      new HTTPError(badRequest),
    );
  });
});
