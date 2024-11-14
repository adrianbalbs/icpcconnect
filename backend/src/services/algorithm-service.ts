import { eq, inArray } from "drizzle-orm";
import {
  coursesCompletedByStudent,
  DatabaseConnection,
  languagesSpokenByStudent,
  studentDetails,
  teams,
  universities,
  users,
} from "../db/index.js";
import { runFullAlgorithm } from "../algorithm/algorithm.js";
import { CreateTeamRequest } from "../schemas/team-schema.js";

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
  preferences: string;
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
        contestExperience: studentDetails.contestExperience,
        leetcodeRating: studentDetails.leetcodeRating,
        codeforcesRating: studentDetails.codeforcesRating,
        cppExperience: studentDetails.cppExperience,
        cExpericence: studentDetails.cExperience,
        javaExperience: studentDetails.javaExperience,
        pythonExperience: studentDetails.pythonExperience,
        exclusions: studentDetails.exclusions,
        preferences: studentDetails.preferences,
      })
      .from(users)
      .innerJoin(studentDetails, eq(studentDetails.userId, users.id))
      .innerJoin(universities, eq(universities.id, users.university))
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
    for (const member of members) {
      await this.db
        .update(studentDetails)
        .set({ team: id.teamId })
        .where(eq(studentDetails.userId, member.id));
    }

    return id;
  }
}
