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
import { env } from "../env.js";

describe("TeamService tests", () => {
  let db: DatabaseConnection;
  let userService: UserService;
  let app: ReturnType<typeof express>;
  let cookies: string;
  let contest: Response;

  beforeAll(async () => {
    const dbSetup = await setupTestDatabase();
    db = dbSetup.db;
    const authService = new AuthService(db);
    const codesService = new CodesService(db);
    userService = new UserService(db);
    const teamService = new TeamService(db, userService);
    const algorithmService = new AlgorithmService(userService, teamService);
    app = express()
      .use(express.json())
      .use(cookieParser())
      .use("/api/auth", authRouter(authService))
      .use(
        "/api/users",
        userRouter(new UserService(db), authService, codesService),
      )
      .use("/api/teams", teamRouter(teamService, authService))

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
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
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
    await db.delete(users).where(not(eq(users.email, env.ADMIN_EMAIL)));
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

  it("Should create a pullout request", async () => {
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
      generateCreateUserFixture({
        role: "Student",
        givenName: "Test",
        familyName: "User3",
        email: "testuser3@comp3900.com",
        studentId: "z1234569",
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
      memberIds: userIds.slice(0, -1), // dont take last member
      flagged: false,
      contest: contest.body.id,
    };

    const team_res = await request(app)
      .post("/api/teams/register")
      .set("Cookie", cookies)
      .send(req)
      .expect(200);

    //get student id of the student not in the team
    const sId_req = await request(app)
      .get(`/api/users/${userIds[3]}`)
      .set("Cookie", cookies)
      .expect(200);

    const pulloutReq = {
      studentId: userIds[0],
      reason: "",
      replacedWith: sId_req.body.studentId,
    };

    await request(app)
      .post(`/api/teams/createPullout/${userIds[0]}`)
      .set("Cookie", cookies)
      .send(pulloutReq)
      .expect(200);

    const info_res = await request(app)
      .get(`/api/teams/${team_res.body.teamId}`)
      .set("Cookie", cookies)
      .expect(200);
    expect(info_res).not.toBeNull();
    expect(info_res.body.replacements).not.toBeNull();
  });

  it("Should create and accept a pullout request", async () => {
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
      generateCreateUserFixture({
        role: "Student",
        givenName: "Test",
        familyName: "User3",
        email: "testuser3@comp3900.com",
        studentId: "z1234569",
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
      memberIds: userIds.slice(0, -1), // dont take last member
      flagged: false,
      contest: contest.body.id,
    };

    const team_res = await request(app)
      .post("/api/teams/register")
      .set("Cookie", cookies)
      .send(req)
      .expect(200);

    //get student id of the student not in the team
    const sId_req = await request(app)
      .get(`/api/users/${userIds[3]}`)
      .set("Cookie", cookies)
      .expect(200);

    const pulloutReq = {
      studentId: userIds[0],
      reason: "",
      replacedWith: sId_req.body.studentId,
    };

    await request(app)
      .post(`/api/teams/createPullout/${userIds[0]}`)
      .set("Cookie", cookies)
      .send(pulloutReq)
      .expect(200);

    const info_res = await request(app)
      .get(`/api/teams/${team_res.body.teamId}`)
      .set("Cookie", cookies)
      .expect(200);
    expect(info_res).not.toBeNull();
    expect(info_res.body.replacements).not.toBeNull();

    //accept pullout request
    const accepting = { accepting: true };

    await request(app)
      .put(`/api/teams/handlePullout/${userIds[0]}`)
      .set("Cookie", cookies)
      .send(accepting)
      .expect(200);

    //get student details of the removed student
    const lonely_student = await request(app)
      .get(`/api/users/${userIds[0]}`)
      .set("Cookie", cookies)
      .expect(200);

    //should b null
    expect(lonely_student.body.team).toBeNull();

    //get student details of the accepted replacement
    const replacement_student = await request(app)
      .get(`/api/users/${userIds[3]}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(replacement_student.body.team).toEqual(info_res.body.name);
  });

  it("Should create and deny a pullout request", async () => {
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
      generateCreateUserFixture({
        role: "Student",
        givenName: "Test",
        familyName: "User3",
        email: "testuser3@comp3900.com",
        studentId: "z1234569",
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
      memberIds: userIds.slice(0, -1), // dont take last member
      flagged: false,
      contest: contest.body.id,
    };

    const team_res = await request(app)
      .post("/api/teams/register")
      .set("Cookie", cookies)
      .send(req)
      .expect(200);

    //get student id of the student not in the team
    const sId_req = await request(app)
      .get(`/api/users/${userIds[3]}`)
      .set("Cookie", cookies)
      .expect(200);

    const pulloutReq = {
      studentId: userIds[0],
      reason: "",
      replacedWith: sId_req.body.studentId,
    };

    await request(app)
      .post(`/api/teams/createPullout/${userIds[0]}`)
      .set("Cookie", cookies)
      .send(pulloutReq)
      .expect(200);

    const info_res = await request(app)
      .get(`/api/teams/${team_res.body.teamId}`)
      .set("Cookie", cookies)
      .expect(200);
    expect(info_res).not.toBeNull();
    expect(info_res.body.replacements).not.toBeNull();

    //deny pullout request
    const accepting = { accepting: false };

    await request(app)
      .put(`/api/teams/handlePullout/${userIds[0]}`)
      .set("Cookie", cookies)
      .send(accepting)
      .expect(200);

    //get student details of the student whos pullout got denied
    const lonely_student = await request(app)
      .get(`/api/users/${userIds[0]}`)
      .set("Cookie", cookies)
      .expect(200);

    //should not have changed
    expect(lonely_student.body.team).toEqual(info_res.body.name);

    //get student details of the accepted replacement
    const replacement_student = await request(app)
      .get(`/api/users/${userIds[3]}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(replacement_student.body.team).toBeNull();

    const newInfo_res = await request(app)
      .get(`/api/teams/${team_res.body.teamId}`)
      .set("Cookie", cookies)
      .expect(200);
    expect(newInfo_res).not.toBeNull();
    expect(newInfo_res.body.replacements.length).toBe(0);
  });

  it("Should replacement a student in a team with a student not in a team", async () => {
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
      generateCreateUserFixture({
        role: "Student",
        givenName: "Test",
        familyName: "User3",
        email: "testuser3@comp3900.com",
        studentId: "z1234569",
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
      memberIds: userIds.slice(0, -1), // dont take last member
      flagged: false,
      contest: contest.body.id,
    };

    const team_res = await request(app)
      .post("/api/teams/register")
      .set("Cookie", cookies)
      .send(req)
      .expect(200);

    //Team info
    const info_res = await request(app)
      .get(`/api/teams/${team_res.body.teamId}`)
      .set("Cookie", cookies)
      .expect(200);

    //get student id of the student not in the team
    const sId_req = await request(app)
      .get(`/api/users/${userIds[3]}`)
      .set("Cookie", cookies)
      .expect(200);

    //Replace the first student with one not in a team
    const replacementReq = {
      team: team_res.body.teamId,
      replacedWith: sId_req.body.studentId,
      student: userIds[0],
    };

    await request(app)
      .put(`/api/teams/handleReplacement`)
      .set("Cookie", cookies)
      .send(replacementReq)
      .expect(200);

    //get student details of the student whos pullout got denied
    const lonely_student = await request(app)
      .get(`/api/users/${userIds[0]}`)
      .set("Cookie", cookies)
      .expect(200);

    //should be null
    expect(lonely_student.body.team).toBeNull();

    //get student details of the accepted replacement
    const replacement_student = await request(app)
      .get(`/api/users/${userIds[3]}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(replacement_student.body.team).toEqual(info_res.body.name);
  });

  it("Should replacement a student in a team with a student in another team", async () => {
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
      generateCreateUserFixture({
        role: "Student",
        givenName: "Test",
        familyName: "User3",
        email: "testuser3@comp3900.com",
        studentId: "z1234569",
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
      memberIds: userIds.slice(0, -1), // dont take last member
      flagged: false,
      contest: contest.body.id,
    };

    const team_res = await request(app)
      .post("/api/teams/register")
      .set("Cookie", cookies)
      .send(req)
      .expect(200);

    const alt_req: CreateTeamRequest = {
      name: "cringeTeam",
      university: 1,
      memberIds: userIds.slice(3), // only last member
      flagged: false,
      contest: contest.body.id,
    };

    const alt_team_res = await request(app)
      .post("/api/teams/register")
      .set("Cookie", cookies)
      .send(alt_req)
      .expect(200);

    //Team info
    const info_res = await request(app)
      .get(`/api/teams/${team_res.body.teamId}`)
      .set("Cookie", cookies)
      .expect(200);

    //Team info
    const alt_info_res = await request(app)
      .get(`/api/teams/${alt_team_res.body.teamId}`)
      .set("Cookie", cookies)
      .expect(200);

    //get student id of the student not in the team
    const sId_req = await request(app)
      .get(`/api/users/${userIds[3]}`)
      .set("Cookie", cookies)
      .expect(200);

    //Replace the first student with one not in a team
    const replacementReq = {
      team: team_res.body.teamId,
      replacedWith: sId_req.body.studentId,
      student: userIds[0],
    };

    await request(app)
      .put(`/api/teams/handleReplacement`)
      .set("Cookie", cookies)
      .send(replacementReq)
      .expect(200);

    //get student details of the student whos pullout got denied
    const lonely_student = await request(app)
      .get(`/api/users/${userIds[0]}`)
      .set("Cookie", cookies)
      .expect(200);

    //should be null
    expect(lonely_student.body.team).toEqual(alt_info_res.body.name);

    //get student details of the accepted replacement
    const replacement_student = await request(app)
      .get(`/api/users/${userIds[3]}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(replacement_student.body.team).toEqual(info_res.body.name);
  });

  it("Should create and accept a pullout request without a replacement", async () => {
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

    const team_res = await request(app)
      .post("/api/teams/register")
      .set("Cookie", cookies)
      .send(req)
      .expect(200);

    const pulloutReq = {
      studentId: userIds[0],
      reason: "",
      replacedWith: "",
    };

    await request(app)
      .post(`/api/teams/createPullout/${userIds[0]}`)
      .set("Cookie", cookies)
      .send(pulloutReq)
      .expect(200);

    const info_res = await request(app)
      .get(`/api/teams/${team_res.body.teamId}`)
      .set("Cookie", cookies)
      .expect(200);
    expect(info_res).not.toBeNull();
    expect(info_res.body.replacements).not.toBeNull();

    //accept pullout request
    const accepting = { accepting: true };

    await request(app)
      .put(`/api/teams/handlePullout/${userIds[0]}`)
      .set("Cookie", cookies)
      .send(accepting)
      .expect(200);

    //get student details of the removed student
    const lonely_student = await request(app)
      .get(`/api/users/${userIds[0]}`)
      .set("Cookie", cookies)
      .expect(200);

    //should b null
    expect(lonely_student.body.team).toBeNull();
  });
});
