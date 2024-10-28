import { v4 as uuidv4 } from "uuid";
import request from "supertest";
import express from "express";
import { DatabaseConnection, users } from "../../db/index.js";
import {
  CreateTeamRequest,
  UpdateTeamRequest,
  CreateStudentRequest,
} from "../../schemas/index.js";
import { TeamService, StudentService } from "../../services/index.js";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { setupTestDatabase, dropTestDatabase } from "../db-test-helpers.js";
import { teamRouter, studentRouter } from "../../routers/index.js";
import { errorHandlerMiddleware } from "../../middleware/error-handler-middleware.js";

let db: DatabaseConnection;
let app: ReturnType<typeof express>;

beforeAll(async () => {
  const dbSetup = await setupTestDatabase();
  db = dbSetup.db;
  app = express()
    .use(express.json())
    .use("/api", studentRouter(new StudentService(db)))
    .use("/api", teamRouter(new TeamService(db)))
    .use(errorHandlerMiddleware);
});

afterAll(async () => {
  await dropTestDatabase();
});

describe("TeamService tests", () => {
  afterEach(async () => {
    await db.delete(users);
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
    };

    const result = await request(app)
      .post("/api/teams/register")
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
    };

    const res = await request(app)
      .post("/api/teams/register")
      .send(req)
      .expect(200);

    const result = await request(app)
      .get(`/api/teams/${res.body.teamId}`)
      .expect(200);
    expect(result).not.toBeNull();
    expect(result.body.members).not.toBeNull();
  });

  it("Show throw an error if the team cannot be found by uuid", async () => {
    const teamId = uuidv4();
    await request(app).get(`/api/teams/${teamId}`).expect(400);
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
    };

    const id_res = await request(app)
      .post("/api/teams/register")
      .send(team)
      .expect(200);
    const { teamId } = id_res.body;

    const prevDetRes = await request(app)
      .get(`/api/teams/${teamId}`)
      .expect(200);
    const prevDetails = prevDetRes.body;

    const req: UpdateTeamRequest = {
      name: "reallyEpicTeam",
      university: 1,
      memberIds: userIds,
    };
    const res = await request(app)
      .put(`/api/teams/update/${teamId}`)
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
    };

    const id_res = await request(app)
      .post("/api/teams/register")
      .send(req)
      .expect(200);
    const { teamId } = id_res.body;

    const prevDetRes = await request(app)
      .get(`/api/teams/${teamId}`)
      .expect(200);
    const prev = prevDetRes.body;
    expect(prev).not.toBeNull();

    await request(app).delete(`/api/teams/${teamId}`).expect(200);
    await request(app).delete(`/api/teams/${teamId}`).expect(400);
  });

  it("Throw when deleting a team that does not exist", async () => {
    const uuid = uuidv4();

    await request(app).delete(`/api/teams/${uuid}`).expect(400);
  });
});
