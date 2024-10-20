import { eq } from "drizzle-orm";
import { DatabaseConnection } from "../db/database.js";
import { users } from "../db/schema.js";
import { passwordUtils } from "../utils/encrypt.js";
import {
  HTTPError,
  notFoundError,
  unauthorizedError,
} from "../utils/errors.js";
import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export interface LoginRequest {
  email: string;
  password: string;
}

export const SECRET_KEY: Secret = process.env.JWT_SECRET || "placeholder-key";
export const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "another-placeholder-key";

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
      const token = jwt.sign(
        { id: user[0].id, role: user[0].role },
        SECRET_KEY,
        {
          expiresIn: "15min",
        },
      );

      const refresh = jwt.sign(
        { id: user[0].id, refreshTokenVersion: user[0].refreshTokenVersion },
        REFRESH_TOKEN_SECRET,
        {
          expiresIn: "30d",
        },
      );

      return { token, refresh };
    } else {
      throw new HTTPError(unauthorizedError);
    }
  }

  async getUserRole(userId: string) {
    const [user] = await this.db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) {
      throw new HTTPError(notFoundError);
    }

    return user.role;
  }

  async getUserRefreshTokenVersion(userId: string) {
    const [user] = await this.db
      .select({ refreshTokenVersion: users.refreshTokenVersion })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) {
      throw new HTTPError(notFoundError);
    }

    return user.refreshTokenVersion;
  }
}
