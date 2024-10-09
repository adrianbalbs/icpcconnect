import {
  Course,
  coursesCompletedByStudent,
  DatabaseConnection,
  languagesSpokenByStudent,
  registrationDetails,
  SpokenLanguage,
} from "../db/index.js";
import {
  CreateContestRegistrationForm,
  LanguageExperience,
  Level,
  UpdateContestRegistrationForm,
} from "../schemas/index.js";
import { DeleteResponse } from "../interfaces/index.js";
import { badRequest, HTTPError, notFoundError } from "../utils/errors.js";
import { eq } from "drizzle-orm";

export interface CreateRegistrationFormResponse {
  studentId: string;
}

export interface GetRegistrationFormResponse {
  student: string;
  level: Level;
  contestExperience: number;
  leetcodeRating: number;
  codeforcesRating: number;
  allergies: string;
  photoConsent: boolean;
  cppExperience: LanguageExperience;
  cExperience: LanguageExperience;
  javaExperience: LanguageExperience;
  pythonExperience: LanguageExperience;
  timeSubmitted: Date;
  languagesSpoken: SpokenLanguage[];
  coursesCompleted: Course[];
}

export type UpdateContestRegistrationFormResponse =
  UpdateContestRegistrationForm;

export class ContestRegistrationService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async createRegistration(
    newRegistrationDetails: CreateContestRegistrationForm,
  ): Promise<CreateRegistrationFormResponse> {
    const {
      allergies,
      cExperience,
      codeforcesRating,
      contestExperience,
      coursesTaken,
      cppExperience,
      javaExperience,
      level,
      leetcodeRating,
      photoConsent,
      pythonExperience,
      spokenLanguages,
      student,
    } = newRegistrationDetails;

    const [{ studentId }] = await this.db
      .insert(registrationDetails)
      .values({
        student,
        allergies,
        contestExperience,
        codeforcesRating,
        leetcodeRating,
        photoConsent,
        level,
        cExperience,
        cppExperience,
        javaExperience,
        pythonExperience,
      })
      .returning({ studentId: registrationDetails.student });

    for (const languageCode of spokenLanguages) {
      await this.db
        .insert(languagesSpokenByStudent)
        .values({ studentId, languageCode });
    }

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
        languagesSpoken: {
          with: {
            language: true,
          },
        },
        coursesCompleted: {
          with: {
            course: true,
          },
        },
      },
    });
    if (!result) {
      throw new HTTPError(notFoundError);
    }
    return {
      ...result,
      languagesSpoken: result.languagesSpoken.map((ls) => ls.language),
      coursesCompleted: result.coursesCompleted.map((ls) => ls.course),
    };
  }

  async getAllStudentRegistrations() {
    const registrations = await this.db.query.registrationDetails.findMany({
      with: {
        registeredBy: {
          columns: {
            university: true,
          },
        },
        languagesSpoken: {
          with: {
            language: true,
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
        languagesSpoken: registration.languagesSpoken.map((ls) => ls.language),
        coursesCompleted: registration.coursesCompleted.map((ls) => ls.course),
      })),
    };
  }

  async updateRegistration(
    studentId: string,
    updatedDetails: UpdateContestRegistrationForm,
  ): Promise<UpdateContestRegistrationFormResponse> {
    const {
      allergies,
      cExperience,
      codeforcesRating,
      contestExperience,
      coursesTaken,
      cppExperience,
      javaExperience,
      leetcodeRating,
      level,
      photoConsent,
      pythonExperience,
      spokenLanguages,
    } = updatedDetails;

    await this.db
      .update(registrationDetails)
      .set({
        allergies,
        contestExperience,
        codeforcesRating,
        leetcodeRating,
        photoConsent,
        level,
        cExperience,
        cppExperience,
        javaExperience,
        pythonExperience,
      })
      .where(eq(registrationDetails.student, studentId));

    await this.db
      .delete(languagesSpokenByStudent)
      .where(eq(languagesSpokenByStudent.studentId, studentId));
    await this.db
      .delete(coursesCompletedByStudent)
      .where(eq(coursesCompletedByStudent.studentId, studentId));

    for (const languageCode of spokenLanguages) {
      await this.db
        .insert(languagesSpokenByStudent)
        .values({ studentId, languageCode });
    }
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
      throw new HTTPError(badRequest);
    }
    await this.db
      .delete(registrationDetails)
      .where(eq(registrationDetails.student, studentId));
    return { status: "OK" };
  }
}
