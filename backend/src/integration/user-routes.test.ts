import { beforeAll, beforeEach, describe, afterEach, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { v4 } from "uuid";
import { DatabaseConnection, users } from "../db/index.js";
import { setupTestDatabase } from "./db-test-helpers.js";
import { AuthService, UserService } from "../services/index.js";
import cookieParser from "cookie-parser";
import { authRouter, userRouter } from "../routers/index.js";
import { eq, not } from "drizzle-orm";
import { errorHandlerMiddleware } from "../middleware/error-handler-middleware.js";
import { generateCreateUserFixture } from "./fixtures.js";

describe("userRoutes tests", () => {
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
      .use("/api/users", userRouter(new UserService(db), authService))
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
  });

  it("should register a student user", async () => {
    const user = generateCreateUserFixture({
      studentId: "z5397730",
      role: "Student",
    });

    const res = await request(app).post("/api/users").send(user).expect(200);
    expect(res.body).toHaveProperty("id");
  });

  it("should register a user that is not a student", async () => {
    const user = generateCreateUserFixture({
      role: "Coach",
    });
    const res = await request(app).post("/api/users").send(user).expect(200);
    expect(res.body).toHaveProperty("id");
  });

  it("should get all users", async () => {
    const users = [
      generateCreateUserFixture({
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "hi1@comp3900.com",
        studentId: "z5397730",
        role: "Student",
      }),
      generateCreateUserFixture({
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "hi2@comp3900.com",
        role: "Coach",
      }),
      generateCreateUserFixture({
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "hi3@comp3900.com",
        role: "Site Coordinator",
      }),
    ];

    for (const user of users) {
      await request(app).post("/api/users").send(user).expect(200);
    }

    const res = await request(app)
      .get("/api/users")
      .set("Cookie", cookies)
      .expect(200);

    // the admin user is also fetched
    expect(res.body.allUsers.length).toBe(users.length + 1);
  });

  it("should get all based on role", async () => {
    const users = [
      generateCreateUserFixture({
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "hi1@comp3900.com",
        studentId: "z5397730",
        role: "Student",
      }),
      generateCreateUserFixture({
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "hi2@comp3900.com",
        role: "Coach",
      }),
      generateCreateUserFixture({
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "hi3@comp3900.com",
        role: "Site Coordinator",
      }),
    ];

    for (const user of users) {
      await request(app).post("/api/users").send(user).expect(200);
    }

    const res = await request(app)
      .get("/api/users")
      .query({ role: "Student" })
      .set("Cookie", cookies)
      .expect(200);
    expect(res.body.allUsers.length).toBe(1);
  });

  it("should get a user based on id", async () => {
    const user = generateCreateUserFixture({
      role: "Coach",
    });
    const idRes = await request(app).post("/api/users").send(user).expect(200);
    const req = await request(app)
      .get(`/api/users/${idRes.body.id}`)
      .set("Cookie", cookies)
      .expect(200);
    expect(req.body.id).toEqual(idRes.body.id);
  });

  it("should return 404 if user is missing", async () => {
    await request(app)
      .get(`/api/users/${v4()}`)
      .set("Cookie", cookies)
      .expect(404);
  });

  it("should update a user's details", async () => {
    const user = generateCreateUserFixture({
      givenName: "Bob",
      role: "Coach",
    });
    const idRes = await request(app).post("/api/users").send(user).expect(200);
    await request(app)
      .patch(`/api/users/${idRes.body.id}`)
      .send({ givenName: "Adrian" })
      .set("Cookie", cookies)
      .expect(200);
    const req = await request(app)
      .get(`/api/users/${idRes.body.id}`)
      .set("Cookie", cookies)
      .expect(200);
    expect(req.body.givenName).toEqual("Adrian");
  });

  it("should update a user's password", async () => {
    const user = generateCreateUserFixture({
      givenName: "Bob",
      role: "Coach",
    });
    const idRes = await request(app).post("/api/users").send(user).expect(200);
    await request(app)
      .put(`/api/users/${idRes.body.id}/password`)
      .send({ password: "Bruh" })
      .set("Cookie", cookies)
      .expect(200);
  });

  it("should update a user's student details", async () => {
    const user = generateCreateUserFixture({
      studentId: "z5397730",
      role: "Student",
    });
    const idRes = await request(app).post("/api/users").send(user).expect(200);
    const initial = await request(app)
      .get(`/api/users/${idRes.body.id}`)
      .set("Cookie", cookies)
      .expect(200);
    expect(initial.body.pronouns).toEqual("");
    expect(initial.body.languagesSpoken).toEqual([]);

    await request(app)
      .patch(`/api/users/${idRes.body.id}/student-details`)
      .send({ pronouns: "he/him", languagesSpoken: ["en"] })
      .set("Cookie", cookies)
      .expect(200);

    const update = await request(app)
      .get(`/api/users/${idRes.body.id}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(update.body.pronouns).toEqual("he/him");
    expect(update.body.languagesSpoken).toEqual([
      { code: "en", name: "English" },
    ]);
  });

  it("should delete a user", async () => {
    const user = generateCreateUserFixture({
      studentId: "z5397730",
      role: "Student",
    });
    const idRes = await request(app).post("/api/users").send(user).expect(200);
    await request(app)
      .get(`/api/users/${idRes.body.id}`)
      .set("Cookie", cookies)
      .expect(200);

    await request(app)
      .delete(`/api/users/${idRes.body.id}`)
      .set("Cookie", cookies)
      .expect(200);

    await request(app)
      .get(`/api/users/${idRes.body.id}`)
      .set("Cookie", cookies)
      .expect(404);
  });

  it("should return a 400 when deleting a missing user", async () => {
    await request(app)
      .delete(`/api/users/${v4()}`)
      .set("Cookie", cookies)
      .expect(400);
  });
});