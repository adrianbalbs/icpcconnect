import { v4 as uuidv4 } from "uuid";
import request, { Response } from "supertest";
import express from "express";
import { DatabaseConnection, users } from "../db/index.js";
import { CreateTeamRequest, UpdateTeamRequest } from "../schemas/index.js";
import {
  TeamService,
  AuthService,
  UserService,
  CodesService,
  ContestService,
  JobQueue,
} from "../services/index.js";
import {
  beforeAll,
  afterAll,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "vitest";
import { setupTestDatabase, dropTestDatabase } from "./db-test-helpers.js";
import {
  teamRouter,
  authRouter,
  userRouter,
  contestRouter,
} from "../routers/index.js";
import { errorHandlerMiddleware } from "../middleware/error-handler-middleware.js";
import cookieParser from "cookie-parser";
import { not, eq } from "drizzle-orm";
import { generateCreateUserFixture } from "./fixtures.js";
import { AlgorithmService } from "../services/algorithm-service.js";

describe("TeamService tests", () => {
  let db: DatabaseConnection;
  let app: ReturnType<typeof express>;
  let cookies: string;
  let contest: Response;

  beforeAll(async () => {
    const dbSetup = await setupTestDatabase();
    db = dbSetup.db;
    const authService = new AuthService(db);
    const codesService = new CodesService(db);
    const algorithmService = new AlgorithmService(db);
    app = express()
      .use(express.json())
      .use(cookieParser())
      .use("/api/auth", authRouter(authService))
      .use(
        "/api/users",
        userRouter(new UserService(db), authService, codesService),
      )
      .use("/api/teams", teamRouter(new TeamService(db), authService))

      .use(
        "/api/contests",
        contestRouter(
          new ContestService(db, new JobQueue(algorithmService)),
          authService,
        ),
      )
      .use(errorHandlerMiddleware);
  });

  beforeEach(async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@comp3900.com",
        password: "tomatofactory",
      })
      .expect(200);
    cookies = loginRes.headers["set-cookie"];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const contestDate = new Date();
    contestDate.setDate(contestDate.getDate() + 3);

    contest = await request(app)
      .post("/api/contests")
      .set("Cookie", cookies)
      .send({
        name: "Test Contest",
        earlyBirdDate: tomorrow,
        cutoffDate: dayAfterTomorrow,
        contestDate: contestDate,
        site: 1,
      })
      .expect(200);
  });

  afterEach(async () => {
    await db.delete(users).where(not(eq(users.email, "admin@comp3900.com")));
  });

  afterAll(async () => {
    await dropTestDatabase();
  });

  it("Should register a new team", async () => {
    const students = [
      generateCreateUserFixture({
        role: "Student",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        studentId: "z5397730",
        password: "helloworld",
        university: 1,
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "Test",
        familyName: "User",
        email: "testuser@comp3900.com",
        studentId: "z1234567",
        password: "helloworld",
        university: 1,
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "Test",
        familyName: "User2",
        email: "testuser2@comp3900.com",
        studentId: "z1234568",
        password: "helloworld",
        university: 1,
      }),
    ];

    const userIds: string[] = [];
    for (const student of students) {
      const res = await request(app)
        .post("/api/users")
        .send(student)
        .expect(200);
      const { id } = res.body;
      userIds.push(id);
    }

    const req: CreateTeamRequest = {
      name: "epicTeam",
      university: 1,
      memberIds: userIds,
      flagged: false,
      contest: contest.body.id,
    };

    const result = await request(app)
      .post("/api/teams/register")
      .set("Cookie", cookies)
      .send(req)
      .expect(200);

    expect(result.body.teamId).not.toBeNull();
  });

  it("Should get the teams's details with a uuid", async () => {
    const students = [
      generateCreateUserFixture({
        role: "Student",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        studentId: "z5397730",
        password: "helloworld",
        university: 1,
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "Test",
        familyName: "User",
        email: "testuser@comp3900.com",
        studentId: "z1234567",
        password: "helloworld",
        university: 1,
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "Test",
        familyName: "User2",
        email: "testuser2@comp3900.com",
        studentId: "z1234568",
        password: "helloworld",
        university: 1,
      }),
    ];

    const userIds: string[] = [];
    for (const student of students) {
      const res = await request(app)
        .post("/api/users")
        .send(student)
        .expect(200);
      const { id } = res.body;
      userIds.push(id);
    }

    const req: CreateTeamRequest = {
      name: "epicTeam",
      university: 1,
      memberIds: userIds,
      flagged: false,
      contest: contest.body.id,
    };

    const res = await request(app)
      .post("/api/teams/register")
      .set("Cookie", cookies)
      .send(req)
      .expect(200);

    const result = await request(app)
      .get(`/api/teams/${res.body.teamId}`)
      .set("Cookie", cookies)
      .expect(200);
    expect(result).not.toBeNull();
    expect(result.body.members).not.toBeNull();
  });

  it("Show throw an error if the team cannot be found by uuid", async () => {
    const teamId = uuidv4();
    await request(app)
      .get(`/api/teams/${teamId}`)
      .set("Cookie", cookies)
      .expect(404);
  });

  it("Should update the teams details", async () => {
    const students = [
      generateCreateUserFixture({
        role: "Student",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        studentId: "z5397730",
        password: "helloworld",
        university: 1,
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "Test",
        familyName: "User",
        email: "testuser@comp3900.com",
        studentId: "z1234567",
        password: "helloworld",
        university: 1,
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "Test",
        familyName: "User2",
        email: "testuser2@comp3900.com",
        studentId: "z1234568",
        password: "helloworld",
        university: 1,
      }),
    ];

    const userIds: string[] = [];
    for (const student of students) {
      const res = await request(app)
        .post("/api/users")
        .send(student)
        .expect(200);
      const { id } = res.body;
      userIds.push(id);
    }

    const team: CreateTeamRequest = {
      name: "epicTeam",
      university: 1,
      memberIds: userIds.slice(1),
      flagged: false,
      contest: contest.body.id,
    };

    const id_res = await request(app)
      .post("/api/teams/register")
      .set("Cookie", cookies)
      .send(team)
      .expect(200);
    const { teamId } = id_res.body;

    const prevDetRes = await request(app)
      .get(`/api/teams/${teamId}`)
      .set("Cookie", cookies)
      .expect(200);
    const prevDetails = prevDetRes.body;

    const req: UpdateTeamRequest = {
      name: "reallyEpicTeam",
      university: 1,
      memberIds: userIds,
      flagged: false,
    };
    const res = await request(app)
      .put(`/api/teams/update/${teamId}`)
      .set("Cookie", cookies)
      .send(req)
      .expect(200);

    const newDetails = res.body;
    expect(newDetails).not.toEqual(prevDetails);
    expect(newDetails.members).not.toEqual(prevDetails.members);
  });

  it("Should remove the team from the database", async () => {
    const req: CreateTeamRequest = {
      name: "epicTeam",
      university: 1,
      memberIds: [],
      flagged: false,
      contest: contest.body.id,
    };

    const id_res = await request(app)
      .post("/api/teams/register")
      .set("Cookie", cookies)
      .send(req)
      .expect(200);
    const { teamId } = id_res.body;

    const prevDetRes = await request(app)
      .get(`/api/teams/${teamId}`)
      .set("Cookie", cookies)
      .expect(200);
    const prev = prevDetRes.body;
    expect(prev).not.toBeNull();

    await request(app)
      .delete(`/api/teams/${teamId}`)
      .set("Cookie", cookies)
      .expect(200);
    await request(app)
      .delete(`/api/teams/${teamId}`)
      .set("Cookie", cookies)
      .expect(400);
  });

  it("Throw when deleting a team that does not exist", async () => {
    const uuid = uuidv4();

    await request(app)
      .delete(`/api/teams/${uuid}`)
      .set("Cookie", cookies)
      .expect(400);
  });
});
