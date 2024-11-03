import request from "supertest";
import express from "express";
import { DatabaseConnection, teams, users } from "../db/index.js";
import {
  adminRouter,
  authRouter,
  studentRouter,
  teamRouter,
} from "../routers/index.js";
import {
  AdminService,
  AuthService,
  CoachService,
  ContestRegistrationService,
  SiteCoordinatorService,
  StudentService,
  TeamService,
} from "../services/index.js";
import { contestRegistrationRouter } from "../routers/index.js";
import {
  CreateContestRegistrationForm,
  CreateStudentRequest,
} from "../schemas/index.js";
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

describe("Algorithm Tests", () => {
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
      .use("/api/students", studentRouter(new StudentService(db), authService))
      .use(
        "/api/contest-registration",
        contestRegistrationRouter(
          new ContestRegistrationService(db),
          authService,
        ),
      )
      .use("/api/teams", teamRouter(new TeamService(db), authService))
      .use(
        "/api",
        adminRouter(
          new AdminService(db),
          new CoachService(db),
          new StudentService(db),
          new SiteCoordinatorService(db),
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
    const students: CreateStudentRequest[] = [
      {
        role: "student",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        studentId: "z5397730",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
    ];

    const studentIds: string[] = [];

    for (const student of students) {
      const response = await request(app)
        .post("/api/students")
        .send(student)
        .expect(200);

      studentIds.push(response.body.userId as string);

      const registration: CreateContestRegistrationForm = {
        student: response.body.userId,
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
    expect(allRegistrationsResponse.body.registrations).toHaveLength(1);

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
    const students: CreateStudentRequest[] = [
      {
        role: "student",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        studentId: "z5397730",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: false,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Jane",
        familyName: "Doe",
        email: "janedoe@comp3900.com",
        studentId: "z5397731",
        password: "password123",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
    ];

    const studentIds: string[] = [];

    for (const student of students) {
      const response = await request(app)
        .post("/api/students")
        .send(student)
        .expect(200);

      studentIds.push(response.body.userId as string);

      const registration: CreateContestRegistrationForm = {
        student: response.body.userId,
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
    expect(allRegistrationsResponse.body.registrations).toHaveLength(2);

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
    const students: CreateStudentRequest[] = [
      {
        role: "student",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        studentId: "z5397730",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: false,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Jane",
        familyName: "Doe",
        email: "janedoe@comp3900.com",
        studentId: "z5397731",
        password: "password123",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "John",
        familyName: "Smith",
        email: "johnsmith@comp3900.com",
        studentId: "z5397732",
        password: "securepass",
        university: 1,
        verificationCode: "test",
        photoConsent: true,
        languagesSpoken: [],
      },
    ];

    const studentIds: string[] = [];

    for (const student of students) {
      const response = await request(app)
        .post("/api/students")
        .send(student)
        .expect(200);

      studentIds.push(response.body.userId as string);

      const registration: CreateContestRegistrationForm = {
        student: response.body.userId,
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
    expect(allRegistrationsResponse.body.registrations).toHaveLength(3);

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
  });

  it("should create three students, two same uni, one different, and not create a team with them", async () => {
    const students: CreateStudentRequest[] = [
      {
        role: "student",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        studentId: "z5397730",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: false,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Jane",
        familyName: "Doe",
        email: "janedoe@comp3900.com",
        studentId: "z5397731",
        password: "password123",
        university: 1,
        verificationCode: "test",
        photoConsent: false,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "John",
        familyName: "Smith",
        email: "johnsmith@comp3900.com",
        studentId: "z5397732",
        password: "securepass",
        university: 2,
        verificationCode: "test",
        photoConsent: false,
        languagesSpoken: [],
      },
    ];

    const studentIds: string[] = [];

    for (const student of students) {
      const response = await request(app)
        .post("/api/students")
        .send(student)
        .expect(200);

      studentIds.push(response.body.userId as string);

      const registration: CreateContestRegistrationForm = {
        student: response.body.userId,
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
    expect(allRegistrationsResponse.body.registrations).toHaveLength(3);

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
    const students: CreateStudentRequest[] = [
      {
        role: "student",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        studentId: "z5397730",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        photoConsent: false,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Jane",
        familyName: "Doe",
        email: "janedoe@comp3900.com",
        studentId: "z5397731",
        password: "password123",
        university: 1,
        verificationCode: "test",
        photoConsent: false,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "John",
        familyName: "Smith",
        email: "johnsmith@comp3900.com",
        studentId: "z5397732",
        password: "securepass",
        university: 1,
        verificationCode: "test",
        photoConsent: false,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Jerry",
        familyName: "Yang",
        email: "jerryyang@comp3900.com",
        studentId: "z5421983",
        password: "helloworld",
        university: 2,
        verificationCode: "test",
        photoConsent: false,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Meow",
        familyName: "Woof",
        email: "meowwoof@comp3900.com",
        studentId: "z5247731",
        password: "password123",
        university: 2,
        verificationCode: "test",
        photoConsent: false,
        languagesSpoken: [],
      },
      {
        role: "student",
        givenName: "Potato",
        familyName: "Potato",
        email: "potato2@comp3900.com",
        studentId: "z5398932",
        password: "securepass",
        university: 2,
        verificationCode: "test",
        photoConsent: false,
        languagesSpoken: [],
      },
    ];

    const studentIds: string[] = [];

    for (const student of students) {
      const response = await request(app)
        .post("/api/students")
        .send(student)
        .expect(200);

      studentIds.push(response.body.userId as string);

      const registration: CreateContestRegistrationForm = {
        student: response.body.userId,
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
    expect(allRegistrationsResponse.body.registrations).toHaveLength(6);

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
    const students: CreateStudentRequest[] = [];

    for (let i = 0; i < 50; i++) {
      const student: CreateStudentRequest = {
        role: "student",
        givenName: gen(6),
        familyName: gen(6),
        email: gen(7) + "@comp3900.com",
        studentId: gen(10),
        password: "securepass",
        university: 1,
        verificationCode: "test",
        photoConsent: false,
        languagesSpoken: [],
      };
      students.push(student);

      if (i < 20) {
        const student2: CreateStudentRequest = {
          role: "student",
          givenName: gen(6),
          familyName: gen(6),
          email: gen(7) + "@comp3900.com",
          studentId: gen(10),
          password: "securepass",
          university: 2,
          verificationCode: "test",
          photoConsent: false,
          languagesSpoken: [],
        };
        students.push(student2);
      }

      if (i < 41 && i > 10) {
        const student3: CreateStudentRequest = {
          role: "student",
          givenName: gen(6),
          familyName: gen(6),
          email: gen(7) + "@comp3900.com",
          studentId: gen(10),
          password: "securepass",
          university: 3,
          verificationCode: "test",
          photoConsent: false,
          languagesSpoken: [],
        };
        students.push(student3);
      }
    }

    expect(students).toHaveLength(100);

    const studentIds: string[] = [];

    for (const student of students) {
      const response = await request(app)
        .post("/api/students")
        .send(student)
        .expect(200);

      studentIds.push(response.body.userId as string);

      const registration: CreateContestRegistrationForm = {
        student: response.body.userId,
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

function gen(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}