import { checkCoachCode, checkSiteCoordCode } from "../utils/createcode.js";
import { DatabaseConnection } from "../db/database.js";
import {
  contests,
  courses,
  coursesCompletedByStudent,
  languages,
  languagesSpokenByStudent,
  registrationDetails,
  studentDetails,
  teams,
  universities,
  University,
  users,
} from "../db/schema.js";
import {
  CreateUser,
  ExclusionsResponse,
  PreferencesResponse,
  UpdateStudentDetails,
  UpdateUser,
  UserDTO,
  UserRole,
  Pullout,
} from "../schemas/index.js";
import { DeleteResponse } from "../types/api-res.js";
import { passwordUtils } from "../utils/encrypt.js";
import {
  badRequest,
  HTTPError,
  notFoundError,
  unauthorizedError,
} from "../utils/errors.js";
import { and, eq, getTableColumns, isNull, not } from "drizzle-orm";
import { CodesService } from "./codes-service.js";

export class UserService {
  constructor(private readonly db: DatabaseConnection) {}

  /*
   * Create a new user
   *
   * @remarks
   *  Doesn't throw on invalid inviteCode, but returns "INVALID" as id
   *
   * @param req - CreateUser
   *   req.givenName - users' given name
   *   req.familyName - users' family name
   *   req.email - users' email
   *   req.password - account's password
   *   req.role - users' role (e.g Student, Coach)
   *   req.studentId - Optional, student-id of user
   *   req.inviteCode - Optional, invite code (for privileged users)
   *   req.verificationCode - Optional, verification code
   *
   * @returns id - Internal id of the user
   *
   */
  async createUser(
    req: CreateUser,
    codesService: CodesService,
  ): Promise<{ id: string }> {
    const { studentId, password, role, inviteCode, ...rest } = req;
    const hashedPassword = await passwordUtils().hash(password);

    if (role === "Site Coordinator" || role === "Coach") {
      const isValid =
        role === "Site Coordinator"
          ? await checkSiteCoordCode(codesService, inviteCode)
          : await checkCoachCode(codesService, inviteCode);

      if (!isValid) {
        return { id: "INVALID" };
      }
    }

    return this.db.transaction(async (trx) => {
      const [{ id }] = await trx
        .insert(users)
        .values({ password: hashedPassword, role, ...rest })
        .returning({ id: users.id });
      await trx.insert(studentDetails).values({ userId: id, studentId });
      return { id };
    });
  }

  /*
   * Get a user, given their internal-id
   *
   * @param id - user's internal id
   *
   * @returns UserDTO - All user details, omitting their password
   *
   * @throws NotFoundError
   *   If user-id doesn't correspond to a user
   *
   */
  async getUserById(id: string): Promise<UserDTO> {
    const { password, refreshTokenVersion, ...usersRest } =
      getTableColumns(users);
    const { userId, ...studentDetailsRest } = getTableColumns(studentDetails);
    const [user] = await this.db
      .select({
        ...usersRest,
        ...studentDetailsRest,
        university: universities.name,
        team: teams.name,
      })
      .from(users)
      .innerJoin(studentDetails, eq(studentDetails.userId, users.id))
      .innerJoin(universities, eq(universities.id, users.university))
      .leftJoin(teams, eq(teams.id, studentDetails.team))
      .where(eq(users.id, id));

    if (!user) {
      throw new HTTPError({
        errorCode: notFoundError.errorCode,
        message: `User wih id ${id} not found`,
      });
    }

    const languagesSpoken = await this.db
      .select({ code: languages.code, name: languages.name })
      .from(languagesSpokenByStudent)
      .innerJoin(
        languages,
        eq(languages.code, languagesSpokenByStudent.languageCode),
      )
      .where(eq(languagesSpokenByStudent.studentId, id));

    const coursesCompleted = await this.db
      .select({ id: coursesCompletedByStudent.courseId, type: courses.type })
      .from(coursesCompletedByStudent)
      .innerJoin(courses, eq(courses.id, coursesCompletedByStudent.courseId))
      .where(eq(coursesCompletedByStudent.studentId, id));
    return { ...user, languagesSpoken, coursesCompleted };
  }

