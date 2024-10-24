import { eq } from "drizzle-orm";
import { DatabaseConnection, registrationDetails, spokenLanguages, students, universities, users } from "../db/index.js";

export type AllUniIDResponse = {
     allUniversityIds: { id: number }[]
}

export type StudentResponse = {
     id: number,
     uniName: string,
     contestExperience: number,
     leetcodeRating: number,
     codeforcesRating: number,
     completedCourses : number[],
     spokenLanguages: number[],
     cppExperience: number,
     cExpericence: number,
     javaExperience: number,
     pythonExperience: number,
     // paired_with: number | null,
}

export type AlgorithmStudentResponse = {
     allStudents: StudentResponse[]
}

export class AlgorithmService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async getAllUniversityIds(): Promise<AllUniIDResponse> {
     const allUniversityIds = await this.db
          .select({
               id: universities.id
          })
          .from(universities)
     
     return { allUniversityIds };
  }

  async getAllStudentsFromUniversity(universityId: number): Promise<AlgorithmStudentResponse> {
     const allStudents = await this.db
       .select({
          id: users.id,
          university: universities.name,
          contestExperience: registrationDetails.contestExperience,
          leetcodeRating: registrationDetails.leetcodeRating,
          codeforcesRating: registrationDetails.codeforcesRating,
          completedCourses: [1],
          spokenLanguages: [1],
          cppExperience: registrationDetails.cppExperience,
          cExpericence: registrationDetails.cExperience,
          javaExperience: registrationDetails.javaExperience,
          pythonExperience: registrationDetails.pythonExperience,
       })
       .from(users)
       .innerJoin(students, eq(students.userId, users.id))
       .innerJoin(universities, eq(universities.id, students.university))
       .innerJoin(registrationDetails, eq(registrationDetails.student))
       .where(eq(universities.id, universityId))
 
     return { allStudents };
   }
}

