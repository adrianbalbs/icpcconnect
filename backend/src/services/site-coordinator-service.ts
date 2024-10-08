import { eq } from "drizzle-orm";
import {
  DatabaseConnection,
  siteCoordinators,
  universities,
  users,
} from "../db/index.js";
import {
  DeleteUserResponse,
  NewUserResponse,
  UserProfileResponse,
} from "../interfaces/api-res-interfaces.js";
import {
  CreateSiteCoordinatorRequest,
  UpdateSiteCoordinatorRequest,
} from "../schemas/user-schema.js";
import { badRequest, HTTPError } from "../utils/errors.js";
import { passwordUtils } from "../utils/encrypt.js";

export interface SiteCoordinatorProfileResponse extends UserProfileResponse {
  site: string;
  managedUniversities: { id: number; name: string }[];
}

export interface SiteCoordinatorUpdateResponse extends UserProfileResponse {
  siteId: number;
}

export interface SiteCoordinatorItem extends UserProfileResponse {
  site: string;
}

export interface AllSiteCoordinators {
  siteCoordinators: SiteCoordinatorItem[];
}

export class SiteCoordinatorService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async createSiteCoordinator(
    req: CreateSiteCoordinatorRequest,
  ): Promise<NewUserResponse> {
    const { givenName, familyName, password, email, role, site } = req;

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
      site,
    });

    return { userId: res[0].userId };
  }

  async getSiteCoordinatorById(
    userId: string,
  ): Promise<SiteCoordinatorProfileResponse> {
    const siteCoordinator = await this.db
      .select({
        id: users.id,
        givenName: users.givenName,
        familyName: users.familyName,
        email: users.email,
        role: users.role,
        siteId: universities.id,
        site: universities.name,
      })
      .from(users)
      .where(eq(users.id, userId))
      .innerJoin(siteCoordinators, eq(users.id, siteCoordinators.userId))
      .innerJoin(universities, eq(universities.id, siteCoordinators.site));

    if (!siteCoordinator.length) {
      throw new HTTPError(badRequest);
    }

    const managedUniversities = await this.db
      .select({ id: universities.id, name: universities.name })
      .from(universities)
      .where(eq(universities.hostedAt, siteCoordinator[0].siteId));

    const { id, givenName, familyName, email, role, site } = siteCoordinator[0];
    return {
      id,
      givenName,
      familyName,
      email,
      role,
      site,
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
        site: universities.name,
      })
      .from(users)
      .innerJoin(siteCoordinators, eq(users.id, siteCoordinators.userId))
      .innerJoin(universities, eq(universities.id, siteCoordinators.site));
    return { siteCoordinators: allsiteCoordinators };
  }

  async updateSiteCoordinator(
    userId: string,
    updatedDetails: UpdateSiteCoordinatorRequest,
  ): Promise<SiteCoordinatorUpdateResponse> {
    const { role, givenName, familyName, password, email, site } =
      updatedDetails;

    const hashedPassword = await passwordUtils().hash(password);
    await this.db
      .update(users)
      .set({ role, givenName, familyName, password: hashedPassword, email })
      .where(eq(users.id, userId));

    await this.db
      .update(siteCoordinators)
      .set({ site })
      .where(eq(siteCoordinators.userId, userId));

    return {
      id: userId,
      role,
      givenName,
      familyName,
      email,
      siteId: site,
    };
  }

  async deleteSiteCoordinator(userId: string): Promise<DeleteUserResponse> {
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
