import { eq } from "drizzle-orm";
import { DatabaseConnection, users } from "../db/index.js";
import { DeleteResponse, UserProfileResponse } from "../types/api-res.js";
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

  /*
   * Deletes an admin, given their internal user-id
   *
   * @param userId - Internal user-id of the admin
   *
   * @returns DeleteResponse - with an OK status
   *
   * @throws BadRequest if user-id doesn't correspond to an admin
   *
   */
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
