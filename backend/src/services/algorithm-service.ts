import {
  DatabaseConnection,
} from "../db/index.js";

export class AlgorithmService {
    private readonly db: DatabaseConnection;
  
    constructor(db: DatabaseConnection) {
      this.db = db;
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
  