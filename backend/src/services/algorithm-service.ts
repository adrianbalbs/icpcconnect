import { eq, inArray } from "drizzle-orm";
import {
  coursesCompletedByStudent,
  DatabaseConnection,
  languagesSpokenByStudent,
  registrationDetails,
  studentDetails,
  teams,
  universities,
  users,
} from "../db/index.js";
import { runFullAlgorithm } from "../algorithm/algorithm.js";
import { CreateTeamRequest } from "../schemas/team-schema.js";
import { EmailService } from "./email-service.js"
import { sendTeamAllocationEmails } from "./email-handler/email.js";

export type AllUniIDResponse = {
  allUniversityIds: { id: number }[];
};

export type AllLanguagesSpoken = {
  languages: { code: string }[];
};

export type AllCoursesCompleted = {
  courses: { code: number }[];
};

export type StudentResponse = {
  id: string;
  stuGiven: string;
  stuLast: string;
  uniName: string;
  contestExperience: number;
  leetcodeRating: number;
  codeforcesRating: number;
  cppExperience: string;
  cExpericence: string;
  javaExperience: string;
  pythonExperience: string;
  exclusions: string;
  // paired_with: number | null,
};

export type AlgorithmStudentResponse = {
  allStudents: StudentResponse[];
};

export type RunAlgoResponse = {
  success: boolean;
};

export class AlgorithmService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async callAlgorithm(): Promise<RunAlgoResponse> {
    const succesful = await runFullAlgorithm(this);
    return { success: succesful };
  }

  async getAllUniversityIds(): Promise<AllUniIDResponse> {
    const allUniversityIds = await this.db
      .select({
        id: universities.id,
      })
      .from(universities);

    return { allUniversityIds };
  }

  async getAllStudentsFromUniversity(
    universityId: number,
  ): Promise<AlgorithmStudentResponse> {
    const allStudents = await this.db
      .select({
        id: users.id,
        stuGiven: users.givenName,
        stuLast: users.familyName,
        uniName: universities.name,
        contestExperience: registrationDetails.contestExperience,
        leetcodeRating: registrationDetails.leetcodeRating,
        codeforcesRating: registrationDetails.codeforcesRating,
        cppExperience: registrationDetails.cppExperience,
        cExpericence: registrationDetails.cExperience,
        javaExperience: registrationDetails.javaExperience,
        pythonExperience: registrationDetails.pythonExperience,
        exclusions: studentDetails.exclusions,
      })
      .from(users)
      .innerJoin(studentDetails, eq(studentDetails.userId, users.id))
      .innerJoin(universities, eq(universities.id, users.university))
      .innerJoin(
        registrationDetails,
        eq(registrationDetails.student, studentDetails.userId),
      )
      .where(eq(universities.id, universityId));

    return { allStudents };
  }

  async getLanguagesFromStudent(
    studentId: string,
  ): Promise<AllLanguagesSpoken> {
    const languages = await this.db
      .select({
        code: languagesSpokenByStudent.languageCode,
      })
      .from(languagesSpokenByStudent)
      .where(eq(languagesSpokenByStudent.studentId, studentId));

    return { languages };
  }

  async getCoursesFromStudent(studentId: string): Promise<AllCoursesCompleted> {
    const courses = await this.db
      .select({
        code: coursesCompletedByStudent.courseId,
      })
      .from(coursesCompletedByStudent)
      .where(eq(coursesCompletedByStudent.studentId, studentId));

    return { courses };
  }

  async createTeam(req: CreateTeamRequest) {
    const { name, university, memberIds, flagged } = req;

    const [id] = await this.db
      .insert(teams)
      .values({
        name,
        university,
        flagged,
      })
      .returning({ teamId: teams.id });

    const members = await this.db.query.users.findMany({
      where: inArray(users.id, memberIds),
    });
    const memberNames = [];
    const memberEmails = [];
    for (const member of members) {
      memberNames.push(member.givenName + " " + member.familyName);
      memberEmails.push(member.email);
      await this.db
        .update(studentDetails)
        .set({ team: id.teamId })
        .where(eq(studentDetails.userId, member.id));
    }

    sendTeamAllocationEmails({
      name: name,
      memberNames: memberNames,
      memberEmails: memberEmails,
    });

    return id;
  }
}
