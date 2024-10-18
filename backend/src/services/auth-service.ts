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

export interface LoginRequest {
  email: string;
  password: string;
}

export const SECRET_KEY: Secret = "placeholder-key";

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
          expiresIn: "2 days",
        },
      );
      return { token: token, id: user[0].id, role: user[0].role };
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
}
