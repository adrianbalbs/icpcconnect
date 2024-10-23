import { eq } from "drizzle-orm";
import { DatabaseConnection } from "../db/database.js";
import { users } from "../db/schema.js";
import { passwordUtils } from "../utils/encrypt.js";
import { createAuthTokens } from "../utils/jwt.js";
import {
  HTTPError,
  notFoundError,
  unauthorizedError,
} from "../utils/errors.js";
import dotenv from "dotenv";
dotenv.config();

export interface LoginRequest {
  email: string;
  password: string;
}

export class AuthService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async login(req: LoginRequest) {
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

  async getUserAuthInfo(userId: string) {
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
