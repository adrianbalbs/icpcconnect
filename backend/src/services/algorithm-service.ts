import { eq } from "drizzle-orm";
import {
  DatabaseConnection,
  students,
  teams,
  universities,
  users,
} from "../db/index.js";

export class AlgorithmService {
    private readonly db: DatabaseConnection;
  
    constructor(db: DatabaseConnection) {
      this.db = db;
    }

    // Grabs all students from a particular university
    // TODO: Need to link this to their registration details for determining scores
    async getStudentIdsByUniversity(universityId: number): Promise<string[]> {
    const studentIds = await this.db
        .select({
        studentId: students.userId,
        })
        .from(students)
        .where(eq(students.university, universityId));
    
    return studentIds.map((student) => student.studentId);
    }

    // Function to push a team to the db
}
  