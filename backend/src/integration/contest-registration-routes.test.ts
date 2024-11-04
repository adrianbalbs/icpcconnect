import request from "supertest";
import express from "express";
import { DatabaseConnection, users } from "../db/index.js";
import { authRouter, userRouter } from "../routers/index.js";
import {
  AuthService,
  ContestRegistrationService,
  GetRegistrationFormResponse,
  UpdateContestRegistrationFormResponse,
  UserService,
} from "../services/index.js";
import { contestRegistrationRouter } from "../routers/index.js";
import {
  CreateContestRegistrationForm,
  UpdateContestRegistrationForm,
} from "../schemas/index.js";
import { v4 as uuidv4 } from "uuid";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { dropTestDatabase, setupTestDatabase } from "./db-test-helpers.js";
import cookieParser from "cookie-parser";
import { not, eq } from "drizzle-orm";
import { generateCreateUserFixture } from "./fixtures.js";

describe("contestRegistrationRouter tests", () => {
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
      .use(
        "/api/contest-registration",
        contestRegistrationRouter(
          new ContestRegistrationService(db),
          authService,
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
  });

  afterAll(async () => {
    await dropTestDatabase();
  });

  it("should create a new form for student", async () => {
    const req = generateCreateUserFixture({
      role: "Student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
    });
    const response = await request(app)
      .post("/api/users")
      .send(req)
      .expect(200);

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

    const regRes = await request(app)
      .post("/api/contest-registration")
      .set("Cookie", cookies)
      .send(registration)
      .expect(200);
    expect(regRes.body).toHaveProperty("studentId");
  });

  it("should get registration details by id", async () => {
    const req = generateCreateUserFixture({
      role: "Student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
    });
    const response = await request(app)
      .post("/api/users")
      .send(req)
      .expect(200);

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

    const nextRes = await request(app)
      .get(`/api/contest-registration/${response.body.id}`)
      .set("Cookie", cookies)
      .expect(200);
    expect(nextRes.body.student).toEqual(response.body.id);
  });

  it("should throw if a student has not registered", async () => {
    await request(app)
      .get(`/api/contest-registration/${uuidv4()}`)
      .set("Cookie", cookies)
      .expect(500);
  });

  it("should update a student's registration details", async () => {
    const req = generateCreateUserFixture({
      role: "Student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
    });

    const response = await request(app)
      .post("/api/users")
      .send(req)
      .expect(200);

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

    const { student: _, ...registrationWithoutStudent } = registration;
    const newDetails: UpdateContestRegistrationForm = {
      ...registrationWithoutStudent,
      coursesCompleted: [1, 2],
      level: "B",
    };

    const nextRes = await request(app)
      .put(`/api/contest-registration/${response.body.id}`)
      .set("Cookie", cookies)
      .send(newDetails)
      .expect(200);

    const body: UpdateContestRegistrationFormResponse = nextRes.body;
    expect(body).toEqual(newDetails);

    const getRes = await request(app)
      .get(`/api/contest-registration/${response.body.id}`)
      .set("Cookie", cookies)
      .expect(200);
    const getBody: GetRegistrationFormResponse = getRes.body;
    expect(getBody.level).toEqual("B");
    expect(getBody.coursesCompleted.map((course) => course.id)).toEqual([1, 2]);
  });

  it("should get all student registrations", async () => {
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
        university: 2,
      }),
      generateCreateUserFixture({
        role: "Student",
        givenName: "John",
        familyName: "Smith",
        email: "johnsmith@comp3900.com",
        studentId: "z5397732",
        password: "securepass",
        university: 3,
      }),
    ];

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
        .send(registration)
        .expect(200);
    }

    const allRegistrationsResponse = await request(app)
      .get("/api/contest-registration")
      .set("Cookie", cookies)
      .expect(200);
    expect(allRegistrationsResponse.body.registrations).toHaveLength(3);
  });

  it("should delete a student's registration", async () => {
    const req = generateCreateUserFixture({
      role: "Student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
    });
    const response = await request(app)
      .post("/api/users")
      .send(req)
      .expect(200);

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

    await request(app)
      .get(`/api/contest-registration/${response.body.id}`)
      .set("Cookie", cookies)
      .expect(200);
    await request(app)
      .delete(`/api/contest-registration/${response.body.id}`)
      .set("Cookie", cookies)
      .expect(200);
    await request(app)
      .get(`/api/contest-registration/${response.body.id}`)
      .set("Cookie", cookies)
      .expect(500);
  });

  it("should return a 500 when deleting a registration that does not exist", async () => {
    await request(app)
      .delete(`/api/contest-registration/${uuidv4()}`)
      .set("Cookie", cookies)
      .expect(500);
  });
});
