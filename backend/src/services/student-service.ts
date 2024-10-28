import { eq } from "drizzle-orm";
import {
  DatabaseConnection,
  students,
  users,
  languagesSpokenByStudent,
  SpokenLanguage,
  User,
  Student,
} from "../db/index.js";
import {
  CreateStudentRequest,
  UpdateStudentRequest,
} from "../schemas/index.js";
import { badRequest, HTTPError, notFoundError } from "../utils/errors.js";
import { passwordUtils } from "../utils/encrypt.js";
import {
  DeleteResponse,
  NewUserResponse,
  UserProfileResponse,
} from "../types/api-res.js";

export type StudentProfileResponse = UserProfileResponse & {
  university: string;
  pronouns: string | null;
  studentId: string | null;
  team: string | null;
  dietaryRequirements: string | null;
  tshirtSize: string | null;
  languagesSpoken: SpokenLanguage[];
};

export type StudentsResponse = {
  allStudents: StudentProfileResponse[];
};

export type UpdateStudentResponse = Omit<UpdateStudentRequest, "password">;

export class StudentService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async createStudent(req: CreateStudentRequest): Promise<NewUserResponse> {
    const {
      givenName,
      familyName,
      password,
      email,
      role,
      studentId,
      university,
      languagesSpoken,
      photoConsent,
    } = req;

    const hashedPassword = await passwordUtils().hash(password);
    const [student] = await this.db
      .insert(users)
      .values({
        givenName,
        familyName,
        password: hashedPassword,
        email,
        role,
      })
      .returning({ userId: users.id });

    await this.db.insert(students).values({
      userId: student.userId,
      studentId,
      university,
      photoConsent,
    });


    for (const languageCode of languagesSpoken) {
      await this.db
        .insert(languagesSpokenByStudent)
        //This is meant to be the student's userId, not their *studentId* 
        .values({ studentId: student.userId, languageCode });
    }

    return { userId: student.userId };
  }

  async getStudentById(userId: string): Promise<StudentProfileResponse> {
    const student = await this.db.query.students.findFirst({
      where: eq(students.userId, userId),
      columns: { team: false, university: false },
      with: {
        team: {
          columns: {
            name: true,
          },
        },
        university: {
          columns: {
            name: true,
          },
        },
        user: {
          columns: {
            password: false,
          }
        },
        languagesSpoken: {
          with: {
            language: true,
          }
        },
      },
    })

    if (!student) {
      throw new HTTPError({
        errorCode: notFoundError.errorCode,
        message: `Student with id: ${userId} does not exist`,
      });
    }

    const {
      givenName,
      familyName,
      email,
      role,
      id
    } = student.user;

    const uniName = student.university.name;

    //I do not know how to get rid of 'undefined' here :sob:
    //and don't want to break the struct FE is already using
    let teamName = student.team?.name;
    if (!teamName) {
      teamName = null;
    }

    const { ...studentProps } = student;
    return {
      ...studentProps,
      university: uniName,
      team: teamName,
      languagesSpoken: student.languagesSpoken.map((ls) => ls.language),
      givenName,
      familyName,
      email,
      role,
      id
    }
  }

  async getAllStudents(): Promise<StudentsResponse> {
    const allStudents = await this.db.query.students.findMany({
      columns: { team: false, university: false },
      with: {
        team: {
          columns: {
            name: true,
          },
        },
        university: {
          columns: {
            name: true,
          },
        },
        user: {
          columns: {
            password: false,
          }
        },
        languagesSpoken: {
          with: {
            language: true,
          }
        },
      },
    })

    return {
      allStudents:
        allStudents.map((student) => {
          const {
            givenName,
            familyName,
            email,
            role,
            id
          } = student.user;

          const uniName = student.university.name;

          let teamName = student.team?.name;
          if (!teamName) {
            teamName = null;
          }

          return {
            ...student,
            university: uniName,
            team: teamName,
            languagesSpoken: student.languagesSpoken.map((ls) => ls.language),
            givenName,
            familyName,
            email,
            role,
            id
          }
        }),
    };
  }

  // Update specified student's details
  //
  // Currently assumes that all the fields in 'updateDetails' are set
  // And it is on FE to synthesis an update-request with all the fields
  //
  // Could instead handle this in the POST route
  async updateStudent(
    userId: string,
    updatedDetails: UpdateStudentRequest,
  ): Promise<UpdateStudentResponse> {
    const { password, ...rest } = updatedDetails;

    console.log("backend: funny cat", updatedDetails);

    const userUpdates: Partial<User> = {
      givenName: rest.givenName,
      familyName: rest.familyName,
      email: rest.email,
      role: rest.role,
    };
    const studentUpdates: Partial<Student> = {
      studentId: rest.studentId,
      university: rest.university,
      pronouns: rest.pronouns,
      tshirtSize: rest.tshirtSize,
      dietaryRequirements: rest.dietaryRequirements,
      photoConsent: rest.photoConsent,
      team: rest.team,
    };
    if (password) {
      userUpdates.password = await passwordUtils().hash(password);
    }

    const cleanedUserUpdates = Object.fromEntries(
      Object.entries(userUpdates).filter(([, value]) => value !== undefined),
    );
    const cleanedStudentUpdates = Object.fromEntries(
      Object.entries(studentUpdates).filter(([, value]) => value !== undefined),
    );

    const result = await this.db.transaction(async (tx) => {
      if (Object.keys(cleanedUserUpdates).length > 0) {
        await tx
          .update(users)
          .set(cleanedUserUpdates)
          .where(eq(users.id, userId));
      }

      if (Object.keys(cleanedStudentUpdates).length > 0) {
        await tx
          .update(students)
          .set(cleanedStudentUpdates)
          .where(eq(students.userId, userId));
      }

      if (rest.languagesSpoken) {
        await tx
          .delete(languagesSpokenByStudent)
          .where(eq(languagesSpokenByStudent.studentId, userId));

        for (const languageCode of rest.languagesSpoken) {
          await tx
            .insert(languagesSpokenByStudent)
            .values({ studentId: userId, languageCode });
        }
      }

      const stumeow = await this.db.query.students.findFirst({
        where: eq(students.userId, userId)
      })
      console.log(stumeow);
      return { ...rest };
    });
    return result;
  }

  async deleteStudent(userId: string): Promise<DeleteResponse> {
    const [student] = await this.db
      .select({ userId: users.id })
      .from(users)
      .where(eq(users.id, userId));

    if (!student) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: `Student with id: ${userId} does not exist`,
      });
    }

    await this.db.delete(users).where(eq(users.id, userId));
    return { status: "OK" };
  }
}
