import { v4 as uuidv4 } from "uuid";
import {
  Database,
  DatabaseConnection,
  seed,
  universities,
  users,
} from "../../db/index.js";
import {
  CreateStudentRequest,
  UpdateStudentRequest,
} from "../../schemas/user-schema.js";
import { StudentService } from "../../services/index.js";
import { badRequest, HTTPError } from "../../utils/errors.js";

let db: DatabaseConnection;
let studentService: StudentService;

beforeAll(async () => {
  db = Database.getConnection();
  await seed(db);
  studentService = new StudentService(db);
});

afterAll(async () => {
  await db.delete(users);
  await db.delete(universities);
  Database.endConnection();
});

describe("StudentService tests", () => {
  it("Should register a new student", async () => {
    const req: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
    };
    const result = await studentService.createStudent(req);
    expect(result.userId).not.toBeNull();
  });

  it("Should get the student's details with a sid", async () => {
    const req: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
    };
    await studentService.createStudent(req);
    const result = await studentService.getStudentByStudentId(req.studentId);
    expect(result).not.toBeNull();
  });

  it("Should throw an error if the student cannot be found by sid", async () => {
    const sid = "z1234567";
    await expect(studentService.getStudentByStudentId(sid)).rejects.toThrow(
      new HTTPError(badRequest),
    );
  });

  it("Should get the student's details with a uuid", async () => {
    const req: CreateStudentRequest = {
      role: "student",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      studentId: "z5397730",
      password: "helloworld",
      university: 1,
    };
    const { userId } = await studentService.createStudent(req);
    const result = await studentService.getStudentById(userId);
    expect(result).not.toBeNull();
  });

  it("Show throw an error if the student cannot be found by uuid", async () => {
    const userId = uuidv4();
    await expect(studentService.getStudentById(userId)).rejects.toThrow(
      new HTTPError(badRequest),
    );
  });

  it("Should update the students details", async () => {
    const student: CreateStudentRequest = {
      role: "student",
      givenName: "Test",
      familyName: "User",
      email: "testuser@comp3900.com",
      studentId: "z1234567",
      password: "helloworld",
      university: 1,
    };
    const { userId } = await studentService.createStudent(student);
    const prevDetails = await studentService.getStudentById(userId);
    expect(prevDetails.pronouns).toBeNull();

    const req: UpdateStudentRequest = {
      ...student,
      pronouns: "he/him",
      team: null,
    };
    const newDetails = await studentService.updateStudent(userId, req);
    expect(newDetails).not.toEqual(prevDetails);
  });

  it("Should remove the student from the database", async () => {
    const student: CreateStudentRequest = {
      role: "student",
      givenName: "Test",
      familyName: "User",
      email: "testuser@comp3900.com",
      studentId: "z1234567",
      password: "helloworld",
      university: 1,
    };
    const { userId } = await studentService.createStudent(student);
    const prev = await studentService.getStudentById(userId);
    expect(prev).not.toBeNull();

    await expect(studentService.deleteStudent(userId)).resolves.toStrictEqual({
      status: "OK",
    });

    await expect(studentService.getStudentById(userId)).rejects.toThrow(
      new HTTPError(badRequest),
    );
  });

  it("Throw when deleting a student that does not exist", async () => {
    await expect(studentService.deleteStudent(uuidv4())).rejects.toThrow(
      new HTTPError(badRequest),
    );
  });
});
