import {
  Course,
  coursesCompletedByStudent,
  DatabaseConnection,
  registrationDetails,
} from "../db/index.js";
import {
  CreateContestRegistrationForm,
  LanguageExperience,
  Level,
  UpdateContestRegistrationForm,
} from "../schemas/index.js";
import { DeleteResponse } from "../types/index.js";
import { badRequest, HTTPError, notFoundError } from "../utils/errors.js";
import { eq } from "drizzle-orm";

export type CreateRegistrationFormResponse = {
  studentId: string;
};

export type GetRegistrationFormResponse = {
  student: string;
  level: Level;
  contestExperience: number;
  leetcodeRating: number;
  codeforcesRating: number;
  cppExperience: LanguageExperience;
  cExperience: LanguageExperience;
  javaExperience: LanguageExperience;
  pythonExperience: LanguageExperience;
  timeSubmitted: Date;
  coursesCompleted: Course[];
};

export type UpdateContestRegistrationFormResponse =
  UpdateContestRegistrationForm;

export type Registrations = { registrations: GetRegistrationFormResponse[] };

export class ContestRegistrationService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async createRegistration(
    newRegistrationDetails: CreateContestRegistrationForm,
  ): Promise<CreateRegistrationFormResponse> {
    const {
      cExperience,
      codeforcesRating,
      contestExperience,
      coursesTaken,
      cppExperience,
      javaExperience,
      level,
      leetcodeRating,
      pythonExperience,
      student,
    } = newRegistrationDetails;

    const [{ studentId }] = await this.db
      .insert(registrationDetails)
      .values({
        student,
        contestExperience,
        codeforcesRating,
        leetcodeRating,
        level,
        cExperience,
        cppExperience,
        javaExperience,
        pythonExperience,
      })
      .returning({ studentId: registrationDetails.student });

    for (const courseId of coursesTaken) {
      await this.db
        .insert(coursesCompletedByStudent)
        .values({ studentId, courseId });
    }

    return { studentId };
  }

  async getRegistration(
    studentId: string,
  ): Promise<GetRegistrationFormResponse> {
    const result = await this.db.query.registrationDetails.findFirst({
      where: eq(registrationDetails.student, studentId),
      with: {
        coursesCompleted: {
          with: {
            course: true,
          },
        },
      },
    });
    if (!result) {
      throw new HTTPError({
        errorCode: notFoundError.errorCode,
        message: `Registration with id: ${studentId} does not exist`,
      });
    }
    return {
      ...result,
      coursesCompleted: result.coursesCompleted.map((ls) => ls.course),
    };
  }

  async getAllStudentRegistrations(): Promise<Registrations> {
    const registrations = await this.db.query.registrationDetails.findMany({
      with: {
        registeredBy: {
          columns: {
            university: true,
          },
        },
        coursesCompleted: {
          with: {
            course: true,
          },
        },
      },
    });
    return {
      registrations: registrations.map((registration) => ({
        ...registration,
        coursesCompleted: registration.coursesCompleted.map((ls) => ls.course),
      })),
    };
  }

  async updateRegistration(
    studentId: string,
    updatedDetails: UpdateContestRegistrationForm,
  ): Promise<UpdateContestRegistrationFormResponse> {
    const {
      cExperience,
      codeforcesRating,
      contestExperience,
      coursesTaken,
      cppExperience,
      javaExperience,
      leetcodeRating,
      level,
      pythonExperience,
    } = updatedDetails;

    await this.db
      .update(registrationDetails)
      .set({
        contestExperience,
        codeforcesRating,
        leetcodeRating,
        level,
        cExperience,
        cppExperience,
        javaExperience,
        pythonExperience,
      })
      .where(eq(registrationDetails.student, studentId));

    await this.db
      .delete(coursesCompletedByStudent)
      .where(eq(coursesCompletedByStudent.studentId, studentId));

    for (const courseId of coursesTaken) {
      await this.db
        .insert(coursesCompletedByStudent)
        .values({ studentId, courseId });
    }
    return updatedDetails;
  }

  async deleteRegistration(studentId: string): Promise<DeleteResponse> {
    const [res] = await this.db
      .select()
      .from(registrationDetails)
      .where(eq(registrationDetails.student, studentId));
    if (!res) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: `Registration with id: ${studentId} does not exist`,
      });
    }
    await this.db
      .delete(registrationDetails)
      .where(eq(registrationDetails.student, studentId));
    return { status: "OK" };
  }
}
