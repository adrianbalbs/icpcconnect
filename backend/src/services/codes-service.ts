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
      createdAt
    } = req;

    await this.db
      .insert(inviteCodes)
      .values({
        code,
        role,
        createdAt
    });

    return { };
  }

  async createAuthCode(req: CreateAuthCodeRequest) {
    const {
      code,
      email,
      createdAt
    } = req;

    await this.db
      .insert(authCodes)
      .values({
        code,
        email,
        createdAt
    });

    return { };
  }
}
