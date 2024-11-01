import { v4 as uuidv4 } from "uuid";
import request from "supertest";
import express from "express";
import { DatabaseConnection, teams, users } from "../db/index.js";
import {
  CreateTeamRequest,
  UpdateTeamRequest,
  CreateStudentRequest,
} from "../schemas/index.js";
import { TeamService, StudentService, AuthService, GetTeamsFromInstitutionResponse } from "../services/index.js";
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
import { teamRouter, studentRouter, authRouter } from "../routers/index.js";
import { errorHandlerMiddleware } from "../middleware/error-handler-middleware.js";
import cookieParser from "cookie-parser";
import { not, eq } from "drizzle-orm";

describe("TeamService tests", () => {
  let db: DatabaseConnection;
  let app: ReturnType<typeof express>;
  let cookies: string;

  beforeAll(async () => {
    const dbSetup = await setupTestDatabase();
    db = dbSetup.db;
    const authService = new AuthService(db);
    app = express()
      .use(express.json())
      .use(cookieParser())
      .use("/api/auth", authRouter(authService))
      .use("/api/students", studentRouter(new StudentService(db), authService))
      .use("/api/teams", teamRouter(new TeamService(db), authService))
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
  });

  afterEach(async () => {
    await db.delete(users).where(not(eq(users.email, "admin@comp3900.com")));
    await db.delete(teams)
  });

  afterAll(async () => {
    await dropTestDatabase();
  });

  it("Should register a new team", async () => {
    const students: CreateStudentRequest[] = [
      {
        role: "student",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        studentId: "z5397730",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Test",
        familyName: "User",
        email: "testuser@comp3900.com",
        studentId: "z1234567",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Test",
        familyName: "User2",
        email: "testuser2@comp3900.com",
        studentId: "z1234568",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
    ];

    const userIds: string[] = [];
    for (const student of students) {
      const res = await request(app)
        .post("/api/students")
        .send(student)
        .expect(200);
      const { userId } = res.body;
      userIds.push(userId);
    }

    const req: CreateTeamRequest = {
      name: "epicTeam",
      university: 1,
      memberIds: userIds,
      flagged: false,
    };

    const result = await request(app)
      .post("/api/teams/register")
      .set("Cookie", cookies)
      .send(req)
      .expect(200);

    expect(result.body.teamId).not.toBeNull();
  });

  it("Should get the teams's details with a uuid", async () => {
    const students: CreateStudentRequest[] = [
      {
        role: "student",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        studentId: "z5397730",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Test",
        familyName: "User",
        email: "testuser@comp3900.com",
        studentId: "z1234567",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Test",
        familyName: "User2",
        email: "testuser2@comp3900.com",
        studentId: "z1234568",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
    ];

    const userIds: string[] = [];
    for (const student of students) {
      const res = await request(app)
        .post("/api/students")
        .send(student)
        .expect(200);
      const { userId } = res.body;
      userIds.push(userId);
    }

    const req: CreateTeamRequest = {
      name: "epicTeam",
      university: 1,
      memberIds: userIds,
      flagged: false,
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
      .expect(400);
  });

  it("Should update the teams details", async () => {
    const students: CreateStudentRequest[] = [
      {
        role: "student",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        studentId: "z5397730",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Test",
        familyName: "User",
        email: "testuser@comp3900.com",
        studentId: "z1234567",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Test",
        familyName: "User2",
        email: "testuser2@comp3900.com",
        studentId: "z1234568",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
    ];

    const userIds: string[] = [];
    for (const student of students) {
      const res = await request(app)
        .post("/api/students")
        .send(student)
        .expect(200);
      const { userId } = res.body;
      userIds.push(userId);
    }

    const team: CreateTeamRequest = {
      name: "epicTeam",
      university: 1,
      memberIds: userIds.slice(1),
      flagged: false,
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

  it("should create a team at a uni and check that getteamsfromuni works", async () => {
    const students: CreateStudentRequest[] = [
      {
        role: "student",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        studentId: "z5397730",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Test",
        familyName: "User",
        email: "testuser@comp3900.com",
        studentId: "z1234567",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Test",
        familyName: "User2",
        email: "testuser2@comp3900.com",
        studentId: "z1234568",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
    ];

    const userIds: string[] = [];
    for (const student of students) {
      const res = await request(app)
        .post("/api/students")
        .set("Cookie", cookies)
        .send(student)
        .expect(200);
      const { userId } = res.body;
      userIds.push(userId);
    }

    const team: CreateTeamRequest = {
      name: "epicTeam",
      university: 1,
      memberIds: userIds,
      flagged: false,
    };

    const teamIdRes = await request(app)
      .post("/api/teams/register")
      .set("Cookie", cookies)
      .send(team)
      .expect(200);
    const { teamId } = teamIdRes.body;
    
    const res = await request(app)
      .get("/api/teams/uni/1")
      .set("Cookie", cookies)
      .expect(200)

    const teams: GetTeamsFromInstitutionResponse = res.body

    console.log(teams)

    expect(teams.teams.length).toBe(1)
    expect(teams.teams[0].university).toBe("University of New South Wales")
    expect(teams.teams[0].teamName).toBe("epicTeam")
    expect(teams.teams[0].teamId).toBe(teamId)
    expect(teams.teams[0].members.sort()).toStrictEqual(["Test User2", "Test User", "Adrian Balbalosa"].sort())
    expect(teams.teams[0].flagged).toBe(false)
  })

  it("should create a team at a different uni and check that getteamsfromuni returns nothing", async () => {
    const students: CreateStudentRequest[] = [
      {
        role: "student",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        studentId: "z5397730",
        password: "helloworld",
        university: 2,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Test",
        familyName: "User",
        email: "testuser@comp3900.com",
        studentId: "z1234567",
        password: "helloworld",
        university: 2,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Test",
        familyName: "User2",
        email: "testuser2@comp3900.com",
        studentId: "z1234568",
        password: "helloworld",
        university: 2,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
    ];

    const userIds: string[] = [];
    for (const student of students) {
      const res = await request(app)
        .post("/api/students")
        .set("Cookie", cookies)
        .send(student)
        .expect(200);
      const { userId } = res.body;
      userIds.push(userId);
    }

    const team: CreateTeamRequest = {
      name: "epicTeam",
      university: 2,
      memberIds: userIds,
      flagged: false,
    };

    await request(app)
      .post("/api/teams/register")
      .set("Cookie", cookies)
      .send(team)
      .expect(200);
    
    const res = await request(app)
      .get("/api/teams/uni/1")
      .set("Cookie", cookies)
      .expect(200)

    const teams: GetTeamsFromInstitutionResponse = res.body

    console.log(teams)

    expect(teams.teams.length).toBe(0)
  })

  it("should create a team at a uni and check that getteamsfromuni works", async () => {
    const students1: CreateStudentRequest[] = [
      {
        role: "student",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        studentId: "z5397730",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Test",
        familyName: "User",
        email: "testuser@comp3900.com",
        studentId: "z1234567",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Test",
        familyName: "User2",
        email: "testuser2@comp3900.com",
        studentId: "z1234568",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
    ];

    const students2: CreateStudentRequest[] = [
      {
        role: "student",
        givenName: "Meow",
        familyName: "1",
        email: "meow1@comp3900.com",
        studentId: "z9999991",
        password: "helloworld",
        university: 2,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Meow",
        familyName: "2",
        email: "meow2@comp3900.com",
        studentId: "z9999992",
        password: "helloworld",
        university: 2,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Meow",
        familyName: "3",
        email: "meow3@comp3900.com",
        studentId: "z9999993",
        password: "helloworld",
        university: 2,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
    ]

    const userIds1: string[] = [];
    for (const student1 of students1) {
      const res = await request(app)
        .post("/api/students")
        .set("Cookie", cookies)
        .send(student1)
        .expect(200);
      const { userId } = res.body;
      userIds1.push(userId);
    }

    const userIds2: string[] = [];
    for (const student2 of students2) {
      const res = await request(app)
        .post("/api/students")
        .set("Cookie", cookies)
        .send(student2)
        .expect(200);
      const { userId } = res.body;
      userIds2.push(userId);
    }

    const team1: CreateTeamRequest = {
      name: "epicTeam",
      university: 1,
      memberIds: userIds1,
      flagged: false,
    };

    const team2: CreateTeamRequest = {
      name: "meowTeam",
      university: 2,
      memberIds: userIds2,
      flagged: false,
    };

    const teamId1Res = await request(app)
      .post("/api/teams/register")
      .set("Cookie", cookies)
      .send(team1)
      .expect(200);
    const teamId1 = teamId1Res.body.teamId;

    const teamId2Res = await request(app)
      .post("/api/teams/register")
      .set("Cookie", cookies)
      .send(team2)
      .expect(200);
    const teamId2 = teamId2Res.body.teamId;

    const res = await request(app)
      .get("/api/teams/site/1")
      .set("Cookie", cookies)
      .expect(200)

    const teams: GetTeamsFromInstitutionResponse = res.body

    console.log(teams)

    expect(teams.teams.length).toBe(2)
    expect(teams.teams[0].university).toBe("University of New South Wales")
    expect(teams.teams[0].teamName).toBe("epicTeam")
    expect(teams.teams[0].teamId).toBe(teamId1)
    expect(teams.teams[0].members.sort()).toStrictEqual(["Test User2", "Test User", "Adrian Balbalosa"].sort())
    expect(teams.teams[0].flagged).toBe(false)

    expect(teams.teams[1].university).toBe("University of Sydney")
    expect(teams.teams[1].teamName).toBe("meowTeam")
    expect(teams.teams[1].teamId).toBe(teamId2)
    expect(teams.teams[1].members.sort()).toStrictEqual(["Meow 1", "Meow 2", "Meow 3"].sort())
    expect(teams.teams[1].flagged).toBe(false)
  })
});
