import { DatabaseConnection } from "src/db/database.js";
import {
  languagesSpokenByStudent,
  studentDetails,
  users,
} from "src/db/schema.js";
import {
  BaseUserDTO,
  BaseUserWithStudentDetails,
  BaseUserWithStudentDetailsDTO,
  StudentDetailsDTO,
  UpdateStudentDetails,
  UpdateUser,
  UserRole,
} from "src/schemas/index.js";
import { DeleteResponse } from "src/types/api-res.js";
import { passwordUtils } from "src/utils/encrypt.js";
import { badRequest, HTTPError, notFoundError } from "src/utils/errors.js";
import { eq } from "drizzle-orm";

export class UserService {
  constructor(private readonly db: DatabaseConnection) {}

  async createUser(req: BaseUserWithStudentDetails): Promise<{ id: string }> {
    const { studentDetails: details, password, ...rest } = req;
    const hashedPassword = await passwordUtils().hash(password);

    return this.db.transaction(async (trx) => {
      const [{ id }] = await trx
        .insert(users)
        .values({ password: hashedPassword, ...rest })
        .returning({ id: users.id });

      if (rest.role === "Student" && details) {
        const { languagesSpoken, ...restDetails } = details;
        await trx.insert(studentDetails).values({ userId: id, ...restDetails });
      }

      return { id };
    });
  }

  async getUserById(id: string): Promise<BaseUserDTO> {
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
      columns: { password: false, university: false },
      with: {
        university: { columns: { name: true } },
      },
    });

    if (!user) {
      throw new HTTPError({
        errorCode: notFoundError.errorCode,
        message: `User with id: ${id} does not exist`,
      });
    }

    return {
      ...user,
      university: user.university.name,
    };
  }

  async getUserStudentDetails(id: string): Promise<StudentDetailsDTO> {
    const studentDetails = await this.db.query.studentDetails.findFirst({
      where: (studentDetails, { eq }) => eq(studentDetails.userId, id),
      with: {
        team: {
          columns: { name: true },
        },
        languagesSpoken: {
          columns: { studentId: false, languageCode: false },
          with: {
            language: true,
          },
        },
      },
    });

    if (!studentDetails) {
      throw new HTTPError({
        errorCode: notFoundError.errorCode,
        message: `Student details with id: ${id} does not exist`,
      });
    }

    return {
      ...studentDetails,
      team: studentDetails.team ? studentDetails.team.name : null,
      languagesSpoken: studentDetails.languagesSpoken.map((l) => l.language),
    };
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

  async getAllUsers(
    role?: UserRole,
  ): Promise<{ users: BaseUserWithStudentDetailsDTO[] }> {
    const users = await this.db.query.users.findMany({
      where: role ? (users, { eq }) => eq(users.role, role) : undefined,
      columns: { password: false, university: false },
      with: {
        university: { columns: { name: true } },
        studentDetails: {
          with: {
            team: {
              columns: { name: true },
            },
            languagesSpoken: {
              columns: { languageCode: false },
              with: { language: true },
            },
          },
        },
      },
    });
    return {
      users: users.map((user) => {
        return {
          ...user,
          university: user.university.name,
          studentDetails:
            user.studentDetails !== null
              ? {
                  ...user.studentDetails,
                  team: user.studentDetails.team
                    ? user.studentDetails.team.name
                    : null,
                  languagesSpoken: user.studentDetails?.languagesSpoken.map(
                    (lang) => lang.language,
                  ),
                }
              : undefined,
        };
      }),
    };
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
