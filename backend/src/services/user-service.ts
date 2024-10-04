import { eq, getTableColumns } from "drizzle-orm";
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
  CreateCoachRequest,
  CreateSiteCoordinatorRequest,
  CreateStudentRequest,
} from "../schemas/index.js";
import { HTTPError, notFoundError } from "../utils/errors.js";

export class UserService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async createStudent(req: CreateStudentRequest) {
    const {
      givenName,
      familyName,
      password,
      email,
      role,
      studentId,
      university,
    } = req;

    const id = await this.db
      .insert(users)
      .values({
        givenName,
        familyName,
        password,
        email,
        role,
      })
      .returning({ userId: users.id });

    await this.db.insert(students).values({
      userId: id[0].userId,
      studentId,
      university,
    });

    return { id: id[0].userId };
  }

  async createCoach(req: CreateCoachRequest) {}

  async createSiteCoordinator(req: CreateSiteCoordinatorRequest) {}

  async getAllUsers() {
    return await this.db.select().from(users);
  }

  async getAllStudents() {
    return await this.db
      .select()
      .from(users)
      .innerJoin(students, eq(users.id, students.userId));
  }

  async getAllCoaches() {
    return await this.db
      .select()
      .from(users)
      .innerJoin(coaches, eq(users.id, coaches.userId));
  }

  async getAllSiteCoordinators() {
    return await this.db
      .select()
      .from(users)
      .innerJoin(siteCoordinators, eq(users.id, siteCoordinators.userId));
  }

  async getStudent(userId: string) {
    const { password, ...restUser } = getTableColumns(users);

    const student = await this.db
      .select({
        ...restUser,
        studentId: students.studentId,
        university: universities.name,
        team: teams.name,
      })
      .from(users)
      .where(eq(users.id, userId))
      .innerJoin(students, eq(users.id, students.userId))
      .innerJoin(universities, eq(universities.id, students.university))
      .innerJoin(teams, eq(teams.id, students.team));

    if (!student) {
      throw new HTTPError(notFoundError);
    }

    return student[0];
  }

  async getCoach(userId: string) {}

  async getSiteCoordinator(userId: string) {}

  async updateStudent() {}

  async updateCoach() {}

  async upateSiteCoordinator() {}

  async deleteStudent(userId: string) {}

  async deleteCoach(userId: string) {}

  async deleteSiteCoordinator(userId: string) {}
}
