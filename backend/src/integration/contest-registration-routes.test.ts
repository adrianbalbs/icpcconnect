import request from "supertest";
import express from "express";
import {
  courses,
  Database,
  DatabaseConnection,
  seed,
  spokenLanguages,
  universities,
  users,
} from "../db/index.js";
import { studentRouter } from "../routers/index.js";
import {
  ContestRegistrationService,
  GetRegistrationFormResponse,
  StudentService,
  UpdateContestRegistrationFormResponse,
} from "../services/index.js";
import { contestRegistrationRouter } from "../routers/index.js";
import {
  CreateContestRegistrationForm,
  CreateStudentRequest,
  UpdateContestRegistrationForm,
} from "../schemas/index.js";
import { v4 as uuidv4 } from "uuid";

let db: DatabaseConnection;
let app: ReturnType<typeof express>;

beforeAll(async () => {
  db = Database.getConnection();
  await seed(db);
  app = express()
    .use(express.json())
    .use("/api", studentRouter(new StudentService(db)))
    .use("/api", contestRegistrationRouter(new ContestRegistrationService(db)));
});

afterAll(async () => {
  await db.delete(users);
  await db.delete(universities);
  await db.delete(spokenLanguages);
  await db.delete(courses);
  await Database.endConnection();
});

describe("contestRegistrationRouter tests", () => {
  afterEach(async () => {
    await db.delete(users);
  });

  it("should create a new form for student", async () => {
    const req: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
    };
    const response = await request(app)
      .post("/api/students")
      .send(req)
      .expect(200);

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

    const regRes = await request(app)
      .post("/api/contest-registration")
      .send(registration)
      .expect(200);
    expect(regRes.body).toHaveProperty("studentId");
  });

  it("should get registration details by id", async () => {
    const req: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
    };
    const response = await request(app)
      .post("/api/students")
      .send(req)
      .expect(200);

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

    const nextRes = await request(app)
      .get(`/api/contest-registration/${response.body.userId}`)
      .expect(200);
    expect(nextRes.body.student).toEqual(response.body.userId);
  });

  it("should throw if a student has not registered", async () => {
    await request(app).get(`/api/contest-registration/${uuidv4()}`).expect(500);
  });

  it("should update a student's registration details", async () => {
    const req: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
    };
    const response = await request(app)
      .post("/api/students")
      .send(req)
      .expect(200);

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { student: _, ...registrationWithoutStudent } = registration;
    const newDetails: UpdateContestRegistrationForm = {
      ...registrationWithoutStudent,
      coursesTaken: [1, 2],
      level: "B",
    };

    const nextRes = await request(app)
      .put(`/api/contest-registration/${response.body.userId}`)
      .send(newDetails)
      .expect(200);

    const body: UpdateContestRegistrationFormResponse = nextRes.body;
    expect(body).toEqual(newDetails);

    const getRes = await request(app)
      .get(`/api/contest-registration/${response.body.userId}`)
      .expect(200);
    const getBody: GetRegistrationFormResponse = getRes.body;
    expect(getBody.level).toEqual("B");
    expect(getBody.coursesCompleted.map((course) => course.id)).toEqual([1, 2]);
  });

  it("should get all student registrations", async () => {
    const students = [
      {
        role: "student",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        studentId: "z5397730",
        password: "helloworld",
        university: 1,
      },
      {
        role: "student",
        givenName: "Jane",
        familyName: "Doe",
        email: "janedoe@comp3900.com",
        studentId: "z5397731",
        password: "password123",
        university: 2,
      },
      {
        role: "student",
        givenName: "John",
        familyName: "Smith",
        email: "johnsmith@comp3900.com",
        studentId: "z5397732",
        password: "securepass",
        university: 3,
      },
    ];

    const studentIds = [];

    for (const student of students) {
      const response = await request(app)
        .post("/api/students")
        .send(student)
        .expect(200);

      studentIds.push(response.body.userId);

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
  });

  it("should delete a student's registration", async () => {
    const req: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
    };
    const response = await request(app)
      .post("/api/students")
      .send(req)
      .expect(200);

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

    await request(app)
      .get(`/api/contest-registration/${response.body.userId}`)
      .expect(200);
    await request(app)
      .delete(`/api/contest-registration/${response.body.userId}`)
      .expect(200);
    await request(app)
      .get(`/api/contest-registration/${response.body.userId}`)
      .expect(500);
  });

  it("should return a 500 when deleting a registration that does not exist", async () => {
    await request(app)
      .delete(`/api/contest-registration/${uuidv4()}`)
      .expect(500);
  });
});
