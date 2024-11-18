import { beforeAll, beforeEach, describe, afterEach, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { v4 } from "uuid";
import { DatabaseConnection, users } from "../db/index.js";
import { setupTestDatabase } from "./db-test-helpers.js";
import {
  AuthService,
  ContestService,
  JobQueue,
  CodesService,
  UserService,
  TeamService,
} from "../services/index.js";
import cookieParser from "cookie-parser";
import {
  authRouter,
  contestRouter,
  codesRouter,
  userRouter,
} from "../routers/index.js";
import { eq, not } from "drizzle-orm";
import { errorHandlerMiddleware } from "../middleware/error-handler-middleware.js";
import { generateCreateUserFixture } from "./fixtures.js";
import { AlgorithmService } from "../services/algorithm-service.js";
import { env } from "../env.js";

describe("userRoutes tests", () => {
  let db: DatabaseConnection;
  let app: ReturnType<typeof express>;
  let cookies: string;

  beforeAll(async () => {
    const dbSetup = await setupTestDatabase();
    db = dbSetup.db;
    const authService = new AuthService(db);
    const codesService = new CodesService(db);
    const userService = new UserService(db);
    app = express()
      .use(express.json())
      .use(cookieParser())
      .use("/api/auth", authRouter(authService))
      .use("/api/users", userRouter(userService, authService, codesService))
      .use("/api/codes", codesRouter(codesService, authService))
      .use(
        "/api/contests",
        contestRouter(
          new ContestService(
            db,
            new JobQueue(
              new AlgorithmService(
                userService,
                new TeamService(db, userService),
              ),
            ),
          ),
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
  });

  afterEach(async () => {
    await db.delete(users).where(not(eq(users.email, env.ADMIN_EMAIL)));
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
    const res1 = await request(app)
      .get("/api/codes/newCoachCode")
      .set("Cookie", cookies)
      .expect(200);
    expect(res1.body.code).not.toBeNull();
    expect(res1.body.code > 1000000);
    expect(res1.body.code < 9999999);

    const res2 = await request(app)
      .get("/api/codes/allRoleCodes")
      .set("Cookie", cookies)
      .expect(200);

    expect(res2.body).not.toBeNull();
    expect(res2.body[0].role).toEqual(1);
    expect(res2.body[0].code).toEqual(res1.body.code);

    const user = generateCreateUserFixture({
      role: "Coach",
      inviteCode: res1.body.code.toString(),
    });

    const res = await request(app).post("/api/users").send(user).expect(200);
    expect(res.body).toHaveProperty("id");
  });

  it("should get all users", async () => {
    const res1 = await request(app)
      .get("/api/codes/newCoachCode")
      .set("Cookie", cookies)
      .expect(200);
    expect(res1.body.code).not.toBeNull();
    expect(res1.body.code > 1000000);
    expect(res1.body.code < 9999999);

    const res2 = await request(app)
      .get("/api/codes/newSiteCoordCode")
      .set("Cookie", cookies)
      .expect(200);
    expect(res2.body.code).not.toBeNull();
    expect(res2.body.code > 1000000);
    expect(res2.body.code < 9999999);

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
        inviteCode: res1.body.code.toString(),
      }),
      generateCreateUserFixture({
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "hi3@comp3900.com",
        role: "Site Coordinator",
        inviteCode: res2.body.code.toString(),
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
    const res1 = await request(app)
      .get("/api/codes/newCoachCode")
      .set("Cookie", cookies)
      .expect(200);
    expect(res1.body.code).not.toBeNull();
    expect(res1.body.code > 1000000);
    expect(res1.body.code < 9999999);

    const res2 = await request(app)
      .get("/api/codes/newSiteCoordCode")
      .set("Cookie", cookies)
      .expect(200);
    expect(res2.body.code).not.toBeNull();
    expect(res2.body.code > 1000000);
    expect(res2.body.code < 9999999);

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
        inviteCode: res1.body.code.toString(),
      }),
      generateCreateUserFixture({
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "hi3@comp3900.com",
        role: "Site Coordinator",
        inviteCode: res2.body.code.toString(),
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
    const res1 = await request(app)
      .get("/api/codes/newCoachCode")
      .set("Cookie", cookies)
      .expect(200);
    expect(res1.body.code).not.toBeNull();
    expect(res1.body.code > 1000000);
    expect(res1.body.code < 9999999);

    const user = generateCreateUserFixture({
      role: "Coach",
      inviteCode: res1.body.code.toString(),
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
    const res1 = await request(app)
      .get("/api/codes/newCoachCode")
      .set("Cookie", cookies)
      .expect(200);
    expect(res1.body.code).not.toBeNull();
    expect(res1.body.code > 1000000);
    expect(res1.body.code < 9999999);

    const user = generateCreateUserFixture({
      givenName: "Bob",
      role: "Coach",
      inviteCode: res1.body.code.toString(),
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
    const res1 = await request(app)
      .get("/api/codes/newCoachCode")
      .set("Cookie", cookies)
      .expect(200);
    expect(res1.body.code).not.toBeNull();
    expect(res1.body.code > 1000000);
    expect(res1.body.code < 9999999);

    const user = generateCreateUserFixture({
      givenName: "Bob",
      role: "Coach",
      inviteCode: res1.body.code.toString(),
    });
    const idRes = await request(app).post("/api/users").send(user).expect(200);
    await request(app)
      .put(`/api/users/${idRes.body.id}/password`)
      .send({ oldPassword: "securePassword123!", newPassword: "Bruh" })
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

  it("should register a user for a contest", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const contestDate = new Date();
    contestDate.setDate(contestDate.getDate() + 3);

    const contest = await request(app)
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

    const user = generateCreateUserFixture({
      studentId: "z5397730",
      role: "Student",
    });

    const student = await request(app)
      .post("/api/users")
      .send(user)
      .expect(200);

    await request(app)
      .post("/api/users/contest-registration")
      .set("Cookie", cookies)
      .send({ student: student.body.id, contest: contest.body.id })
      .expect(200);
  });

  it("should get a user's registration for a contest", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const contestDate = new Date();
    contestDate.setDate(contestDate.getDate() + 3);

    const contest = await request(app)
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

    const user = generateCreateUserFixture({
      studentId: "z5397730",
      role: "Student",
    });

    const student = await request(app)
      .post("/api/users")
      .send(user)
      .expect(200);

    await request(app)
      .post("/api/users/contest-registration")
      .set("Cookie", cookies)
      .send({ student: student.body.id, contest: contest.body.id })
      .expect(200);

    await request(app)
      .get(
        `/api/users/${student.body.id}/contest-registration/${contest.body.id}`,
      )
      .set("Cookie", cookies)
      .expect(200);
  });

  it("should delete a user's contest registration", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const contestDate = new Date();
    contestDate.setDate(contestDate.getDate() + 3);

    const contest = await request(app)
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

    const user = generateCreateUserFixture({
      studentId: "z5397730",
      role: "Student",
    });

    const student = await request(app)
      .post("/api/users")
      .send(user)
      .expect(200);

    await request(app)
      .post("/api/users/contest-registration")
      .set("Cookie", cookies)
      .send({ student: student.body.id, contest: contest.body.id })
      .expect(200);

    await request(app)
      .get(
        `/api/users/${student.body.id}/contest-registration/${contest.body.id}`,
      )
      .set("Cookie", cookies)
      .expect(200);

    await request(app)
      .delete(
        `/api/users/${student.body.id}/contest-registration/${contest.body.id}`,
      )
      .set("Cookie", cookies)
      .expect(200);

    await request(app)
      .get(
        `/api/users/${student.body.id}/contest-registration/${contest.body.id}`,
      )
      .set("Cookie", cookies)
      .expect(404);
  });
});
