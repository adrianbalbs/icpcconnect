import { v4 as uuidv4 } from "uuid";
import request from "supertest";
import express from "express";
import {
  Database,
  DatabaseConnection,
  seed,
  universities,
  users,
  teams,
} from "../../db/index.js";
import {
  CreateTeamRequest,
  UpdateTeamRequest,
} from "../../schemas/team-schema.js";
import { TeamService } from "../../services/index.js";
import { badRequest, HTTPError } from "../../utils/errors.js";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { setupTestDatabase, dropTestDatabase } from "../db-test-helpers.js";
import { teamRouter } from "../../routers/team-router.js";

let db: DatabaseConnection;
let teamService: TeamService;
let app: ReturnType<typeof express>;

beforeAll(async () => {
  const dbSetup = await setupTestDatabase();
  db = dbSetup.db;
  app = express()
    .use(express.json())
    .use("/api", teamRouter(new TeamService(db)));
});

afterAll(async () => {
  await dropTestDatabase();
});

describe("TeamService tests", () => {
  it("Should register a new team", async () => {
    const req: CreateTeamRequest = {
      name: "epicTeam",
      university: 1,
      memberIds: [],
    };

    const result = await request(app)
      .post("/api/teams/register")
      .send(req)
      .expect(200);

    expect(result.body.teamId).not.toBeNull();
  });

  it("Should get the teams's details with a uuid", async () => {
    const req: CreateTeamRequest = {
      name: "epicTeam",
      university: 1,
      memberIds: [],
    };

    const res = await request(app)
      .post("/api/teams/register")
      .send(req)
      .expect(200);

    const result = await request(app)
      .get(`/api/teams/${res.body.teamId}`)
      .expect(200);
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
    const uuid = uuidv4();

    await expect(teamService.deleteTeam(uuid)).rejects.toThrow();
  });
});
