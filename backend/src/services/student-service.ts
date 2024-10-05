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
import { HTTPError, notFoundError } from "../utils/errors.js";

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

    const id = await this.db
      .insert(users)
      .values({
        givenName,
        familyName,
        password,
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
      throw new HTTPError(notFoundError);
    }

    return student[0];
  }

  async getAllStudents() {
    return await this.db
      .select()
      .from(users)
      .innerJoin(students, eq(users.id, students.userId));
  }

  async getStudentByStudentId(studentId: string) {
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
      .where(eq(students.studentId, studentId))
      .innerJoin(students, eq(users.id, students.userId))
      .innerJoin(universities, eq(universities.id, students.university))
      .leftJoin(teams, eq(teams.id, students.team));

    if (!student.length) {
      throw new HTTPError(notFoundError);
    }

    return student[0];
  }

  async updateStudent(userId: string, updatedDetails: UpdateStudentRequest) {
    const { role, givenName, familyName, password, email } = updatedDetails;
    const { studentId, university, pronouns } = updatedDetails;

    await this.db
      .update(users)
      .set({ role, givenName, familyName, password, email })
      .where(eq(users.id, userId));

    await this.db
      .update(students)
      .set({ studentId, university, pronouns })
      .where(eq(students.userId, userId));

    return { userId };
  }

  async deleteStudent(userId: string) {
    await this.db.delete(users).where(eq(users.id, userId));
    return { userId };
  }
}
