import { beforeAll, afterAll, afterEach, describe, expect, it } from "vitest";
import { v4 as uuidv4 } from "uuid";
import request from "supertest";
import express from "express";
import { StudentService, TeamService } from "../services/index.js";
import { studentRouter, teamRouter } from "../routers/index.js";
import { DatabaseConnection, users } from "../db/index.js";
import {
  CreateStudentRequest,
  UpdateStudentRequest,
  CreateTeamRequest,
} from "../schemas/index.js";
import { errorHandlerMiddleware } from "../middleware/error-handler-middleware.js";
import { dropTestDatabase, setupTestDatabase } from "./db-test-helpers.js";

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

describe("studentRouter tests", () => {
  afterEach(async () => {
    await db.delete(users);
  });

  it("should register a new student", async () => {
    const req: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const response = await request(app)
      .post("/api/students")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("userId");
  });

  it("should get all students", async () => {
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

    for (const student of students) {
      await request(app).post("/api/students").send(student).expect(200);
    }

    const response = await request(app).get("/api/students").expect(200);
    expect(response.body.allStudents.length).toEqual(students.length);
  });

  it("should get a student by id", async () => {
    const req: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const user = await request(app).post("/api/students").send(req).expect(200);

    const { userId } = user.body;

    const response = await request(app)
      .get(`/api/students/${userId}`)
      .expect(200);

    expect(response.body.id).toEqual(userId);
  });

  it("should throw if a student cannot be found", async () => {
    await request(app).get(`/api/students/${uuidv4()}`).expect(404);
  });

  it("should update the students details", async () => {
    const newStudent: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const res = await request(app)
      .post("/api/students")
      .send(newStudent)
      .expect(200);

    await request(app).get(`/api/students/${res.body.userId}`).expect(200);

    const req: UpdateStudentRequest = {
      ...newStudent,
      pronouns: "he/him",
      team: null,
    };

    const result = await request(app)
      .put(`/api/students/${res.body.userId}`)
      .send(req)
      .expect(200);
    expect(result.body.pronouns).toEqual(req.pronouns);
  });

  it("should remove student from the database", async () => {
    const newStudent: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const res = await request(app)
      .post("/api/students")
      .send(newStudent)
      .expect(200);

    await request(app).get(`/api/students/${res.body.userId}`).expect(200);
    await request(app).delete(`/api/students/${res.body.userId}`).expect(200);

    await request(app).get(`/api/students/${res.body.userId}`).expect(404);
  });

  it("should return an error when deleting a student that does not exist", async () => {
    await request(app).delete(`/api/students/${uuidv4()}`).expect(400);
  });

  it("Students should be able to get their teammates emails", async () => {
    const student_reqs: CreateStudentRequest[] = [{
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
      givenName: "Yuyun",
      familyName: "Zhou",
      email: "qx3d23qw@comp3900.com",
      studentId: "z5354057",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    },
    {
      role: "student",
      givenName: "dwe",
      familyName: "dq3was",
      email: "dqwasd3qw@comp3900.com",
      studentId: "z1234567",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    }];

    const userIds : string[] = [];
    for (const req of student_reqs) {
      const res = await request(app)
        .post("/api/students")
        .send(req)
        .expect(200);
        let { userId } = res.body;
        userIds.push(userId);
    }

    const teamCreationReq : CreateTeamRequest = {
      university: 1,
      name: "epic_team",
      memberIds: userIds,
    };

    await request(app)
      .post("/api/teams/register")
      .send(teamCreationReq)
      .expect(200);

    const res = await request(app)
      .get(`/api/students/${userIds[0]}/teamEmails`)
      .expect(200);

    const {emails} = res.body;

    const emailsSplit = emails.split(";");

    expect(emailsSplit).toContain(student_reqs[1].email);
    expect(emailsSplit).toContain(student_reqs[2].email);

    //Dont include our own email - thatd be annoying
    expect(emailsSplit).not.toContain(student_reqs[0].email);

  });

});
