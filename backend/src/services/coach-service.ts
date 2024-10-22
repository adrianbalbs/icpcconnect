import { eq } from "drizzle-orm";
import {
  coaches,
  DatabaseConnection,
  universities,
  users,
} from "../db/index.js";
import { CreateCoachRequest, UpdateCoachRequest } from "../schemas/index.js";
import { badRequest, HTTPError, notFoundError } from "../utils/errors.js";
import { passwordUtils } from "../utils/encrypt.js";
import {
  DeleteResponse,
  NewUserResponse,
  UserProfileResponse,
} from "../types/index.js";
import { StudentService } from "./student-service.js";

export type CoachProfileResponse = UserProfileResponse & {
  university: string;
};

export type CoachProfileUpdateResponse = Omit<UpdateCoachRequest, "password">;

export type AllCoachesResponse = {
  coaches: CoachProfileResponse[];
};

export class CoachService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async createCoach(req: CreateCoachRequest): Promise<NewUserResponse> {
    const { givenName, familyName, password, email, role, university } = req;

    const hashedPassword = await passwordUtils().hash(password);

    const [res] = await this.db
      .insert(users)
      .values({
        givenName,
        familyName,
        password: hashedPassword,
        email,
        role,
      })
      .returning({ userId: users.id });

    await this.db.insert(coaches).values({
      userId: res.userId,
      university,
    });

    return { userId: res.userId };
  }

  async getCoachById(userId: string): Promise<CoachProfileResponse> {
    const [coach] = await this.db
      .select({
        id: users.id,
        givenName: users.givenName,
        familyName: users.familyName,
        email: users.email,
        role: users.role,
        university: universities.name,
      })
      .from(users)
      .where(eq(users.id, userId))
      .innerJoin(coaches, eq(users.id, coaches.userId))
      .innerJoin(universities, eq(universities.id, coaches.university));

    if (!coach) {
      throw new HTTPError({
        errorCode: notFoundError.errorCode,
        message: `Coach with id: ${userId} does not exist`,
      });
    }

    return coach;
  }

  async getAllCoaches(): Promise<AllCoachesResponse> {
    const allCoaches = await this.db
      .select({
        id: users.id,
        givenName: users.givenName,
        familyName: users.familyName,
        email: users.email,
        role: users.role,
        university: universities.name,
      })
      .from(users)
      .innerJoin(coaches, eq(users.id, coaches.userId))
      .innerJoin(universities, eq(universities.id, coaches.university));

    return { coaches: allCoaches };
  }

  async updateCoach(
    userId: string,
    updatedDetails: UpdateCoachRequest,
  ): Promise<CoachProfileUpdateResponse> {
    const { role, givenName, familyName, password, email, university } =
      updatedDetails;

    const hashedPassword = await passwordUtils().hash(password);
    await this.db
      .update(users)
      .set({ role, givenName, familyName, password: hashedPassword, email })
      .where(eq(users.id, userId));

    await this.db
      .update(coaches)
      .set({ university })
      .where(eq(coaches.userId, userId));

    return {
      role,
      givenName,
      familyName,
      email,
      university,
    };
  }

  async deleteCoach(userId: string): Promise<DeleteResponse> {
    const [coach] = await this.db
      .select({ userId: users.id })
      .from(users)
      .where(eq(users.id, userId));
    if (!coach) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: `Coach with id: ${userId} does not exist`,
      });
    }

    await this.db.delete(users).where(eq(users.id, userId));
    return { status: "OK" };
  }
}
