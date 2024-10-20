import request from "supertest";
import express from "express";
import {
  AuthService,
  CoachService,
  SiteCoordinatorService,
  StudentService,
} from "../services/index.js";
import {
  authRouter,
  coachRouter,
  siteCoordinatorRouter,
  studentRouter,
} from "../routers/index.js";
import { DatabaseConnection, users } from "../db/index.js";
import {
  CreateCoachRequest,
  CreateSiteCoordinatorRequest,
  CreateStudentRequest,
  LoginRequest,
} from "../schemas/index.js";
import { beforeAll, afterAll, describe, afterEach, it, expect } from "vitest";
import { setupTestDatabase, dropTestDatabase } from "./db-test-helpers.js";

let db: DatabaseConnection;
let app: ReturnType<typeof express>;

beforeAll(async () => {
  const dbSetup = await setupTestDatabase();
  db = dbSetup.db;
  const authService = new AuthService(db);
  app = express()
    .use(express.json())
    .use(
      "/api/site-coordinators",
      siteCoordinatorRouter(new SiteCoordinatorService(db), authService),
    )
    .use("/api/coaches", coachRouter(new CoachService(db), authService))
    .use("/api/students", studentRouter(new StudentService(db), authService))
    .use("/api", authRouter(authService));
});

afterAll(async () => {
  await dropTestDatabase();
});

describe("authRouter tests", () => {
  afterEach(async () => {
    await db.delete(users);
  });

  it("should register a new site-coord, have them login, and receive a token", async () => {
    const req: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
      languagesSpoken: ["en"],
      photoConsent: true,
    };
    const response = await request(app)
      .post("/api/students")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("userId");

    const req2: LoginRequest = {
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
    };

    const response2 = await request(app)
      .post("/api/login")
      .send(req2)
      .expect(200);

    expect(response2.body).toHaveProperty("token");
    expect(response2.body).toHaveProperty("refresh");
  });

  it("should register a new site-coord, have them enter the wrong password", async () => {
    const req: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
      languagesSpoken: ["en"],
      photoConsent: true,
    };
    const response = await request(app)
      .post("/api/students")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("userId");

    const req2: LoginRequest = {
      email: "adrianbalbs@comp3900.com",
      password: "wrongpass",
    };

    await request(app).post("/api/login").send(req2).expect(500);
  });

  it("should register a new site-coord, have them enter the wrong email", async () => {
    const req: CreateSiteCoordinatorRequest = {
      role: "site_coordinator",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const response = await request(app)
      .post("/api/site-coordinators")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("userId");

    const req2: LoginRequest = {
      email: "jerryyang@comp3900.com",
      password: "helloworld",
    };

    await request(app).post("/api/login").send(req2).expect(500);
  });

  it("should register a new coach, have them login, and receive a token", async () => {
    const req1: CreateCoachRequest = {
      role: "coach",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const response1 = await request(app)
      .post("/api/coaches")
      .send(req1)
      .expect(200);

    expect(response1.body).toHaveProperty("userId");

    const req2: LoginRequest = {
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
    };

    const response2 = await request(app)
      .post("/api/login")
      .send(req2)
      .expect(200);

    expect(response2.body).toHaveProperty("token");
    expect(response2.body).toHaveProperty("refresh");
  });

  it("should register a new coach, have them enter the wrong password", async () => {
    const req1: CreateCoachRequest = {
      role: "coach",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const response1 = await request(app)
      .post("/api/coaches")
      .send(req1)
      .expect(200);

    expect(response1.body).toHaveProperty("userId");

    const req2: LoginRequest = {
      email: "adrianbalbs@comp3900.com",
      password: "wrongpass",
    };

    await request(app).post("/api/login").send(req2).expect(500);
  });

  it("should register a new coach, have them enter the wrong email", async () => {
    const req1: CreateCoachRequest = {
      role: "coach",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const response1 = await request(app)
      .post("/api/coaches")
      .send(req1)
      .expect(200);

    expect(response1.body).toHaveProperty("userId");

    const req2: LoginRequest = {
      email: "jerryyang@comp3900.com",
      password: "helloworld",
    };

    await request(app).post("/api/login").send(req2).expect(500);
  });

  it("should register a new student, have them login, and receive a token", async () => {
    const req: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
      languagesSpoken: ["en"],
      photoConsent: true,
    };
    const response = await request(app)
      .post("/api/students")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("userId");

    const req2: LoginRequest = {
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
    };

    const response2 = await request(app)
      .post("/api/login")
      .send(req2)
      .expect(200);

    expect(response2.body).toHaveProperty("token");
    expect(response2.body).toHaveProperty("refresh");
  });

  it("should register a new student, have them enter the wrong password", async () => {
    const req: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
      languagesSpoken: ["en"],
      photoConsent: true,
    };
    const response = await request(app)
      .post("/api/students")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("userId");

    const req2: LoginRequest = {
      email: "adrianbalbs@comp3900.com",
      password: "wrongpass",
    };

    await request(app).post("/api/login").send(req2).expect(500);
  });

  it("should register a new student, have them enter the wrong email", async () => {
    const req: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
      languagesSpoken: ["en"],
      photoConsent: true,
    };
    const response = await request(app)
      .post("/api/students")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("userId");

    const req2: LoginRequest = {
      email: "jerryyang@comp3900.com",
      password: "helloworld",
    };

    await request(app).post("/api/login").send(req2).expect(500);
  });
});
