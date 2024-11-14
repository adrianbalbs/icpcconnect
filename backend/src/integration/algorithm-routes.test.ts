import request from "supertest";
import express from "express";
import { DatabaseConnection, teams, users } from "../db/index.js";
import {
  adminRouter,
  authRouter,
  emailRouter,
  teamRouter,
  userRouter,
} from "../routers/index.js";
import {
  AdminService,
  AuthService,
  ContestRegistrationService,
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

describe("Algorithm Tests", () => {
  let db: DatabaseConnection;
  let app: ReturnType<typeof express>;
  let cookies: string;
  beforeAll(async () => {
    const dbSetup = await setupTestDatabase();
    db = dbSetup.db;
    const authService = new AuthService(db);
    const codesService = new CodesService(db);
    app = express()
      .use(express.json())
      .use(cookieParser())
      .use("/api", emailRouter(new EmailService(db)))
      .use("/api/auth", authRouter(authService))
      .use("/api/users", userRouter(new UserService(db), authService, codesService))
      .use("/api/teams", teamRouter(new TeamService(db), authService))
      .use(
        "/api",
        adminRouter(
          new AdminService(db),
          authService,
          new AlgorithmService(db),
        ),
      );
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
    await db.delete(teams);
  });

  afterAll(async () => {
    await dropTestDatabase();
  });

  it("should just return success (no registrations)", async () => {
    const numTeam = await request(app)
      .post("/api/runalgo")
      .set("Cookie", cookies)
      .expect(200);
    expect(numTeam.body.success).toBe(true);

    const teams = await request(app)
      .get("/api/teams/all")
      .set("Cookie", cookies)
      .expect(200);
    expect(teams.body).toHaveLength(0);
  });

  it("should just return success (1 registrations)", async () => {
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
    }

    const algoSuccess = await request(app)
      .post("/api/runalgo")
      .set("Cookie", cookies)
      .expect(200);
    expect(algoSuccess.body.success).toBe(true);

    const teams = await request(app)
      .get("/api/teams/all")
      .set("Cookie", cookies)
      .expect(200);
    expect(teams.body).toHaveLength(0);
  });

  it("should just return success (2 registrations)", async () => {
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
        givenName: "Jane",
        familyName: "Doe",
        email: "janedoe@comp3900.com",
        studentId: "z5397731",
        password: "password123",
        university: 1,
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
    }

    const algoSuccess = await request(app)
      .post("/api/runalgo")
      .set("Cookie", cookies)
      .expect(200);
    expect(algoSuccess.body.success).toBe(true);

    const teams = await request(app)
      .get("/api/teams/all")
      .set("Cookie", cookies)
      .expect(200);
    expect(teams.body).toHaveLength(0);
  });

  it("should create three students at the same uni and create a team with them", async () => {

    const USE_TRUE_EMAIL = false;

    const EMAILS = {
      adrian: {
        true: "z5397730@ad.unsw.edu.au",
        fake: "adrianbalbs@comp3900.com"
      },
      zac: {
        true: "z5419703@ad.unsw.edu.au",
        fake: "zac@comp3900.com"
      },
      delph: {
        true: "z5354052@ad.unsw.edu.au",
        fake: "delph@comp3900.com"
      }
    };

    const students = [
      generateCreateUserFixture({
        role: "Student",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: USE_TRUE_EMAIL ? EMAILS.adrian.true : EMAILS.adrian.fake,
        studentId: "z5397730",
        password: "helloworld",
        university: 1
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "Delph",
        familyName: "Zhou",
        email: USE_TRUE_EMAIL ? EMAILS.delph.true : EMAILS.delph.fake,
        studentId: "z5354052",
        password: "password123",
        university: 1
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "Zac",
        familyName: "Z",
        email: USE_TRUE_EMAIL ? EMAILS.zac.true : EMAILS.zac.fake,
        studentId: "z5419703",
        password: "securepass",
        university: 1
      })
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
    }

    const algoSuccess = await request(app)
      .post("/api/runalgo")
      .set("Cookie", cookies)
      .expect(200);
    expect(algoSuccess.body.success).toBe(true);

    const teams = await request(app)
      .get("/api/teams/all")
      .set("Cookie", cookies)
      .expect(200);
    expect(teams.body).toHaveLength(1);

    // Call send team created email stuff
    await request(app)
      .post("/api/sendTeamCreatedEmail")
      .expect(200);

  }, 60000);

  it("should create three students, two same uni, one different, and not create a team with them", async () => {
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
        givenName: "Jane",
        familyName: "Doe",
        email: "janedoe@comp3900.com",
        studentId: "z5397731",
        password: "password123",
        university: 1,
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "John",
        familyName: "Smith",
        email: "johnsmith@comp3900.com",
        studentId: "z5397732",
        password: "securepass",
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
    }

    const algoSuccess = await request(app)
      .post("/api/runalgo")
      .set("Cookie", cookies)
      .expect(200);
    expect(algoSuccess.body.success).toBe(true);

    const teams = await request(app)
      .get("/api/teams/all")
      .set("Cookie", cookies)
      .expect(200);
    expect(teams.body).toHaveLength(0);
  });

  it("should create three students for two unis and create a team for both of them", async () => {
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
        givenName: "Jane",
        familyName: "Doe",
        email: "janedoe@comp3900.com",
        studentId: "z5397731",
        password: "password123",
        university: 1,
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "John",
        familyName: "Smith",
        email: "johnsmith@comp3900.com",
        studentId: "z5397732",
        password: "securepass",
        university: 1,
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "Jerry",
        familyName: "Yang",
        email: "jerryyang@comp3900.com",
        studentId: "z5421983",
        password: "helloworld",
        university: 2,
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "Meow",
        familyName: "Woof",
        email: "meowwoof@comp3900.com",
        studentId: "z5247731",
        password: "password123",
        university: 2,
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "Potato",
        familyName: "Potato",
        email: "potato2@comp3900.com",
        studentId: "z5398932",
        password: "securepass",
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
    }

    const algoSuccess = await request(app)
      .post("/api/runalgo")
      .set("Cookie", cookies)
      .expect(200);
    expect(algoSuccess.body.success).toBe(true);

    const teams = await request(app)
      .get("/api/teams/all")
      .set("Cookie", cookies)
      .expect(200);
    expect(teams.body).toHaveLength(2);
  });

  it("should generate 50 students at the same uni, 30 at another, and 20 at another, and create a total of 32 teams", async () => {
    const students: CreateUser[] = [];

    for (let i = 0; i < 50; i++) {
      const student = generateCreateUserFixture({
        role: "Student",
        givenName: gen(6),
        familyName: gen(6),
        email: gen(7) + "@comp3900.com",
        studentId: gen(10),
        password: "securepass",
        university: 1,
      });
      students.push(student);

      if (i < 20) {
        const student2 = generateCreateUserFixture({
          role: "Student",
          givenName: gen(6),
          familyName: gen(6),
          email: gen(7) + "@comp3900.com",
          studentId: gen(10),
          password: "securepass",
          university: 2,
        });
        students.push(student2);
      }

      if (i < 41 && i > 10) {
        const student3 = generateCreateUserFixture({
          role: "Student",
          givenName: gen(6),
          familyName: gen(6),
          email: gen(7) + "@comp3900.com",
          studentId: gen(10),
          password: "securepass",
          university: 3,
        });
        students.push(student3);
      }
    }

    expect(students).toHaveLength(100);

    const studentIds: string[] = [];

    for (const student of students) {
      const response = await request(app)
        .post("/api/users")
        .send(student)
        .expect(200);

      studentIds.push(response.body.id as string);

      const registration: CreateContestRegistrationForm = {
        student: response.body.id,
        coursesCompleted: [1, 2, 3],
        pythonExperience: "prof",
        cExperience: "prof",
        cppExperience: "prof",
        javaExperience: "prof",
        level: "A",
        leetcodeRating: 0,
        codeforcesRating: 0,
        contestExperience: 0,
      };

      await request(app)
        .post("/api/contest-registration")
        .set("Cookie", cookies)
        .send(registration)
        .expect(200);
    }

    const allRegistrationsResponse = await request(app)
      .get("/api/contest-registration")
      .set("Cookie", cookies)
      .expect(200);
    expect(allRegistrationsResponse.body.registrations).toHaveLength(100);

    const algoSuccess = await request(app)
      .post("/api/runalgo")
      .set("Cookie", cookies)
      .expect(200);
    expect(algoSuccess.body.success).toBe(true);

    const teams = await request(app)
      .get("/api/teams/all")
      .set("Cookie", cookies)
      .expect(200);
    expect(teams.body).toHaveLength(32);
  }, 60000);
});

// function gen(length: number): string {
//   const characters =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   let result = "";
//   for (let i = 0; i < length; i++) {
//     const randomIndex = Math.floor(Math.random() * characters.length);
//     result += characters[randomIndex];
//   }
//   return result;
// }
