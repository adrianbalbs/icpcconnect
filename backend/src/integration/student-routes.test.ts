import {
  beforeAll,
  afterAll,
  afterEach,
  describe,
  expect,
  it,
  beforeEach,
} from "vitest";
import { v4 as uuidv4 } from "uuid";
import request from "supertest";
import express from "express";
import { AuthService, StudentService } from "../services/index.js";
import { authRouter, studentRouter } from "../routers/index.js";
import { DatabaseConnection, users } from "../db/index.js";
import {
  CreateStudentRequest,
  UpdateStudentExclusionsRequest,
  UpdateStudentRequest,
} from "../schemas/index.js";
import { errorHandlerMiddleware } from "../middleware/error-handler-middleware.js";
import { dropTestDatabase, setupTestDatabase } from "./db-test-helpers.js";
import cookieParser from "cookie-parser";
import { eq, not } from "drizzle-orm";

describe("studentRouter tests", () => {
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

  it("should register a new student", async () => {
    const req: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
      languagesSpoken: ["en"],
      photoConsent: true,
    };
    const response = await request(app)
      .post("/api/students")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("userId");
  });

  it("should get all students", async () => {
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
        languagesSpoken: ["en"],
        photoConsent: true,
      },
      {
        role: "student",
        givenName: "Test",
        familyName: "User",
        email: "testuser@comp3900.com",
        studentId: "z1234567",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        languagesSpoken: ["en"],
        photoConsent: true,
      },
      {
        role: "student",
        givenName: "Test",
        familyName: "User2",
        email: "testuser2@comp3900.com",
        studentId: "z1234568",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
        languagesSpoken: ["en"],
        photoConsent: true,
      },
    ];
    for (const student of students) {
      await request(app).post("/api/students").send(student).expect(200);
    }

    const response = await request(app)
      .get("/api/students")
      .set("Cookie", cookies)
      .expect(200);
    expect(response.body.allStudents.length).toEqual(students.length);
  });

  it("should get a student by id", async () => {
    const req: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
      languagesSpoken: ["en"],
      photoConsent: true,
    };
    const user = await request(app).post("/api/students").send(req).expect(200);

    const { userId } = user.body;

    const response = await request(app)
      .get(`/api/students/${userId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(response.body.id).toEqual(userId);
  });

  it("should throw if a student cannot be found", async () => {
    await request(app)
      .get(`/api/students/${uuidv4()}`)
      .set("Cookie", cookies)
      .expect(404);
  });

  it("should update the students details", async () => {
    const newStudent: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
      languagesSpoken: ["en"],
      photoConsent: true,
    };
    const res = await request(app)
      .post("/api/students")
      .send(newStudent)
      .expect(200);

    const oldStudentDetails = await request(app)
      .get(`/api/students/${res.body.userId}`)
      .set("Cookie", cookies)
      .expect(200);

    const req: UpdateStudentRequest = {
      pronouns: "he/him",
      team: null,
      dietaryRequirements: "vegan",
      tshirtSize: "M",
    };

    await request(app)
      .put(`/api/students/${res.body.userId}`)
      .set("Cookie", cookies)
      .send(req)
      .expect(200);

    const newStudentDetails = await request(app)
      .get(`/api/students/${res.body.userId}`)
      .set("Cookie", cookies)
      .expect(200);
    expect(oldStudentDetails.body).not.toEqual(newStudentDetails.body);
  });

  it("should not update the students details when there are no changes", async () => {
    const newStudent: CreateStudentRequest = {
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
    };
    const res = await request(app)
      .post("/api/students")
      .send(newStudent)
      .expect(200);

    const oldStudentDetails = await request(app)
      .get(`/api/students/${res.body.userId}`)
      .set("Cookie", cookies)
      .expect(200);

    const req: UpdateStudentRequest = {};

    await request(app)
      .put(`/api/students/${res.body.userId}`)
      .set("Cookie", cookies)
      .send(req)
      .expect(200);

    const newStudentDetails = await request(app)
      .get(`/api/students/${res.body.userId}`)
      .set("Cookie", cookies)
      .expect(200);
    expect(oldStudentDetails.body).toEqual(newStudentDetails.body);
  });

  it("should remove student from the database", async () => {
    const newStudent: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
      languagesSpoken: ["en"],
      photoConsent: true,
    };
    const res = await request(app)
      .post("/api/students")
      .send(newStudent)
      .expect(200);

    await request(app)
      .get(`/api/students/${res.body.userId}`)
      .set("Cookie", cookies)
      .expect(200);
    await request(app)
      .delete(`/api/students/${res.body.userId}`)
      .set("Cookie", cookies)
      .expect(200);

    await request(app)
      .get(`/api/students/${res.body.userId}`)
      .set("Cookie", cookies)
      .expect(404);
  });

  it("should return an error when deleting a student that does not exist", async () => {
    await request(app)
      .delete(`/api/students/${uuidv4()}`)
      .set("Cookie", cookies)
      .expect(400);
  });

  it("should update the students exclusion preferences", async () => {
    const req: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
      photoConsent: true,
      languagesSpoken: ["ab"],
    };
    const response = await request(app)
      .post("/api/students")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("userId");
    const userid = response.body.userId;

    const emptyExclu = await request(app)
      .get(`/api/students/exclusions/${userid}`)
      .set("Cookie", cookies)
      .expect(200);
    expect(emptyExclu.body[0]).toHaveProperty("exclusions");
    expect(emptyExclu.body[0].exclusions).toBe("");

    const putExclu: UpdateStudentExclusionsRequest = {
      exclusions: "Jerry M Yang, Ur Mother",
    };

    await request(app)
      .put(`/api/students/exclusions/${userid}`)
      .set("Cookie", cookies)
      .expect(200)
      .send(putExclu)
      .expect(200);

    const updatedExclu = await request(app)
      .get(`/api/students/exclusions/${userid}`)
      .set("Cookie", cookies)
      .expect(200);
    expect(updatedExclu.body[0]).toHaveProperty("exclusions");
    expect(updatedExclu.body[0].exclusions).toBe("Jerry M Yang, Ur Mother");
  });
});
