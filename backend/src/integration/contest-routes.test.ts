import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
  expect,
} from "vitest";
import { authRouter, contestRouter } from "../routers";
import {
  AuthService,
  ContestService,
  JobQueue,
  TeamService,
  UserService,
} from "../services";
import { dropTestDatabase, setupTestDatabase } from "./db-test-helpers";
import { errorHandlerMiddleware } from "../middleware";
import { contests, DatabaseConnection } from "../db";
import { v4 } from "uuid";
import { AlgorithmService } from "../services/algorithm-service";
import { CreateContest } from "../schemas";
import { env } from "../env";

describe("contestRouter tests", () => {
  let db: DatabaseConnection;
  let app: ReturnType<typeof express>;
  let cookies: string;

  beforeAll(async () => {
    const dbSetup = await setupTestDatabase();
    db = dbSetup.db;
    const authService = new AuthService(db);
    const userService = new UserService(db);
    const teamService = new TeamService(db, userService);
    app = express()
      .use(express.json())
      .use(cookieParser())
      .use("/api/auth", authRouter(authService))
      .use(
        "/api/contests",
        contestRouter(
          new ContestService(
            db,
            new JobQueue(new AlgorithmService(userService, teamService)),
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
    await db.delete(contests);
  });

  afterAll(async () => {
    await dropTestDatabase();
  });

  it("should create a new contest", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const contestDate = new Date();
    contestDate.setDate(contestDate.getDate() + 3);

    const res = await request(app)
      .post("/api/contests")
      .set("Cookie", cookies)
      .send({
        name: "Test Contest",
        earlyBirdDate: tomorrow,
        cutoffDate: dayAfterTomorrow,
        contestDate: contestDate,
        site: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
  });

  it("should return 400 if early bird is after cutoff", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const contestDate = new Date();
    contestDate.setDate(contestDate.getDate() + 4);
    await request(app)
      .post("/api/contests")
      .set("Cookie", cookies)
      .send({
        name: "Test Contest",
        earlyBirdDate: tomorrow,
        cutoffDate: dayAfterTomorrow,
        contestDate: contestDate,
        site: 1,
      })
      .expect(400);
  });

  it("should return 400 is cutoff date is after contest", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 5);

    const contestDate = new Date();
    contestDate.setDate(contestDate.getDate() + 4);
    await request(app)
      .post("/api/contests")
      .set("Cookie", cookies)
      .send({
        name: "Test Contest",
        earlyBirdDate: tomorrow,
        cutoffDate: dayAfterTomorrow,
        contestDate: contestDate,
        site: 1,
      })
      .expect(400);
  });

  it("should get all contests", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const contestDate = new Date();
    contestDate.setDate(contestDate.getDate() + 3);
    const contests: CreateContest[] = [
      {
        name: "Test Contest 1",
        earlyBirdDate: tomorrow,
        cutoffDate: dayAfterTomorrow,
        contestDate: contestDate,
        site: 1,
      },
      {
        name: "Test Contest 2",
        earlyBirdDate: tomorrow,
        cutoffDate: dayAfterTomorrow,
        contestDate: contestDate,
        site: 1,
      },
      {
        name: "Test Contest 3",
        earlyBirdDate: tomorrow,
        cutoffDate: dayAfterTomorrow,
        contestDate: contestDate,
        site: 1,
      },
    ];
    for (const contest of contests) {
      await request(app)
        .post("/api/contests")
        .set("Cookie", cookies)
        .send(contest)
        .expect(200);
    }

    await request(app)
      .get("/api/contests")
      .set("Cookie", cookies)
      .expect(200)
      .expect((res) => {
        expect(res.body.allContests).toHaveLength(3);
      });
  });

  it("should get a contest", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const contestDate = new Date();
    contestDate.setDate(contestDate.getDate() + 3);

    const res = await request(app)
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

    await request(app)
      .get(`/api/contests/${res.body.id}`)
      .set("Cookie", cookies)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("name");
        expect(res.body).toHaveProperty("earlyBirdDate");
        expect(res.body).toHaveProperty("cutoffDate");
        expect(res.body).toHaveProperty("contestDate");
        expect(res.body).toHaveProperty("siteId");
        expect(res.body).toHaveProperty("site");
      });
  });

  it("should return 404 if no contest is found", async () => {
    await request(app)
      .get(`/api/contests/${v4()}`)
      .set("Cookie", cookies)
      .expect(404);
  });

  it("should update a contest's info", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const contestDate = new Date();
    contestDate.setDate(contestDate.getDate() + 3);
    const res = await request(app)
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

    await request(app)
      .get(`/api/contests/${res.body.id}`)
      .set("Cookie", cookies)
      .expect(200)
      .expect((res) => {
        const actualDate = new Date(res.body.contestDate);
        expect(actualDate.toISOString().split("T")[0]).toBe(
          contestDate.toISOString().split("T")[0],
        );
      });

    const updatedContestDate = new Date();
    updatedContestDate.setDate(updatedContestDate.getDate() + 10);
    await request(app)
      .put(`/api/contests/${res.body.id}`)
      .set("Cookie", cookies)
      .send({
        name: "Epic Contest",
        earlyBirdDate: tomorrow,
        cutoffDate: dayAfterTomorrow,
        contestDate: updatedContestDate,
        site: 1,
      })
      .expect(200);

    await request(app)
      .get(`/api/contests/${res.body.id}`)
      .set("Cookie", cookies)
      .expect(200)
      .expect((res) => {
        const actualDate = new Date(res.body.contestDate);
        expect(res.body.name).not.toBe("Test Contest");
        expect(actualDate.toISOString().split("T")[0]).toBe(
          updatedContestDate.toISOString().split("T")[0],
        );
      });
  });

  it("should delete a contest", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const contestDate = new Date();
    contestDate.setDate(contestDate.getDate() + 3);
    const res = await request(app)
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

    await request(app)
      .get(`/api/contests/${res.body.id}`)
      .set("Cookie", cookies)
      .expect(200);
    await request(app)
      .delete(`/api/contests/${res.body.id}`)
      .set("Cookie", cookies)
      .expect(200);
    await request(app)
      .get(`/api/contests/${res.body.id}`)
      .set("Cookie", cookies)
      .expect(404);
  });

  it("should return 400 when deleting a contest that does not exist", async () => {
    await request(app)
      .delete(`/api/contests/${v4()}`)
      .set("Cookie", cookies)
      .expect(400);
  });
});
