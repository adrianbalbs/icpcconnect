import { DatabaseConnection } from "../db/database.js";
import {
  courses,
  coursesCompletedByStudent,
  languages,
  languagesSpokenByStudent,
  registrationDetails,
  studentDetails,
  teams,
  universities,
  users,
} from "../db/schema.js";
import {
  CreateUser,
  UpdateStudentDetails,
  UpdateUser,
  UserDTO,
  UserRole,
} from "../schemas/index.js";
import { DeleteResponse } from "../types/api-res.js";
import { passwordUtils } from "../utils/encrypt.js";
import { badRequest, HTTPError, notFoundError } from "../utils/errors.js";
import { and, eq, getTableColumns } from "drizzle-orm";

export class UserService {
  constructor(private readonly db: DatabaseConnection) {}

  // TODO: Handle invite codes for refactor
  async createUser(req: CreateUser): Promise<{ id: string }> {
    const { studentId, password, ...rest } = req;
    const hashedPassword = await passwordUtils().hash(password);

    return this.db.transaction(async (trx) => {
      const [{ id }] = await trx
        .insert(users)
        .values({ password: hashedPassword, ...rest })
        .returning({ id: users.id });
      await trx.insert(studentDetails).values({ userId: id, studentId });
      return { id };
    });
  }

  async getUserById(id: string): Promise<UserDTO> {
    const { password, refreshTokenVersion, ...usersRest } =
      getTableColumns(users);
    const { userId, ...studentDetailsRest } = getTableColumns(studentDetails);
    const [user] = await this.db
      .select({
        ...usersRest,
        ...studentDetailsRest,
        university: universities.name,
        team: teams.name,
      })
      .from(users)
      .innerJoin(studentDetails, eq(studentDetails.userId, users.id))
      .innerJoin(universities, eq(universities.id, users.university))
      .leftJoin(teams, eq(teams.id, studentDetails.team))
      .where(eq(users.id, id));

    if (!user) {
      throw new HTTPError({
        errorCode: notFoundError.errorCode,
        message: `User wih id ${id} not found`,
      });
    }

    const languagesSpoken = await this.db
      .select({ code: languages.code, name: languages.name })
      .from(languagesSpokenByStudent)
      .innerJoin(
        languages,
        eq(languages.code, languagesSpokenByStudent.languageCode),
      )
      .where(eq(languagesSpokenByStudent.studentId, id));

    const coursesCompleted = await this.db
      .select({ id: coursesCompletedByStudent.courseId, type: courses.type })
      .from(coursesCompletedByStudent)
      .innerJoin(courses, eq(courses.id, coursesCompletedByStudent.courseId))
      .where(eq(coursesCompletedByStudent.studentId, id));
    return { ...user, languagesSpoken, coursesCompleted };
  }

  async updateUser(id: string, req: UpdateUser): Promise<{ id: string }> {
    if (Object.keys(req).length === 0) {
      return { id };
    }
    const [user] = await this.db
      .update(users)
      .set(req)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    return user;
  }

  async updatePassword(id: string, password: string): Promise<{ id: string }> {
    password = await passwordUtils().hash(password);
    const [user] = await this.db
      .update(users)
      .set({ password })
      .where(eq(users.id, id))
      .returning({ id: users.id });
    return user;
  }

  async updateStudentDetails(
    id: string,
    req: UpdateStudentDetails,
  ): Promise<{ id: string }> {
    const { languagesSpoken, coursesCompleted, ...rest } = req;

    const user = await this.db.transaction(async (tx) => {
      if (Object.keys(rest).length > 0) {
        await tx
          .update(studentDetails)
          .set(rest)
          .where(eq(studentDetails.userId, id));
      }
      if (languagesSpoken) {
        await tx
          .delete(languagesSpokenByStudent)
          .where(eq(languagesSpokenByStudent.studentId, id));
        for (const lang of languagesSpoken) {
          await tx
            .insert(languagesSpokenByStudent)
            .values({ studentId: id, languageCode: lang });
        }
      }

      if (coursesCompleted) {
        await tx
          .delete(coursesCompletedByStudent)
          .where(eq(coursesCompletedByStudent.studentId, id));
        for (const course of coursesCompleted) {
          await tx
            .insert(coursesCompletedByStudent)
            .values({ courseId: course, studentId: id });
        }
      }
      return { id };
    });

    return user;
  }

  async getAllUsers(
    role?: UserRole,
    contest?: string,
  ): Promise<{ allUsers: UserDTO[] }> {
    const { password, refreshTokenVersion, ...usersRest } =
      getTableColumns(users);

    const { userId, ...studentDetailsRest } = getTableColumns(studentDetails);
    const query = this.db
      .select({
        ...usersRest,
        ...studentDetailsRest,
        university: universities.name,
        team: teams.name,
      })
      .from(users)
      .innerJoin(studentDetails, eq(studentDetails.userId, users.id))
      .innerJoin(universities, eq(universities.id, users.university))
      .leftJoin(teams, eq(teams.id, studentDetails.team))
      .$dynamic();

    if (role) {
      query.where(eq(users.role, role));
    }

    if (contest) {
      query
        .innerJoin(
          registrationDetails,
          eq(users.id, registrationDetails.student),
        )
        .where(eq(registrationDetails.contest, contest));
    }

    const rawUsers = await query;
    const allUsers = await Promise.all(
      rawUsers.map(async (user) => {
        const languagesSpoken = await this.db
          .select({ code: languages.code, name: languages.name })
          .from(languages)
          .innerJoin(
            languagesSpokenByStudent,
            eq(languages.code, languagesSpokenByStudent.languageCode),
          )
          .where(eq(languagesSpokenByStudent.studentId, user.id));

        const coursesCompleted = await this.db
          .select({
            id: coursesCompletedByStudent.courseId,
            type: courses.type,
          })
          .from(coursesCompletedByStudent)
          .innerJoin(
            courses,
            eq(courses.id, coursesCompletedByStudent.courseId),
          )
          .where(eq(coursesCompletedByStudent.studentId, user.id));

        return { ...user, languagesSpoken, coursesCompleted };
      }),
    );

    return { allUsers };
  }

  async registerForContest(
    student: string,
    contest: string,
  ): Promise<{ student: string; contest: string; timeSubmitted: Date }> {
    const [res] = await this.db
      .insert(registrationDetails)
      .values({ student, contest })
      .returning({
        student: registrationDetails.student,
        contest: registrationDetails.contest,
        timeSubmitted: registrationDetails.timeSubmitted,
      });
    return res;
  }

  async getContestRegistrationDetails(
    student: string,
    contest: string,
  ): Promise<{ student: string; contest: string; timeSubmitted: Date }> {
    const [res] = await this.db
      .select()
      .from(registrationDetails)
      .where(
        and(
          eq(registrationDetails.student, student),
          eq(registrationDetails.contest, contest),
        ),
      );
    if (!res) {
      throw new HTTPError({
        errorCode: notFoundError.errorCode,
        message: `Registration wih student id ${student} and contest id ${contest} not found`,
      });
    }
    return res;
  }

  async deleteContestRegistration(
    student: string,
    contest: string,
  ): Promise<DeleteResponse> {
    await this.db
      .delete(registrationDetails)

      .where(
        and(
          eq(registrationDetails.contest, contest),
          eq(registrationDetails.student, student),
        ),
      );
    return { status: "OK" };
  }

  async deleteUser(id: string): Promise<DeleteResponse> {
    const [user] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id));

    if (!user) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: `Attempted to delete non-existent user with id: ${id}`,
      });
    }

    await this.db.delete(users).where(eq(users.id, id));
    return { status: "OK" };
  }
}
