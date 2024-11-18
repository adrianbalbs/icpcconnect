import { eq } from "drizzle-orm";
import { DatabaseConnection, users } from "../db/index.js";
import { DeleteResponse, UserProfileResponse } from "../types/api-res.js";
import { HTTPError, badRequest, unauthorizedError } from "../utils/errors.js";
import { passwordUtils } from "../utils/encrypt.js";

export type AdminProfileUpdateResponse = UserProfileResponse;

export type AdminProfileResponse = UserProfileResponse;

export interface AllUsersResponse {
  users: UserProfileResponse[];
}

export class AdminService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async getAdminById(userId: string): Promise<AdminProfileResponse> {
    const admin = await this.db
      .select({
        id: users.id,
        givenName: users.givenName,
        familyName: users.familyName,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!admin.length) {
      throw new HTTPError(badRequest);
    }

    return admin[0];
  }

  async deleteAdmin(userId: string): Promise<DeleteResponse> {
    const admin = await this.db
      .select({ userId: users.id })
      .from(users)
      .where(eq(users.id, userId));
    if (!admin.length) {
      throw new HTTPError(badRequest);
    }

    await this.db.delete(users).where(eq(users.id, userId));
    return { status: "OK" };
  }

  async verifyAdmin(userId: string, password: string): Promise<boolean> {
    const admin = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!admin.length) {
      throw new HTTPError(unauthorizedError);
    }

    // Compare the provided password with the stored hash
    const storedHash = admin[0].password;
    const isPasswordValid = await passwordUtils().compare(password, storedHash);
    return isPasswordValid;
  }
}
