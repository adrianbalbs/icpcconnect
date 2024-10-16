import { eq } from "drizzle-orm";
import {
  DatabaseConnection,
  coaches,
  siteCoordinators,
  students,
  teams,
  universities,
  users,
} from "../db/index.js";
import {
  DeleteResponse,
  NewUserResponse,
  UserProfileResponse,
} from "../types/api-res.js";
import { CreateAdminRequest, UpdateAdminRequest } from "../schemas/index.js";
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

  async createAdmin(req: CreateAdminRequest): Promise<NewUserResponse> {
    const { givenName, familyName, password, email } = req;

    const hashedPassword = await passwordUtils().hash(password);

    const id = await this.db
      .insert(users)
      .values({
        givenName,
        familyName,
        password: hashedPassword,
        email,
        role: "admin",
      })
      .returning({ userId: users.id });

    // Return the newly created admin's ID
    return { userId: id[0].userId };
  }

  async getAllMembers(): Promise<AllUsersResponse> {
    const allUsers = await this.db
      .select({
        id: users.id,
        givenName: users.givenName,
        familyName: users.familyName,
        email: users.email,
        role: users.role,
      })
      .from(users);
    return { users: allUsers };
  }

  // Not expect to be used, but remain here just for cases
  // will return all a list of obj with details
  // No promise, since different obj has different properties: i.e, student has studentId property
  async getAllMembersInDetails() {
    const allStudents = await this.db
      .select({
        id: users.id,
        givenName: users.givenName,
        familyName: users.familyName,
        email: users.email,
        role: users.role,
        pronouns: students.pronouns,
        studentId: students.studentId,
        university: universities.name,
        team: teams.name,
      })
      .from(users)
      .innerJoin(students, eq(users.id, students.userId))
      .innerJoin(universities, eq(universities.id, students.university))
      .leftJoin(teams, eq(teams.id, students.team));

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

    const allSiteCoordinator = await this.db
      .select({
        id: users.id,
        givenName: users.givenName,
        familyName: users.familyName,
        email: users.email,
        role: users.role,
        university: siteCoordinators.university,
      })
      .from(users)
      .innerJoin(siteCoordinators, eq(users.id, siteCoordinators.userId))
      .innerJoin(
        universities,
        eq(universities.id, siteCoordinators.university),
      );

    // const allMembers = [
    //     ...allStudents.map(student => ({
    //       ...student,
    //       type: 'student',
    //     })),
    //     ...allCoaches.map(coach => ({
    //       ...coach,
    //       type: 'coach',
    //     })),
    //     ...allSiteCoordinator.map(coordinator => ({
    //       ...coordinator,
    //       type: 'site_coordinator',
    //     })),
    //   ];
    const allMembers = [...allStudents, ...allCoaches, ...allSiteCoordinator];
    return allMembers;
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
