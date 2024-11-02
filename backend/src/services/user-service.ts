import { DatabaseConnection } from "src/db/database.js";
import { studentDetails, users } from "src/db/schema.js";
import { User, UserDTO, UserRole } from "src/schemas/index.js";
import { DeleteResponse } from "src/types/api-res.js";
import { passwordUtils } from "src/utils/encrypt.js";
import { badRequest, HTTPError, notFoundError } from "src/utils/errors.js";
import { eq } from "drizzle-orm";

export class UserService {
  constructor(private readonly db: DatabaseConnection) {}

  async createUser(req: User): Promise<{ id: string }> {
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

  async getUserById(id: string): Promise<UserDTO> {
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
      columns: { password: false, university: false },
      with: {
        university: { columns: { name: true } },
        studentDetails: {
          with: {
            languagesSpoken: {
              columns: { languageCode: false },
              with: { language: { columns: { code: false } } },
            },
          },
        },
      },
    });

    if (!user) {
      throw new HTTPError({
        errorCode: notFoundError.errorCode,
        message: `Student with id: ${id} does not exist`,
      });
    }

    return {
      ...user,
      university: user.university.name,
      studentDetails:
        user.studentDetails !== null
          ? {
              ...user.studentDetails,
              languagesSpoken: user.studentDetails?.languagesSpoken.map(
                (lang) => lang.language.name,
              ),
            }
          : undefined,
    };
  }

  async getAllUsers(role?: UserRole): Promise<UserDTO[]> {
    const users = await this.db.query.users.findMany({
      where: role ? (users, { eq }) => eq(users.role, role) : undefined,
      columns: { password: false, university: false },
      with: {
        university: { columns: { name: true } },
        studentDetails: {
          with: {
            languagesSpoken: {
              columns: { languageCode: false },
              with: { language: { columns: { code: false } } },
            },
          },
        },
      },
    });
    return users.map((user) => {
      return {
        ...user,
        university: user.university.name,
        studentDetails:
          user.studentDetails !== null
            ? {
                ...user.studentDetails,
                languagesSpoken: user.studentDetails?.languagesSpoken.map(
                  (lang) => lang.language.name,
                ),
              }
            : undefined,
      };
    });
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
