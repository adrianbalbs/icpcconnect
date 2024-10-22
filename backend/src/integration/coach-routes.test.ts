import { v4 as uuidv4 } from "uuid";
import request from "supertest";
import express from "express";
import { CoachService, StudentService } from "../services/index.js";
import { coachRouter, studentRouter } from "../routers/index.js";
import { DatabaseConnection, users } from "../db/index.js";
import { CreateCoachRequest, UpdateCoachRequest, CreateStudentRequest, FormattedEmails } from "../schemas/index.js";
import { errorHandlerMiddleware } from "../middleware/error-handler-middleware.js";
import { beforeAll, afterAll, describe, afterEach, it, expect } from "vitest";
import { setupTestDatabase, dropTestDatabase } from "./db-test-helpers.js";

let db: DatabaseConnection;
let app: ReturnType<typeof express>;

beforeAll(async () => {
  const dbSetup = await setupTestDatabase();
  db = dbSetup.db;
  app = express()
    .use(express.json())
    .use("/api", coachRouter(new CoachService(db)))
    .use("/api", studentRouter(new StudentService(db)))
    .use(errorHandlerMiddleware);
});

afterAll(async () => {
  await dropTestDatabase();
});

describe("coachRouter tests", () => {
  afterEach(async () => {
    await db.delete(users);
  });

  it("should register a new coach", async () => {
    const req: CreateCoachRequest = {
      role: "coach",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const response = await request(app)
      .post("/api/coaches")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("userId");
  });

  it("should get all coaches", async () => {
    const coaches: CreateCoachRequest[] = [
      {
        role: "coach",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
      },
      {
        role: "coach",
        givenName: "Test",
        familyName: "User",
        email: "testuser@comp3900.com",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
      },
      {
        role: "coach",
        givenName: "Test",
        familyName: "User2",
        email: "testuser2@comp3900.com",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
      },
    ];

    for (const coach of coaches) {
      await request(app).post("/api/coaches").send(coach).expect(200);
    }

    const response = await request(app).get("/api/coaches").expect(200);
    expect(response.body.coaches.length).toEqual(coaches.length);
  });

  it("should get a coach by id", async () => {
    const req: CreateCoachRequest = {
      role: "coach",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const user = await request(app).post("/api/coaches").send(req).expect(200);

    const { userId } = user.body;

    const response = await request(app)
      .get(`/api/coaches/${userId}`)
      .expect(200);

    expect(response.body.id).toEqual(userId);
  });

  it("should throw if a coach cannot be found", async () => {
    await request(app).get(`/api/coaches/${uuidv4()}`).expect(404);
  });

  it("should update the coaches details", async () => {
    const newCoach: CreateCoachRequest = {
      role: "coach",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const res = await request(app)
      .post("/api/coaches")
      .send(newCoach)
      .expect(200);

    await request(app).get(`/api/coaches/${res.body.userId}`).expect(200);

    const req: UpdateCoachRequest = {
      ...newCoach,
      email: "newemail@comp3900.com",
    };

    const result = await request(app)
      .put(`/api/coaches/${res.body.userId}`)
      .send(req)
      .expect(200);
    expect(result.body.email).toEqual(req.email);
  });

  it("should remove the coach from the database", async () => {
    const newCoach: CreateCoachRequest = {
      role: "coach",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const res = await request(app)
      .post("/api/coaches")
      .send(newCoach)
      .expect(200);

    await request(app).get(`/api/coaches/${res.body.userId}`).expect(200);
    await request(app).delete(`/api/coaches/${res.body.userId}`).expect(200);

    await request(app).get(`/api/coaches/${res.body.userId}`).expect(404);
  });

  it("should throw when trying to delete a coach that does not exist", async () => {
    await request(app).delete(`/api/coaches/${uuidv4()}`).expect(400);
  });


  it("coaches should be able to get student emails", async () => {
    const coach_req: CreateCoachRequest = {
      role: "coach",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const coach = await request(app)
      .post("/api/coaches")
      .send(coach_req)
      .expect(200);

    const { userId } = coach.body;

    let student_req: CreateStudentRequest = {
      role: "student",
      givenName: "Zac",
      familyName: "Ecob",
      email: "a@comp3900.com",
      studentId: "z5419703",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    await request(app)
      .post("/api/students")
      .send(student_req)
      .expect(200);

    let student_req2: CreateStudentRequest = {
      role: "student",
      givenName: "Zac2",
      familyName: "Ecob2",
      email: "b@comp3900.com",
      studentId: "z5419704",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    await request(app)
      .post("/api/students")
      .send(student_req2)
      .expect(200);

    const emailRes = await request(app)
      .get(`/api/coaches/${userId}/studentEmails`)
      .expect(200);

    const { emails } = emailRes.body;
    const emailsSplit = emails.split(";");

    expect(emailsSplit).toContain(student_req.email);
    expect(emailsSplit).toContain(student_req2.email);
  });
});
