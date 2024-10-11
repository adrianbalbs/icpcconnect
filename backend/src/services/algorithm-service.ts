import {
  DatabaseConnection,
} from "../db/index.js";
import {
     StudentInfoSchema,
     StudentScoreRequest,
     RunGroupingRequest,
} from "../schemas/algo-schema.js";
import {
     getStudentScores,
     algorithm,
} from "../algorithm/algorithm.js";
import {
     ContestRegistrationService
} from "./index.js";

export class AlgorithmService {
    private readonly db: DatabaseConnection;
    private readonly contest_service: ContestRegistrationService;
  
    constructor(db: DatabaseConnection, conService: ContestRegistrationService) {
      this.db = db;
      this.contest_service = conService;
    }

/*
    async getStudentScores(req: StudentScoreRequest[]) {
     const scores = getStudentScores(req);
     return { scores };
    }
*/

    async getGroupings() {
     let { registrations } = await this.contest_service.getAllStudentRegistrations();
     const new_registrations = registrations.map((registration) => ({
          ...registration,
          coursesCompleted: registration.coursesCompleted.map((course) => (
               course.type
          )),
          languagesSpoken: registration.languagesSpoken.map((language) => (
               language.name
          )),
          id: registration.student,
          uniId: "",
          paired_with: null,
          markdone: false,
     }));
     const scores = getStudentScores(new_registrations);
     const groups = algorithm(scores);

     return { groups };
    }

    /**
     * TODO:
     * Create a call to get all students and their relevant
     * registration details.
     * 
     * NOTE: Relies on Registration Details being Implemented into the DB
     * 
     * Current format being used:
     * 
     * export interface StudentInfo {
          id: number,
          uniId: number,
          contestExperience: number,
          leetcodeRating: number,
          codeforcesRating: number,
          completedCourses : String[],
          spokenLanguages: String[],
          cppExperience: Experience,
          cExpericence: Experience,
          javaExperience: Experience,
          pythonExperience: Experience,
          paired_with: number | null,
          markdone: boolean
     * }
     */

    /**
     * TODO:
     * Create a call that puts a team into the DB/
     * Current format of algorithm return: Group[]
     * 
     * interface Group {
          ids: [number, number, number],
          totalScore: number
     * }
     */
}
  