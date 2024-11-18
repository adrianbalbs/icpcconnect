import { eq } from "drizzle-orm";
import { DatabaseConnection } from "../db/database.js";
import { users } from "../db/schema.js";
import { passwordUtils } from "../utils/encrypt.js";
import { createAuthTokens } from "../utils/jwt.js";
import { LoginRequest, UserAuthInfo, LoginResponse } from "../schemas/index.js";
import {
  HTTPError,
  notFoundError,
  unauthorizedError,
} from "../utils/errors.js";
import dotenv from "dotenv";
dotenv.config();

export class AuthService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /*
   * Attempts to log in a given user
   *
   * @param req -
   *   req.email - email of account
   *   req.password - password of account
   *
   * @returns LoginResponse
   *   LoginResponse.userInfo - the auth info about the user
   *
   * @throws UnauthorizedError -
   *   If user doesn't exist
   *   If password doesn't match user's password
   */
  async login(req: LoginRequest): Promise<LoginResponse> {
    const { email, password } = req;

    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user.length) {
      throw new HTTPError(unauthorizedError);
    }

    // Compare the provided password with the stored hash
    const storedHash = user[0].password;
    const isPasswordValid = await passwordUtils().compare(password, storedHash);

    if (isPasswordValid) {
      return {
        ...createAuthTokens(
          user[0].id,
          user[0].role,
          user[0].refreshTokenVersion,
        ),
        userInfo: {
          givenName: user[0].givenName,
          familyName: user[0].familyName,
          refreshTokenVersion: user[0].refreshTokenVersion,
          id: user[0].id,
          role: user[0].role,
          email: user[0].email,
        },
      };
    } else {
      throw new HTTPError(unauthorizedError);
    }
  }

  /*
   * Gets the authorisation info of a given user
   *
   * @param userId - the internal user-id of the user
   *
   * @returns UserAuthInfo - authorisation info about the specified user
   *
   * @throws NotFoundError -
   *   If user doesn't exist
   */
  async getUserAuthInfo(userId: string): Promise<UserAuthInfo> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) {
      throw new HTTPError(notFoundError);
    }
    return {
      givenName: user.givenName,
      familyName: user.familyName,
      refreshTokenVersion: user.refreshTokenVersion,
      email: user.email,
      role: user.role,
      id: user.id,
    };
  }
}
