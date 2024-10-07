import { eq } from "drizzle-orm";
import {
  DatabaseConnection,
  students,
  teams,
  universities,
  users,
} from "../db/index.js";
import {
  CreateStudentRequest,
  UpdateStudentRequest,
} from "../schemas/index.js";
import { badRequest, HTTPError } from "../utils/errors.js";
import { passwordUtils } from "../utils/encrypt.js";

export class StudentService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async createStudent(req: CreateStudentRequest) {
    const {
      givenName,
      familyName,
      password,
      email,
      role,
      studentId,
      university,
    } = req;

    const hashedPassword = await passwordUtils().hash(password);
    const id = await this.db
      .insert(users)
      .values({
        givenName,
        familyName,
        password: hashedPassword,
        email,
        role,
      })
      .returning({ userId: users.id });

    await this.db.insert(students).values({
      userId: id[0].userId,
      studentId,
      university,
    });

    return { userId: id[0].userId };
  }

  async getStudentById(userId: string) {
    const student = await this.db
      .select({
        id: users.id,
        givenName: users.givenName,
        familyName: users.familyName,
        email: users.email,
        role: users.role,
        pronouns: students.pronouns,
        studentId: students.studentId,
        university: universities.name,
        team: teams.name,
      })
      .from(users)
      .where(eq(users.id, userId))
      .leftJoin(students, eq(users.id, students.userId))
      .innerJoin(universities, eq(universities.id, students.university))
      .leftJoin(teams, eq(teams.id, students.team));

    if (!student.length) {
      throw new HTTPError(badRequest);
    }

    return student[0];
  }

  async getAllStudents() {
    const allStudents = await this.db
      .select({
        id: users.id,
        givenName: users.givenName,
        familyName: users.familyName,
        email: users.email,
        role: users.role,
        pronouns: students.pronouns,
        studentId: students.studentId,
        university: universities.name,
        team: teams.name,
      })
      .from(users)
      .innerJoin(students, eq(users.id, students.userId))
      .innerJoin(universities, eq(universities.id, students.university))
      .leftJoin(teams, eq(teams.id, students.team));

    return { allStudents };
  }

  async updateStudent(userId: string, updatedDetails: UpdateStudentRequest) {
    const {
      role,
      givenName,
      familyName,
      password,
      email,
      studentId,
      university,
      pronouns,
      team,
    } = updatedDetails;

    const hashedPassword = await passwordUtils().hash(password);
    await this.db
      .update(users)
      .set({ role, givenName, familyName, password: hashedPassword, email })
      .where(eq(users.id, userId));

    await this.db
      .update(students)
      .set({ studentId, university, pronouns, team })
      .where(eq(students.userId, userId));

    return {
      id: userId,
      studentId,
      role,
      givenName,
      familyName,
      email,
      university,
      pronouns,
      team,
    };
  }

  async deleteStudent(userId: string) {
    const student = await this.db
      .select({ userId: users.id })
      .from(users)
      .where(eq(users.id, userId));

    if (!student.length) {
      throw new HTTPError(badRequest);
    }

    await this.db.delete(users).where(eq(users.id, userId));
    return { status: "OK" };
  }
}
