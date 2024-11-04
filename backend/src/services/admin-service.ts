import { eq } from "drizzle-orm";
import { DatabaseConnection, users } from "../db/index.js";
import { DeleteResponse, UserProfileResponse } from "../types/api-res.js";
import { UpdateAdminRequest } from "../schemas/index.js";
import { passwordUtils } from "../utils/encrypt.js";
import { HTTPError, badRequest } from "../utils/errors.js";

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

  async updateAdmin(
    userId: string,
    updatedDetails: UpdateAdminRequest,
  ): Promise<AdminProfileUpdateResponse> {
    const { role, givenName, familyName, password, email } = updatedDetails;

    const hashedPassword = await passwordUtils().hash(password);
    await this.db
      .update(users)
      .set({ role, givenName, familyName, password: hashedPassword, email })
      .where(eq(users.id, userId));

    return {
      id: userId,
      role,
      givenName,
      familyName,
      email,
    };
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
}
