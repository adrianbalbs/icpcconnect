import request from "supertest";
import express from "express";
import { DatabaseConnection, teams, users } from "../db/index.js";
import { adminRouter, studentRouter, teamRouter } from "../routers/index.js";
import {
    AdminService,
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
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { dropTestDatabase, setupTestDatabase } from "./db-test-helpers.js";
import { AlgorithmService } from "../services/algorithm-service.js";

let db: DatabaseConnection;
let app: ReturnType<typeof express>;

beforeAll(async () => {
  const dbSetup = await setupTestDatabase();
  db = dbSetup.db;
  app = express()
    .use(express.json())
    .use("/api", studentRouter(new StudentService(db)))
    .use("/api", contestRegistrationRouter(new ContestRegistrationService(db)))
    .use("/api", teamRouter(new TeamService(db)))
    .use("/api", adminRouter(
        new AdminService(db),
        new CoachService(db),
        new StudentService(db),
        new SiteCoordinatorService(db),
        new AlgorithmService(db)
    ));
});

afterAll(async () => {
  await dropTestDatabase();
});

describe("Algorithm Tests", () => {
  afterEach(async () => {
    await db.delete(users);
    await db.delete(teams);
  });

  it("should just return success (no registrations)", async () => {
    const numTeam = await request(app)
        .get("/api/runalgo")
        .expect(200);
    expect(numTeam.body.success).toBe(true)

    const teams = await request(app)
        .get("/api/teams/all")
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
      }
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
        allergies: "none",
        coursesTaken: [1, 2, 3],
        pythonExperience: "prof",
        cExperience: "prof",
        cppExperience: "prof",
        javaExperience: "prof",
        photoConsent: true,
        level: "A",
        leetcodeRating: 0,
        codeforcesRating: 0,
        contestExperience: 0,
        spokenLanguages: ["en"],
      };

      await request(app)
        .post("/api/contest-registration")
        .send(registration)
        .expect(200);
    }

    const allRegistrationsResponse = await request(app)
      .get("/api/contest-registration")
      .expect(200);
    expect(allRegistrationsResponse.body.registrations).toHaveLength(1);

    const algoSuccess = await request(app)
        .get("/api/runalgo")
        .expect(200);
    expect(algoSuccess.body.success).toBe(true)

    const teams = await request(app)
        .get("/api/teams/all")
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
      }
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
        allergies: "none",
        coursesTaken: [1, 2, 3],
        pythonExperience: "prof",
        cExperience: "prof",
        cppExperience: "prof",
        javaExperience: "prof",
        photoConsent: true,
        level: "A",
        leetcodeRating: 0,
        codeforcesRating: 0,
        contestExperience: 0,
        spokenLanguages: ["en"],
      };

      await request(app)
        .post("/api/contest-registration")
        .send(registration)
        .expect(200);
    }

    const allRegistrationsResponse = await request(app)
      .get("/api/contest-registration")
      .expect(200);
    expect(allRegistrationsResponse.body.registrations).toHaveLength(2);

    const algoSuccess = await request(app)
        .get("/api/runalgo")
        .expect(200);
    expect(algoSuccess.body.success).toBe(true)

    const teams = await request(app)
        .get("/api/teams/all")
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
        allergies: "none",
        coursesTaken: [1, 2, 3],
        pythonExperience: "prof",
        cExperience: "prof",
        cppExperience: "prof",
        javaExperience: "prof",
        photoConsent: true,
        level: "A",
        leetcodeRating: 0,
        codeforcesRating: 0,
        contestExperience: 0,
        spokenLanguages: ["en"],
      };

      await request(app)
        .post("/api/contest-registration")
        .send(registration)
        .expect(200);
    }

    const allRegistrationsResponse = await request(app)
      .get("/api/contest-registration")
      .expect(200);
    expect(allRegistrationsResponse.body.registrations).toHaveLength(3);

    const algoSuccess = await request(app)
        .get("/api/runalgo")
        .expect(200);
    expect(algoSuccess.body.success).toBe(true)

    const teams = await request(app)
        .get("/api/teams/all")
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
        allergies: "none",
        coursesTaken: [1, 2, 3],
        pythonExperience: "prof",
        cExperience: "prof",
        cppExperience: "prof",
        javaExperience: "prof",
        photoConsent: true,
        level: "A",
        leetcodeRating: 0,
        codeforcesRating: 0,
        contestExperience: 0,
        spokenLanguages: ["en"],
      };

      await request(app)
        .post("/api/contest-registration")
        .send(registration)
        .expect(200);
    }

    const allRegistrationsResponse = await request(app)
      .get("/api/contest-registration")
      .expect(200);
    expect(allRegistrationsResponse.body.registrations).toHaveLength(3);

    const algoSuccess = await request(app)
        .get("/api/runalgo")
        .expect(200);
    expect(algoSuccess.body.success).toBe(true)

    const teams = await request(app)
        .get("/api/teams/all")
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
        allergies: "none",
        coursesTaken: [1, 2, 3],
        pythonExperience: "prof",
        cExperience: "prof",
        cppExperience: "prof",
        javaExperience: "prof",
        photoConsent: true,
        level: "A",
        leetcodeRating: 0,
        codeforcesRating: 0,
        contestExperience: 0,
        spokenLanguages: ["en"],
      };

      await request(app)
        .post("/api/contest-registration")
        .send(registration)
        .expect(200);
    }

    const allRegistrationsResponse = await request(app)
      .get("/api/contest-registration")
      .expect(200);
    expect(allRegistrationsResponse.body.registrations).toHaveLength(6);

    const algoSuccess = await request(app)
        .get("/api/runalgo")
        .expect(200);
    expect(algoSuccess.body.success).toBe(true)

    const teams = await request(app)
        .get("/api/teams/all")
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
        }
        students.push(student)

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
            }
            students.push(student2)
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
            }
            students.push(student3)
        }
    }

    expect(students).toHaveLength(100)

    const studentIds: string[] = [];

    for (const student of students) {
      const response = await request(app)
        .post("/api/students")
        .send(student)
        .expect(200);

      studentIds.push(response.body.userId as string);

      const registration: CreateContestRegistrationForm = {
        student: response.body.userId,
        allergies: "none",
        coursesTaken: [1, 2, 3],
        pythonExperience: "prof",
        cExperience: "prof",
        cppExperience: "prof",
        javaExperience: "prof",
        photoConsent: true,
        level: "A",
        leetcodeRating: 0,
        codeforcesRating: 0,
        contestExperience: 0,
        spokenLanguages: ["en"],
      };

      await request(app)
        .post("/api/contest-registration")
        .send(registration)
        .expect(200);
    }

    const allRegistrationsResponse = await request(app)
      .get("/api/contest-registration")
      .expect(200);
    expect(allRegistrationsResponse.body.registrations).toHaveLength(100);

    const algoSuccess = await request(app)
        .get("/api/runalgo")
        .expect(200);
    expect(algoSuccess.body.success).toBe(true)

    const teams = await request(app)
        .get("/api/teams/all")
        .expect(200);
    expect(teams.body).toHaveLength(32);
  }, 60000);
});

function gen(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }