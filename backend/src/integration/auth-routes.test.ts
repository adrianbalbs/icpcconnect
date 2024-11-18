import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { AuthService, CodesService, UserService } from "../services/index.js";
import { authRouter, userRouter } from "../routers/index.js";
import { DatabaseConnection, users } from "../db/index.js";
import { LoginRequest } from "../schemas/index.js";
import { beforeAll, afterAll, describe, afterEach, it, expect } from "vitest";
import { setupTestDatabase, dropTestDatabase } from "./db-test-helpers.js";
import { generateCreateUserFixture } from "./fixtures.js";

let db: DatabaseConnection;
let app: ReturnType<typeof express>;

beforeAll(async () => {
  const dbSetup = await setupTestDatabase();
  db = dbSetup.db;
  const authService = new AuthService(db);
  const codesService = new CodesService(db);
  app = express()
    .use(express.json())
    .use(cookieParser())
    .use("/api/auth", authRouter(authService))
    .use(
      "/api/users",
      userRouter(new UserService(db), authService, codesService),
    );
});

afterAll(async () => {
  await dropTestDatabase();
});

describe("authRouter tests", () => {
  afterEach(async () => {
    await db.delete(users);
  });

  it("should register a new student, have them login, and receive a token", async () => {
    const req = generateCreateUserFixture({
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
    });
    const response = await request(app)
      .post("/api/users")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("id");

    const loginReq: LoginRequest = {
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
    };

    const response2 = await request(app)
      .post("/api/auth/login")
      .send(loginReq)
      .expect(200);

    const cookies = response2.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(response2.body).toHaveProperty("id");
    expect(response2.body).toHaveProperty("refreshTokenVersion");
    expect(response2.body).toHaveProperty("role");
    expect(response2.body).toHaveProperty("email");
  });

  it("should register a new student, have them enter the wrong password", async () => {
    const req = generateCreateUserFixture({
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
    });
    const response = await request(app)
      .post("/api/users")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("id");

    const loginReq: LoginRequest = {
      email: "adrianbalbs@comp3900.com",
      password: "wrongpass",
    };

    await request(app).post("/api/auth/login").send(loginReq).expect(500);
  });

  it("should register a new student, have them enter the wrong email", async () => {
    const req = generateCreateUserFixture({
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
    });
    const response = await request(app)
      .post("/api/users")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("id");

    const loginReq: LoginRequest = {
      email: "jerryyang@comp3900.com",
      password: "helloworld",
    };

    await request(app).post("/api/auth/login").send(loginReq).expect(500);
  });

  it("should register, login, then logout a user", async () => {
    const req = generateCreateUserFixture({
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
    });

    await request(app).post("/api/users").send(req).expect(200);
    const response = await request(app)
      .post("/api/auth/login")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("id");

    const loginReq: LoginRequest = {
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
    };

    const response2 = await request(app)
      .post("/api/auth/login")
      .send(loginReq)
      .expect(200);

    const cookies = response2.headers["set-cookie"];
    expect(cookies).toBeDefined();

    const logoutResponse = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", cookies)
      .expect(200);

    const clearedCookies = logoutResponse.headers["set-cookie"];
    expect(clearedCookies).toBeDefined();
    expect(clearedCookies[0]).toMatch(/id=;/);
    expect(clearedCookies[1]).toMatch(/rid=;/);
  });

  it("should login, then get the logged in user's session details", async () => {
    const req = generateCreateUserFixture({
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
    });

    const response = await request(app)
      .post("/api/users")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("id");

    const req2: LoginRequest = {
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
    };

    const response2 = await request(app)
      .post("/api/auth/login")
      .send(req2)
      .expect(200);

    const cookies = response2.headers["set-cookie"];
    expect(cookies).toBeDefined();

    const meResponse = await request(app)
      .get("/api/auth/me")
      .set("Cookie", cookies)
      .expect(200);

    expect(meResponse.body).toHaveProperty("givenName");
    expect(meResponse.body).toHaveProperty("familyName");
    expect(meResponse.body).toHaveProperty("refreshTokenVersion");
    expect(meResponse.body).toHaveProperty("email");
    expect(meResponse.body).toHaveProperty("role");
    expect(meResponse.body).toHaveProperty("id");
  });
});
