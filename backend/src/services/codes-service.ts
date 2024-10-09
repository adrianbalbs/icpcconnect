import {
  DatabaseConnection,
  inviteCodes,
  authCodes
} from "../db/index.js";
import {
    CreateAuthCodeRequest,
    CreateRoleCodeRequest
} from "../schemas/index.js"

export class CodesService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async createRoleCode(req: CreateRoleCodeRequest) {
    const {
      code,
      role,
    } = req;

    await this.db
      .insert(inviteCodes)
      .values({
        code,
        role,
    });

    return { code: code };
  }

  async createAuthCode(req: CreateAuthCodeRequest) {
    const {
      code,
      email,
    } = req;

    await this.db
      .insert(authCodes)
      .values({
        code,
        email,
    });

    return { code: code };
  }

  async getAllAuthCodes() {
    return await this.db
      .select()
      .from(authCodes)
  }

  async getAllRoleCodes() {
    return await this.db
      .select()
      .from(inviteCodes)
  }
}
