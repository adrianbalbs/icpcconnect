import { eq, inArray } from "drizzle-orm";
import {
  DatabaseConnection,
  siteCoordinators,
  universities,
  users,
  students,
  coaches,
} from "../db/index.js";
import {
  DeleteResponse,
  NewUserResponse,
  UserProfileResponse,
} from "../types/index.js";
import {
  CreateSiteCoordinatorRequest,
  UpdateSiteCoordinatorRequest,
  FormattedEmails,
  UserRole,
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
      role,
      givenName,
      familyName,
      email,
      university,
    };
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

  async getEmailsViaRole(userId: string, role: UserRole): Promise<FormattedEmails> {
    //Currently we've only specified they can view students/coaches emails
    if (role !== "student" && role !== "coach") {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: `Cannot request the emails for ${role}`,
      });
    }

    //Get site from site coordinator
    const [siteCoordinator] = await this.db
      .select({ university: siteCoordinators.university})
      .from(siteCoordinators)
      .where(eq(siteCoordinators.userId, userId));

    const { university: hosting_university } = siteCoordinator;

    //Get all universities hosted at our site
    //e.g university.hosted_at == site
    const unis = await this.db  
      .select({id: universities.id})
      .from(universities)
      .where(eq(universities.hostedAt, hosting_university));

    //And transform into an array of ids
    const uniIds = unis.map((uni) => uni.id);

    let emailsArr; 
    if (role == "coach") {
      emailsArr = await this.db
        .select({ email: users.email })
        .from(users)
        .leftJoin(coaches, inArray(coaches.university,uniIds));
    } else { // role == "student"
      emailsArr = await this.db
        .select({ email: users.email })
        .from(users)
        .leftJoin(students, inArray(students.university,uniIds));
    }

    //Join all emails, separated with ';' - which allows for easy pasting into email clients
    const formatted_string = emailsArr.map((e) => e.email).join(';');

    return {emails: formatted_string};
  }
}
