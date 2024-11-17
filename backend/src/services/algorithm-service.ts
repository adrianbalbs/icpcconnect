import { and, eq, inArray, isNull } from "drizzle-orm";
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
import { 
  CreateTeamRequest,
  RunAlgoResponse,
  AllUniIDResponse,
  AlgorithmStudentResponse,
  AllLanguagesSpoken,
  AllCoursesCompleted,
  TeamId,
} from "../schemas/index.js";


export class AlgorithmService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async callAlgorithm(contestId: string): Promise<RunAlgoResponse> {
    const succesful = await runFullAlgorithm(this, contestId);
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
    contestId: string,
  ): Promise<AlgorithmStudentResponse> {
    const allStudents = await this.db
      .select({
        id: users.id,
        studentId: studentDetails.studentId,
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
      .innerJoin(registrationDetails, eq(registrationDetails.student, users.id))
      .where(
        and(
          isNull(studentDetails.team),
          and(
            eq(universities.id, universityId),
            eq(registrationDetails.contest, contestId),
          ),
        ),
      );

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
  *   req.contest - contest team is registered for
  * 
  * 
  * @returns the teamId of the newly created team
  */
  async createTeam(req: CreateTeamRequest) {
    const { name, university, memberIds, flagged, contest } = req;

    const [id] = await this.db
      .insert(teams)
      .values({
        name,
        university,
        flagged,
        contest,
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
