import { eq } from "drizzle-orm";
import {
  DatabaseConnection,
  siteCoordinators,
  universities,
  users,
} from "../db/index.js";
import {
  DeleteResponse,
  NewUserResponse,
  UserProfileResponse,
} from "../interfaces/index.js";
import {
  CreateSiteCoordinatorRequest,
  UpdateSiteCoordinatorRequest,
} from "../schemas/index.js";
import { badRequest, HTTPError } from "../utils/errors.js";
import { passwordUtils } from "../utils/encrypt.js";

export type SiteCoordinatorProfileResponse = UserProfileResponse & {
  university: string;
  managedUniversities: { id: number; name: string }[];
};

export type SiteCoordinatorUpdateResponse = UserProfileResponse & {
  universityId: number;
};

export type SiteCoordinatorItem = UserProfileResponse & {
  university: string;
};

export type AllSiteCoordinators = {
  siteCoordinators: SiteCoordinatorItem[];
};

export class SiteCoordinatorService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async createSiteCoordinator(
    req: CreateSiteCoordinatorRequest,
  ): Promise<NewUserResponse> {
    const { givenName, familyName, password, email, role, university } = req;

    const hashedPassword = await passwordUtils().hash(password);

    const res = await this.db
      .insert(users)
      .values({
        givenName,
        familyName,
        password: hashedPassword,
        email,
        role,
      })
      .returning({ userId: users.id });

    await this.db.insert(siteCoordinators).values({
      userId: res[0].userId,
      university,
    });

    return { userId: res[0].userId };
  }

  async getSiteCoordinatorById(
    userId: string,
  ): Promise<SiteCoordinatorProfileResponse> {
    const [siteCoordinator] = await this.db
      .select({
        id: users.id,
        givenName: users.givenName,
        familyName: users.familyName,
        email: users.email,
        role: users.role,
        siteId: universities.id,
        university: universities.name,
      })
      .from(users)
      .where(eq(users.id, userId))
      .innerJoin(siteCoordinators, eq(users.id, siteCoordinators.userId))
      .innerJoin(
        universities,
        eq(universities.id, siteCoordinators.university),
      );

    if (!siteCoordinator) {
      throw new HTTPError(badRequest);
    }

    const managedUniversities = await this.db
      .select({ id: universities.id, name: universities.name })
      .from(universities)
      .where(eq(universities.hostedAt, siteCoordinator.siteId));

    const { id, givenName, familyName, email, role, university } =
      siteCoordinator;
    return {
      id,
      givenName,
      familyName,
      email,
      role,
      university,
      managedUniversities,
    };
  }

  async getAllSiteCoordinators(): Promise<AllSiteCoordinators> {
    const allsiteCoordinators = await this.db
      .select({
        id: users.id,
        givenName: users.givenName,
        familyName: users.familyName,
        email: users.email,
        role: users.role,
        university: universities.name,
      })
      .from(users)
      .innerJoin(siteCoordinators, eq(users.id, siteCoordinators.userId))
      .innerJoin(
        universities,
        eq(universities.id, siteCoordinators.university),
      );
    return { siteCoordinators: allsiteCoordinators };
  }

  async updateSiteCoordinator(
    userId: string,
    updatedDetails: UpdateSiteCoordinatorRequest,
  ): Promise<SiteCoordinatorUpdateResponse> {
    const { role, givenName, familyName, password, email, university } =
      updatedDetails;

    const hashedPassword = await passwordUtils().hash(password);
    await this.db
      .update(users)
      .set({ role, givenName, familyName, password: hashedPassword, email })
      .where(eq(users.id, userId));

    await this.db
      .update(siteCoordinators)
      .set({ university })
      .where(eq(siteCoordinators.userId, userId));

    return {
      id: userId,
      role,
      givenName,
      familyName,
      email,
      universityId: university,
    };
  }

  async deleteSiteCoordinator(userId: string): Promise<DeleteResponse> {
    const siteCoordinator = await this.db
      .select({ userId: users.id })
      .from(users)
      .where(eq(users.id, userId));
    if (!siteCoordinator.length) {
      throw new HTTPError(badRequest);
    }

    await this.db.delete(users).where(eq(users.id, userId));
    return { status: "OK" };
  }
}
