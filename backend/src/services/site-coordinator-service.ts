import { eq } from "drizzle-orm";
import {
  DatabaseConnection,
  SiteCoordinator,
  siteCoordinators,
  universities,
  User,
  users,
} from "../db/index.js";
import {
  DeleteResponse,
  NewUserResponse,
  UserProfileResponse,
} from "../types/index.js";
import {
  CreateSiteCoordinatorRequest,
  UpdateSiteCoordinatorRequest,
} from "../schemas/index.js";
import { badRequest, HTTPError, notFoundError } from "../utils/errors.js";
import { passwordUtils } from "../utils/encrypt.js";

export type SiteCoordinatorProfileResponse = UserProfileResponse & {
  university: string;
  managedUniversities: { id: number; name: string }[];
};

export type SiteCoordinatorUpdateResponse = Omit<
  UpdateSiteCoordinatorRequest,
  "password"
>;

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

    const [siteCoordinator] = await this.db
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
      userId: siteCoordinator.userId,
      university,
    });

    return { userId: siteCoordinator.userId };
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
      throw new HTTPError({
        errorCode: notFoundError.errorCode,
        message: `Site Coordinator with id: ${userId} does not exist`,
      });
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
    const { password, ...rest } = updatedDetails;

    const userUpdates: Partial<User> = {
      givenName: rest.givenName,
      familyName: rest.familyName,
      email: rest.email,
      role: rest.role,
    };
    const siteCoordinatorUpdates: Partial<SiteCoordinator> = {
      university: rest.university,
    };

    if (password) {
      userUpdates.password = await passwordUtils().hash(password);
    }

    const cleanedUserUpdates = Object.fromEntries(
      Object.entries(userUpdates).filter(([, value]) => value !== undefined),
    );
    const cleanedSiteCoordinatorUpdates = Object.fromEntries(
      Object.entries(siteCoordinatorUpdates).filter(
        ([, value]) => value !== undefined,
      ),
    );
    const result = await this.db.transaction(async (tx) => {
      if (Object.keys(cleanedUserUpdates).length > 0) {
        await tx
          .update(users)
          .set(cleanedUserUpdates)
          .where(eq(users.id, userId));
      }

      if (Object.keys(cleanedSiteCoordinatorUpdates).length > 0) {
        await tx
          .update(siteCoordinators)
          .set(cleanedSiteCoordinatorUpdates)
          .where(eq(siteCoordinators.userId, userId));
      }
      return { ...rest };
    });

    return result;
  }

  async deleteSiteCoordinator(userId: string): Promise<DeleteResponse> {
    const [siteCoordinator] = await this.db
      .select({ userId: users.id })
      .from(users)
      .where(eq(users.id, userId));
    if (!siteCoordinator) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: `Site Coordinator with id: ${userId} does not exist`,
      });
    }

    await this.db.delete(users).where(eq(users.id, userId));
    return { status: "OK" };
  }
}
