import request from "supertest";
import express from "express";
import {
  AuthService,
  CoachService,
  SiteCoordinatorService,
  StudentService
} from "../services/index.js";
import {
  authRouter,
  coachRouter,
  siteCoordinatorRouter,
  studentRouter
} from "../routers/index.js";
import {
  Database,
  DatabaseConnection,
  seed,
  universities,
  users,
} from "../db/index.js";
import {
  CreateCoachRequest,
  CreateSiteCoordinatorRequest,
  CreateStudentRequest,
  LoginRequest,
} from "../schemas/index.js";

let db: DatabaseConnection;
let app: ReturnType<typeof express>;

beforeAll(async () => {
  db = Database.getConnection();
  await seed(db);
  app = express()
    .use(express.json())
    .use("/api", siteCoordinatorRouter(new SiteCoordinatorService(db)))
    .use("/api", coachRouter(new CoachService(db)))
    .use("/api", studentRouter(new StudentService(db)))
    .use("/api", authRouter(new AuthService(db)));
});

afterAll(async () => {
  await db.delete(users);
  await db.delete(universities);
  await Database.endConnection();
});

describe("authRouter tests", () => {
  afterEach(async () => {
    await db.delete(users)
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
    };
    const response = await request(app)
      .post("/api/students")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("userId");

    const req2: LoginRequest = {
      email: "adrianbalbs@comp3900.com",
      password: "helloworld"
    }

    const response2 = await request(app)
      .post("/api/login")
      .send(req2)
      .expect(200);

    expect(response2.body).toHaveProperty("token");
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
    };
    const response = await request(app)
      .post("/api/students")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("userId");

    const req2: LoginRequest = {
      email: "adrianbalbs@comp3900.com",
      password: "wrongpass"
    }

    await request(app)
      .post("/api/login")
      .send(req2)
      .expect(500);
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
      password: "helloworld"
    }

    await request(app)
      .post("/api/login")
      .send(req2)
      .expect(500);
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
      password: "helloworld"
    }

    const response2 = await request(app)
      .post("/api/login")
      .send(req2)
      .expect(200);

    expect(response2.body).toHaveProperty("token");
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
      password: "wrongpass"
    }

    await request(app)
      .post("/api/login")
      .send(req2)
      .expect(500);
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
      password: "helloworld"
    }

    await request(app)
      .post("/api/login")
      .send(req2)
      .expect(500);
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
    };
    const response = await request(app)
      .post("/api/students")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("userId");

    const req2: LoginRequest = {
      email: "adrianbalbs@comp3900.com",
      password: "helloworld"
    }

    const response2 = await request(app)
      .post("/api/login")
      .send(req2)
      .expect(200);

    expect(response2.body).toHaveProperty("token");
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
    };
    const response = await request(app)
      .post("/api/students")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("userId");

    const req2: LoginRequest = {
      email: "adrianbalbs@comp3900.com",
      password: "wrongpass"
    }

    await request(app)
      .post("/api/login")
      .send(req2)
      .expect(500);
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
    };
    const response = await request(app)
      .post("/api/students")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("userId");

    const req2: LoginRequest = {
      email: "jerryyang@comp3900.com",
      password: "helloworld"
    }

    await request(app)
      .post("/api/login")
      .send(req2)
      .expect(500);
  });
});