  /*
   * Update a given user's general details
   *
   * @param id - User's internal id
   * @param req - UpdateUser (All fields are optional)
   *   req.givenName - User's new given name
   *   req.familyName - User's new family name
   *   req.email - User's new email
   *   req.role  - User's new role
   *   req.university - User's new university
   *
   * @returns id - user's internal id
   *
   */
  async updateUser(id: string, req: UpdateUser): Promise<{ id: string }> {
    if (Object.keys(req).length === 0) {
      return { id };
    }
    const [user] = await this.db
      .update(users)
      .set(req)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    return user;
  }

  /*
   * Update a given user's password
   *
   * @param id - User's internal id
   * @param oldPassword - User's old password
   * @param newPassword - User's new password
   *
   * @returns id - user's internal id
   *
   */
  async updatePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ id: string }> {
    const checkUser = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id));

    if (!checkUser.length) {
      throw new HTTPError(unauthorizedError);
    }

    // Compare the provided password with the stored hash
    const storedHash = checkUser[0].password;
    const isPasswordValid = await passwordUtils().compare(
      oldPassword,
      storedHash,
    );
    if (isPasswordValid) {
      newPassword = await passwordUtils().hash(newPassword);
      const [user] = await this.db
        .update(users)
        .set({ password: newPassword })
        .where(eq(users.id, id))
        .returning({ id: users.id });
      return user;
    }
    throw new HTTPError(unauthorizedError);
  }

  /*
   * Update a given user's student details
   *
   * @param id - User's internal id
   * @param req - UpdateStudentDetails
   *
   * @returns id - user's internal id
   *
   */
  async updateStudentDetails(
    id: string,
    req: UpdateStudentDetails,
  ): Promise<{ id: string }> {
    const { languagesSpoken, coursesCompleted, ...rest } = req;

    const user = await this.db.transaction(async (tx) => {
      if (Object.keys(rest).length > 0) {
        await tx
          .update(studentDetails)
          .set(rest)
          .where(eq(studentDetails.userId, id));
      }
      if (languagesSpoken) {
        await tx
          .delete(languagesSpokenByStudent)
          .where(eq(languagesSpokenByStudent.studentId, id));
        for (const lang of languagesSpoken) {
          await tx
            .insert(languagesSpokenByStudent)
            .values({ studentId: id, languageCode: lang });
        }
      }

      if (coursesCompleted) {
        await tx
          .delete(coursesCompletedByStudent)
          .where(eq(coursesCompletedByStudent.studentId, id));
        for (const course of coursesCompleted) {
          await tx
            .insert(coursesCompletedByStudent)
            .values({ courseId: course, studentId: id });
        }
      }
      return { id };
    });

    return user;
  }

  /*
   * Get all user's details
   *
   * @param role - if specified, only query users of given role
   * @param contest - if specified, only query users in a given contest
   *
   * @returns UserDTO[] - All user details, omitting their password
   *
   */
  async getAllUsers(
    role?: UserRole,
    contest?: string,
  ): Promise<{ allUsers: UserDTO[] }> {
    const { password, refreshTokenVersion, ...usersRest } =
      getTableColumns(users);

    const { userId, ...studentDetailsRest } = getTableColumns(studentDetails);
    const query = this.db
      .select({
        ...usersRest,
        ...studentDetailsRest,
        university: universities.name,
        team: teams.name,
      })
      .from(users)
      .innerJoin(studentDetails, eq(studentDetails.userId, users.id))
      .innerJoin(universities, eq(universities.id, users.university))
      .leftJoin(teams, eq(teams.id, studentDetails.team))
      .$dynamic();

    if (role) {
      query.where(eq(users.role, role));
    }

    if (contest) {
      query
        .innerJoin(
          registrationDetails,
          eq(users.id, registrationDetails.student),
        )
        .where(eq(registrationDetails.contest, contest));
    }

    const rawUsers = await query;
    const allUsers = await Promise.all(
      rawUsers.map(async (user) => {
        const languagesSpoken = await this.db
          .select({ code: languages.code, name: languages.name })
          .from(languages)
          .innerJoin(
            languagesSpokenByStudent,
            eq(languages.code, languagesSpokenByStudent.languageCode),
          )
          .where(eq(languagesSpokenByStudent.studentId, user.id));

        const coursesCompleted = await this.db
          .select({
            id: coursesCompletedByStudent.courseId,
            type: courses.type,
          })
          .from(coursesCompletedByStudent)
          .innerJoin(
            courses,
            eq(courses.id, coursesCompletedByStudent.courseId),
          )
          .where(eq(coursesCompletedByStudent.studentId, user.id));

        return { ...user, languagesSpoken, coursesCompleted };
      }),
    );

    return { allUsers };
  }

  async getStudentsWithoutTeam(
    contest: string,
    university: number,
  ): Promise<{ allUsers: UserDTO[] }> {
    const { password, refreshTokenVersion, ...usersRest } =
      getTableColumns(users);

    const { userId, ...studentDetailsRest } = getTableColumns(studentDetails);
    const rawUsers = await this.db
      .select({
        ...usersRest,
        ...studentDetailsRest,
        university: universities.name,
        team: teams.name,
      })
      .from(users)
      .innerJoin(studentDetails, eq(studentDetails.userId, users.id))
      .innerJoin(universities, eq(universities.id, users.university))
      .innerJoin(registrationDetails, eq(registrationDetails.student, users.id))
      .leftJoin(teams, eq(teams.id, studentDetails.team))
      .where(
        and(
          and(
            isNull(studentDetails.team),
            and(
              eq(universities.id, university),
              eq(registrationDetails.contest, contest),
            ),
          ),
          eq(users.role, "Student"),
        ),
      );

    const allUsers = await Promise.all(
      rawUsers.map(async (user) => {
        const languagesSpoken = await this.db
          .select({ code: languages.code, name: languages.name })
          .from(languages)
          .innerJoin(
            languagesSpokenByStudent,
            eq(languages.code, languagesSpokenByStudent.languageCode),
          )
          .where(eq(languagesSpokenByStudent.studentId, user.id));

        const coursesCompleted = await this.db
          .select({
            id: coursesCompletedByStudent.courseId,
            type: courses.type,
          })
          .from(coursesCompletedByStudent)
          .innerJoin(
            courses,
            eq(courses.id, coursesCompletedByStudent.courseId),
          )
          .where(eq(coursesCompletedByStudent.studentId, user.id));

        return { ...user, languagesSpoken, coursesCompleted };
      }),
    );

    return { allUsers };
  }

  /*
   * Register a user for a given contest
   *
   * @param student - The user-id of the given student
   * @param contest - The id of the contest we are registering for
   *
   * @returns
   *   student - the user-id of the given contest
   *   contest - the contest-id of the given contest
   *   timeSubmitted - the date when registration occured
   *
   * @throws NotFoundError
   *   - If contest-id doesnt match a contest
   * @throws BadRequest
   *   - If contest's cutoffDate has already passed
   */
  async registerForContest(
    student: string,
    contest: string,
  ): Promise<{ student: string; contest: string; timeSubmitted: Date }> {
    const [selectedContest] = await this.db
      .select({ cutoffDate: contests.cutoffDate })
      .from(contests)
      .where(eq(contests.id, contest));

    if (!selectedContest) {
      throw new HTTPError({
        errorCode: notFoundError.errorCode,
        message: `Contest ${contest} does not exist`,
      });
    }

    if (new Date() > selectedContest.cutoffDate) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: `Registration past the cutoff date.`,
      });
    }

    const [res] = await this.db
      .insert(registrationDetails)
      .values({ student, contest })
      .returning({
        student: registrationDetails.student,
        contest: registrationDetails.contest,
        timeSubmitted: registrationDetails.timeSubmitted,
      });
    return res;
  }

  /*
   * Get contest-registration details of a given user
   *
   * @param student - The user-id of the given student
   * @param contest - The id of the contest we are registering for
   *
   * @returns
   *   student - the user-id of the given contest
   *   contest - the contest-id of the given contest
   *   timeSubmitted - the date when registration occured
   *
   * @throws NotFoundError
   *   - If the contest-id doesn't match a given contest
   */
  async getContestRegistrationDetails(
    student: string,
    contest: string,
  ): Promise<{ student: string; contest: string; timeSubmitted: Date }> {
    const [res] = await this.db
      .select()
      .from(registrationDetails)
      .where(
        and(
          eq(registrationDetails.student, student),
          eq(registrationDetails.contest, contest),
        ),
      );
    if (!res) {
      throw new HTTPError({
        errorCode: notFoundError.errorCode,
        message: `Registration wih student id ${student} and contest id ${contest} not found`,
      });
    }
    return res;
  }

  /*
   * Delete a given user's registration for a contest
   *
   * @param student - The user-id of the given student
   * @param contest - The id of the contest we are registering for
   *
   * @returns DeleteResponse - a wrapper around {status: "OK"}
   *
   */
  async deleteContestRegistration(
    student: string,
    contest: string,
  ): Promise<DeleteResponse> {
    await this.db
      .delete(registrationDetails)

      .where(
        and(
          eq(registrationDetails.contest, contest),
          eq(registrationDetails.student, student),
        ),
      );
    return { status: "OK" };
  }

  /*
   * Delete a given user's registration for a contest
   *
   * @param id - The user-id of the given user
   *
   * @returns DeleteResponse - a wrapper around {status: "OK"}
   *
   * @throws BadRequest
   *  - If specified user doesn't exist
   *
   */
  async deleteUser(id: string): Promise<DeleteResponse> {
    const [user] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id));

    if (!user) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: `Attempted to delete non-existent user with id: ${id}`,
      });
    }

    await this.db.delete(users).where(eq(users.id, id));
    return { status: "OK" };
  }

  /*
   * Get a given student's entered exclusions
   *
   * @param id - The user-id of the given student
   *
   * @returns ExclusionsResponse
   *   exclusions: comma-delimited list of excluded 'names'
   *
   */
  async getStudentExclusions(id: string): Promise<ExclusionsResponse> {
    const [exclusions] = await this.db
      .select({ exclusions: studentDetails.exclusions })
      .from(studentDetails)
      .where(eq(studentDetails.userId, id));

    return exclusions;
  }

  /*
   * Get a given student's entered preferences
   *
   * @param id - The user-id of the given student
   *
   * @returns PreferencesResponse[]
   *   - name: Name of student
   *   - studentId: Preferred students studentId
   *
   */
  async getStudentPreferences(
    id: string,
  ): Promise<{ preferences: PreferencesResponse[] }> {
    const [p] = await this.db
      .select({ preferences: studentDetails.preferences })
      .from(studentDetails)
      .where(eq(studentDetails.userId, id));

    const preferencesReturn: PreferencesResponse[] = [];

    if (p.preferences.length === 0) {
      return { preferences: preferencesReturn };
    } else if (p.preferences === "none") {
      console.log("yaa");
      return { preferences: [{ studentId: "none", name: "" }] };
    }

    const prefArr = p.preferences.split(", ");

    for (const stuId of prefArr) {
      const [per] = await this.db
        .select({
          studentId: studentDetails.studentId,
          given: users.givenName,
          family: users.familyName,
        })
        .from(studentDetails)
        .innerJoin(users, eq(users.id, studentDetails.userId))
        .where(eq(studentDetails.studentId, stuId));

      const preference: PreferencesResponse = {
        studentId: stuId,
        name: per ? `${per.given} ${per.family}` : "",
      };

      preferencesReturn.push(preference);
    }

    return { preferences: preferencesReturn };
  }

  /**
   * Retrieves all existing universities except the N/A option
   *
   * @returns {Promise<{ allUnis: University[]}>} An object containing an array of university objects
   */
  async getAllUniversities(): Promise<{ allUnis: University[] }> {
    const allUnis = await this.db
      .select()
      .from(universities)
      .where(not(eq(universities.id, 0)));
    return { allUnis };
  }
}
