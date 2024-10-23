import { v4 as uuidv4 } from "uuid";
import request from "supertest";
import express from "express";
import { AuthService, CoachService } from "../services/index.js";
import { authRouter, coachRouter } from "../routers/index.js";
import { DatabaseConnection, users } from "../db/index.js";
import { CreateCoachRequest, UpdateCoachRequest } from "../schemas/index.js";
import { errorHandlerMiddleware } from "../middleware/error-handler-middleware.js";
import {
  beforeAll,
  afterAll,
  describe,
  afterEach,
  it,
  expect,
  beforeEach,
} from "vitest";
import { setupTestDatabase, dropTestDatabase } from "./db-test-helpers.js";
import cookieParser from "cookie-parser";
import { not, eq } from "drizzle-orm";

describe("coachRouter tests", () => {
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
      .use("/api/coaches", coachRouter(new CoachService(db), authService))
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

  afterAll(async () => {
    await dropTestDatabase();
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

    const response = await request(app)
      .get("/api/coaches")
      .set("Cookie", cookies)
      .expect(200);
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
      .set("Cookie", cookies)
      .expect(200);

    expect(response.body.id).toEqual(userId);
  });

  it("should throw if a coach cannot be found", async () => {
    await request(app)
      .get(`/api/coaches/${uuidv4()}`)
      .set("Cookie", cookies)
      .expect(404);
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

    await request(app)
      .get(`/api/coaches/${res.body.userId}`)
      .set("Cookie", cookies)
      .expect(200);

    const req: UpdateCoachRequest = {
      email: "newemail@comp3900.com",
    };

    const result = await request(app)
      .put(`/api/coaches/${res.body.userId}`)
      .set("Cookie", cookies)
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

    await request(app)
      .get(`/api/coaches/${res.body.userId}`)
      .set("Cookie", cookies)
      .expect(200);
    await request(app)
      .delete(`/api/coaches/${res.body.userId}`)
      .set("Cookie", cookies)
      .expect(200);

    await request(app)
      .get(`/api/coaches/${res.body.userId}`)
      .set("Cookie", cookies)
      .expect(404);
  });

  it("should throw when trying to delete a coach that does not exist", async () => {
    await request(app)
      .delete(`/api/coaches/${uuidv4()}`)
      .set("Cookie", cookies)
      .expect(400);
  });
});
