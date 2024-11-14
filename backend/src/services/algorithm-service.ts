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

export type TeamId {
  teamId: string;
}

export class AlgorithmService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /*
  * Calls the team-matching algorithm
  *
  * @returns RunAlgoResponse - with a boolean indicating success
  */
  async callAlgorithm(): Promise<RunAlgoResponse> {
    const succesful = await runFullAlgorithm(this);
    return { success: succesful };
  }

  /*
  * Get an array of ids for all universities registered
  *
  * @returns AllUniIdResponse - an array of ids corresponding to a university
  */
  async getAllUniversityIds(): Promise<AllUniIDResponse> {
    const allUniversityIds = await this.db
      .select({
        id: universities.id,
      })
      .from(universities);

    return { allUniversityIds };
  }

  /*
  * Get all students of a given university
  *
  * @param universityId - the id of the given university
  *
  * @returns AlgorithmStudentResponse - an array of StudentResponse's
  */
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

  /*
  * Get all students of a given university
  *
  * @param universityId - the id of the given university
  *
  * @returns AlgorithmStudentResponse - an array of StudentResponse's
  */
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

  /*
  * Get all courses a given student has completed
  *
  * @param studentId - the given student's studentId
  *
  * @returns AllCoursesCompleted - an array of course codes
  */
  async getCoursesFromStudent(studentId: string): Promise<AllCoursesCompleted> {
    const courses = await this.db
      .select({
        code: coursesCompletedByStudent.courseId,
      })
      .from(coursesCompletedByStudent)
      .where(eq(coursesCompletedByStudent.studentId, studentId));

    return { courses };
  }

  /*
  * Creates a new team of students
  *
  * @param req - 
  *   req.name - Name of the team
  *   req.university - Id of the university team belongs to
  *   req.flagged - boolean indicating team might have conflicting members
  *   req.memberIds - array of userIds, corresponding to students
  * 
  * 
  * @returns the teamId of the newly created team
  */
  async createTeam(req: CreateTeamRequest): Promise<TeamId> {
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
