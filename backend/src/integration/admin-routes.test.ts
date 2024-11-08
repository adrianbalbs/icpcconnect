import { v4 as uuidv4 } from "uuid";
import request from "supertest";
import express from "express";
import { AdminService, AuthService, UserService } from "../services/index.js";
import { adminRouter, authRouter, userRouter } from "../routers/index.js";
import { DatabaseConnection, users } from "../db/index.js";
import {
  beforeAll,
  afterAll,
  describe,
  afterEach,
  it,
  beforeEach,
} from "vitest";
import { setupTestDatabase, dropTestDatabase } from "./db-test-helpers.js";
import cookieParser from "cookie-parser";
import { not, eq } from "drizzle-orm";
import { AlgorithmService } from "../services/algorithm-service.js";
import { generateCreateUserFixture } from "./fixtures.js";

let db: DatabaseConnection;
let adminApp: ReturnType<typeof express>;
let cookies: string;

beforeAll(async () => {
  const dbSetup = await setupTestDatabase();
  db = dbSetup.db;
  const authService = new AuthService(db);
  adminApp = express()
    .use(express.json())
    .use(cookieParser())
    .use("/api/auth", authRouter(authService))
    .use("/api/users", userRouter(new UserService(db), authService))
    .use(
      "/api",
      adminRouter(new AdminService(db), authService, new AlgorithmService(db)),
    );
});

beforeEach(async () => {
  const loginRes = await request(adminApp)
    .post("/api/auth/login")
    .send({
      email: "admin@comp3900.com",
      password: "tomatofactory",
    })
    .expect(200);
  cookies = loginRes.headers["set-cookie"];
});

afterAll(async () => {
  await dropTestDatabase();
});

describe("adminRouter tests", () => {
  afterEach(async () => {
    await db.delete(users).where(not(eq(users.email, "admin@comp3900.com")));
  });
  it("should remove the admin itself", async () => {
    const req = generateCreateUserFixture({
      role: "Admin",
      givenName: "Yuyun",
      familyName: "Zhou",
      password: "why I'm happy to study computer science",
      email: "hello_word@comp3900.com",
    });
    const response = await request(adminApp)
      .post("/api/users")
      .send(req)
      .expect(200);

    await request(adminApp)
      .get(`/api/users/${response.body.id}`)
      .set("Cookie", cookies)
      .expect(200);
    await request(adminApp)
      .delete(`/api/admin/${response.body.id}`)
      .set("Cookie", cookies)
      .expect(200);
    await request(adminApp)
      .get(`/api/users/${response.body.id}`)
      .set("Cookie", cookies)
      .expect(500);
  });

  it("should throw when trying to delete an admin that does not exist", async () => {
    await request(adminApp)
      .delete(`/api/admin/${uuidv4()}`)
      .set("Cookie", cookies)
      .expect(500);
  });
});
