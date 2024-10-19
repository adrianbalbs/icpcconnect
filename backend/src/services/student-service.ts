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
import { badRequest, HTTPError, notFoundError } from "../utils/errors.js";
import { passwordUtils } from "../utils/encrypt.js";
import {
  DeleteResponse,
  NewUserResponse,
  UserProfileResponse,
} from "../types/api-res.js";

export type StudentProfileResponse = UserProfileResponse & {
  university: string;
  pronouns: string | null;
  studentId: string | null;
  team: string | null;
  dietaryRequirements: string | null;
  tshirtSize: string | null;
};

export type StudentsResponse = {
  allStudents: StudentProfileResponse[];
};

export type UpdateStudentResponse = Omit<UpdateStudentRequest, "password">;

export class StudentService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async createStudent(req: CreateStudentRequest): Promise<NewUserResponse> {
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
    const [student] = await this.db
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
      userId: student.userId,
      studentId,
      university,
    });

    return { userId: student.userId };
  }

  async getStudentById(userId: string): Promise<StudentProfileResponse> {
    const [student] = await this.db
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
        dietaryRequirements: students.dietaryRequirements,
        tshirtSize: students.tshirtSize,
      })
      .from(users)
      .where(eq(users.id, userId))
      .leftJoin(students, eq(users.id, students.userId))
      .innerJoin(universities, eq(universities.id, students.university))
      .leftJoin(teams, eq(teams.id, students.team));

    if (!student) {
      throw new HTTPError({
        errorCode: notFoundError.errorCode,
        message: `Student with id: ${userId} does not exist`,
      });
    }

    return student;
  }

  async getAllStudents(): Promise<StudentsResponse> {
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
        dietaryRequirements: students.dietaryRequirements,
        tshirtSize: students.tshirtSize,
      })
      .from(users)
      .innerJoin(students, eq(users.id, students.userId))
      .innerJoin(universities, eq(universities.id, students.university))
      .leftJoin(teams, eq(teams.id, students.team));

    return { allStudents };
  }

  // Update specified student's details
  //
  // Currently assumes that all the fields in 'updateDetails' are set
  // And it is on FE to synthesis an update-request with all the fields
  //
  // Could instead handle this in the POST route
  async updateStudent(
    userId: string,
    updatedDetails: UpdateStudentRequest,
  ): Promise<UpdateStudentResponse> {
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
      dietaryRequirements,
      tshirtSize,
    } = updatedDetails;

    const hashedPassword = await passwordUtils().hash(password);
    await this.db
      .update(users)
      .set({ role, givenName, familyName, password: hashedPassword, email })
      .where(eq(users.id, userId));

    await this.db
      .update(students)
      .set({ studentId, university, pronouns, team, dietaryRequirements, tshirtSize })
      .where(eq(students.userId, userId));

    return {
      studentId,
      role,
      givenName,
      familyName,
      email,
      university,
      pronouns,
      team,
      dietaryRequirements,
      tshirtSize,
    };
  }

  async deleteStudent(userId: string): Promise<DeleteResponse> {
    const [student] = await this.db
      .select({ userId: users.id })
      .from(users)
      .where(eq(users.id, userId));

    if (!student) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: `Student with id: ${userId} does not exist`,
      });
    }

    await this.db.delete(users).where(eq(users.id, userId));
    return { status: "OK" };
  }
}
