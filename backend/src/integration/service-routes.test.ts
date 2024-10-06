import { v4 as uuidv4 } from "uuid";
import request from "supertest";
import express from "express";
import { StudentService } from "../services/index.js";
import { studentRouter } from "../routers/index.js";
import {
  Database,
  DatabaseConnection,
  seed,
  universities,
  users,
} from "../db/index.js";
import {
  CreateStudentRequest,
  UpdateStudentRequest,
} from "../schemas/index.js";

let db: DatabaseConnection;
let app: ReturnType<typeof express>;

beforeAll(async () => {
  db = Database.getConnection();
  await seed(db);
  app = express()
    .use(express.json())
    .use("/api/students", studentRouter(new StudentService(db)));
});

afterAll(async () => {
  await db.delete(users);
  await db.delete(universities);
  await Database.endConnection();
});

describe("studentRouter tests", () => {
  afterEach(async () => {
    await db.delete(users);
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
    };
    const response = await request(app)
      .post("/api/students/register")
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
      },
      {
        role: "student",
        givenName: "Test",
        familyName: "User",
        email: "testuser@comp3900.com",
        studentId: "z1234567",
        password: "helloworld",
        university: 1,
      },
      {
        role: "student",
        givenName: "Test",
        familyName: "User2",
        email: "testuser2@comp3900.com",
        studentId: "z1234568",
        password: "helloworld",
        university: 1,
      },
    ];

    for (const student of students) {
      await request(app)
        .post("/api/students/register")
        .send(student)
        .expect(200);
    }

    const response = await request(app).get("/api/students/all").expect(200);
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
    };
    const user = await request(app)
      .post("/api/students/register")
      .send(req)
      .expect(200);

    const { userId } = user.body;

    const response = await request(app)
      .get(`/api/students/${userId}`)
      .expect(200);

    expect(response.body.id).toEqual(userId);
  });

  it("should throw if a student cannot be found", async () => {
    await request(app).get(`/api/students/${uuidv4()}`).expect(500);
  });

  it("should get a student by student id", async () => {
    const req: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
    };
    await request(app).post("/api/students/register").send(req).expect(200);

    const response = await request(app)
      .get(`/api/students/sid/${req.studentId}`)
      .expect(200);

    expect(response.body.studentId).toEqual(req.studentId);
  });

  it("should throw if a student cannot be found with student id", async () => {
    await request(app).get(`/api/students/z1234567`).expect(500);
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
    };
    const res = await request(app)
      .post("/api/students/register")
      .send(newStudent)
      .expect(200);

    await request(app).get(`/api/students/${res.body.userId}`).expect(200);

    const req: UpdateStudentRequest = {
      ...newStudent,
      pronouns: "he/him",
      team: null,
    };

    const result = await request(app)
      .put(`/api/students/update/${res.body.userId}`)
      .send(req)
      .expect(200);
    expect(result.body.pronouns).toEqual(req.pronouns);
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
    };
    const res = await request(app)
      .post("/api/students/register")
      .send(newStudent)
      .expect(200);

    await request(app).get(`/api/students/${res.body.userId}`).expect(200);
    await request(app)
      .delete(`/api/students/delete/${res.body.userId}`)
      .expect(200);

    await request(app).get(`/api/students/${res.body.userId}`).expect(500);
  });

  it("should return an error when deleting a student that does not exist", async () => {
    await request(app).delete(`/api/students/delete/${uuidv4()}`).expect(500);
  });
});
