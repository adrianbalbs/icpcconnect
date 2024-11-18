import request, { Response } from "supertest";
import express from "express";
import {
  DatabaseConnection,
  registrationDetails,
  teams,
  users,
} from "../db/index.js";
import {
  adminRouter,
  authRouter,
  contestRouter,
  emailRouter,
  teamRouter,
  userRouter,
} from "../routers/index.js";
import {
  AdminService,
  AuthService,
  ContestService,
  JobQueue,
  EmailService,
  CodesService,
  TeamService,
  UserService,
} from "../services/index.js";
import { UpdateStudentDetails } from "../schemas/index.js";
import {
  afterAll,
  afterEach,
  beforeEach,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";
import { dropTestDatabase, setupTestDatabase } from "./db-test-helpers.js";
import { AlgorithmService } from "../services/algorithm-service.js";
import cookieParser from "cookie-parser";
import { eq, not } from "drizzle-orm";
import { generateCreateUserFixture } from "./fixtures.js";
import { env } from "../env.js";

describe("Algorithm Tests", () => {
  let db: DatabaseConnection;
  let app: ReturnType<typeof express>;
  let cookies: string;
  let contest: Response;

  beforeAll(async () => {
    const dbSetup = await setupTestDatabase();
    db = dbSetup.db;
    const authService = new AuthService(db);
    const userService = new UserService(db);
    const teamService = new TeamService(db, userService);
    const algorithmService = new AlgorithmService(userService, teamService);
    const codesService = new CodesService(db);
    app = express()
      .use(express.json())
      .use(cookieParser())
      .use("/api", emailRouter(new EmailService(db)))
      .use("/api/auth", authRouter(authService))
      .use("/api/users", userRouter(userService, authService, codesService))
      .use("/api/teams", teamRouter(teamService, authService))
      .use(
        "/api/contests",
        contestRouter(
          new ContestService(db, new JobQueue(algorithmService)),
          authService,
        ),
      )
      .use(
        "/api",
        adminRouter(new AdminService(db), authService, algorithmService),
      );
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

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const contestDate = new Date();
    contestDate.setDate(contestDate.getDate() + 3);

    contest = await request(app)
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
  });

  afterEach(async () => {
    await db.delete(users).where(not(eq(users.email, "admin@comp3900.com")));
    await db.delete(teams);
    await db.delete(registrationDetails);
  });

  afterAll(async () => {
    await dropTestDatabase();
  });

  it("should register two teams for two unis", async () => {
    const students = [
      generateCreateUserFixture({
        role: "Student",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        studentId: "z5397730",
        password: "helloworld",
        university: 1,
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "Yian",
        familyName: "Li",
        email: "yianli@comp3900.com",
        studentId: "z5418213",
        password: "helloworld",
        university: 1,
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "Kobe",
        familyName: "Shen",
        email: "kobeshen@comp3900.com",
        studentId: "z5421467",
        password: "helloworld",
        university: 1,
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "Zac",
        familyName: "Ecob",
        email: "zacecob@comp3900.com",
        studentId: "z5419703",
        password: "helloworld",
        university: 2,
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "Delph",
        familyName: "Zhou",
        email: "delphzhou@comp3900.com",
        studentId: "z5354052",
        password: "helloworld",
        university: 2,
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "Jerry",
        familyName: "Yang",
        email: "jerryyang@comp3900.com",
        studentId: "z1342356",
        password: "helloworld",
        university: 2,
      }),
    ];

    const studentIds: string[] = [];

    for (const student of students) {
      const response = await request(app)
        .post("/api/users")
        .send(student)
        .expect(200);

      studentIds.push(response.body.id as string);

      const registration: UpdateStudentDetails = {
        coursesCompleted: [1, 2, 3],
        pythonExperience: "prof",
        cExperience: "prof",
        languagesSpoken: ["en"],
        cppExperience: "prof",
        javaExperience: "prof",
        level: "A",
        leetcodeRating: 0,
        codeforcesRating: 0,
        contestExperience: 0,
      };

      await request(app)
        .patch(`/api/users/${response.body.id}/student-details`)
        .set("Cookie", cookies)
        .send(registration)
        .expect(200);

      await request(app)
        .post(`/api/users/contest-registration`)
        .set("Cookie", cookies)
        .send({ contest: contest.body.id, student: response.body.id })
        .expect(200);
    }

    const algoSuccess = await request(app)
      .post("/api/algo")
      .set("Cookie", cookies)
      .send({ contestId: contest.body.id })
      .expect(200);
    expect(algoSuccess.body.success).toBe(true);

    const teams = await request(app)
      .get("/api/teams/all")
      .set("Cookie", cookies)
      .expect(200);
    expect(teams.body.allTeams).toHaveLength(2);
  });
});
