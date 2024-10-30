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
      coursesCompleted,
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

    for (const courseId of coursesCompleted) {
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
    const { coursesCompleted, ...rest } = updatedDetails;

    const cleanedUpdatedDetails = Object.fromEntries(
      Object.entries(rest).filter(([, value]) => value !== undefined),
    );

    const result = await this.db.transaction(async (tx) => {
      if (Object.keys(cleanedUpdatedDetails).length > 0) {
        await tx
          .update(registrationDetails)
          .set({
            ...cleanedUpdatedDetails,
            timeSubmitted: new Date(),
          })
          .where(eq(registrationDetails.student, studentId));
      }

      if (coursesCompleted) {
        await tx
          .delete(coursesCompletedByStudent)
          .where(eq(coursesCompletedByStudent.studentId, studentId));
        for (const courseId of coursesCompleted) {
          await tx
            .insert(coursesCompletedByStudent)
            .values({ studentId, courseId });
        }
      }
      return { ...rest, coursesCompleted };
    });

    return result;
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
