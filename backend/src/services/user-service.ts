import { DatabaseConnection } from "../db/database.js";
import {
  languages,
  languagesSpokenByStudent,
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
import { eq, getTableColumns } from "drizzle-orm";

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

    return { ...user, languagesSpoken };
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
    const { languagesSpoken, ...rest } = req;

    const user = await this.db.transaction(async (tx) => {
      if (Object.keys(rest).length > 0) {
        await tx.update(studentDetails).set(rest);
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

      return { id };
    });

    return user;
  }

  async getAllUsers(role?: UserRole): Promise<{ allUsers: UserDTO[] }> {
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

        return { ...user, languagesSpoken };
      }),
    );

    return { allUsers };
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
