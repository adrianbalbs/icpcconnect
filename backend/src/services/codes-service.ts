import { DatabaseConnection, inviteCodes, authCodes } from "../db/index.js";
import {
  CreateAuthCodeRequest,
  CreateRoleCodeRequest,
  CodeResponse,
  AuthCodeInfo,
  RoleCodeInfo,
} from "../schemas/index.js";

export class CodesService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /*
   * Enters an invite-code into the right db table, for a specified role
   *
   * @param req -
   *   req.code - the code to be used
   *   req.role - role this code is associated with
   *
   * @returns CodeResponse
   *   CodeResponse.code - the code to be used
   *
   */
  async createRoleCode(req: CreateRoleCodeRequest): Promise<CodeResponse> {
    const { code, role } = req;

    await this.db.insert(inviteCodes).values({
      code,
      role,
    });

    return { code: code };
  }

  /*
   * Enters an auth-code into the right db table, for a specified user
   *
   * @param req -
   *   req.code - the code to be used
   *   req.email - email this code is associated with
   *
   * @returns CodeResponse
   *   CodeResponse.code - the code to be used
   */
  async createAuthCode(req: CreateAuthCodeRequest): Promise<CodeResponse> {
    const { code, email } = req;

    await this.db.insert(authCodes).values({
      code,
      email,
    });

    return { code: code };
  }

  /*
   * Get all auth-codes from db
   *
   * @returns AuthCodeInfo[]
   *   AuthCodeInfo.code - auth code
   *   AuthCodeInfo.email - users email
   *   AuthCodeInfo.createdAt - when we entered this code into db
   */
  async getAllAuthCodes(): Promise<AuthCodeInfo[]> {
    return await this.db.select().from(authCodes);
  }

  /*
   * Get all role-codes from db
   *
   * @returns RoleCodeInfo[]
   *   RoleCodeInfo.code - auth code
   *   RoleCodeInfo.role - role code is associated with (e.g Coach, SiteCoordinator)
   *   RoleCodeInfo.createdAt - when we entered this code into db
   */
  async getAllRoleCodes(): Promise<RoleCodeInfo[]> {
    return await this.db.select().from(inviteCodes);
  }
}
