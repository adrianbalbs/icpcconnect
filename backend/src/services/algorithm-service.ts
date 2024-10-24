import { eq } from "drizzle-orm";
import { coursesCompletedByStudent, DatabaseConnection, languagesSpokenByStudent, registrationDetails, spokenLanguages, students, universities, users } from "../db/index.js";
import { uniqueKeyName } from "drizzle-orm/mysql-core";

export type AllUniIDResponse = {
     allUniversityIds: { id: number }[]
}

export type AllLanguagesSpoken = {
     languages: { code: string }[]
}

export type AllCoursesCompleted = {
     courses: { code: number }[]
}

export type StudentResponse = {
     id: string,
     uniName: string,
     contestExperience: number,
     leetcodeRating: number,
     codeforcesRating: number,
     cppExperience: string,
     cExpericence: string,
     javaExperience: string,
     pythonExperience: string,
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
          uniName: universities.name,
          contestExperience: registrationDetails.contestExperience,
          leetcodeRating: registrationDetails.leetcodeRating,
          codeforcesRating: registrationDetails.codeforcesRating,
          cppExperience: registrationDetails.cppExperience,
          cExpericence: registrationDetails.cExperience,
          javaExperience: registrationDetails.javaExperience,
          pythonExperience: registrationDetails.pythonExperience,
       })
       .from(users)
       .innerJoin(students, eq(students.userId, users.id))
       .innerJoin(universities, eq(universities.id, students.university))
       .innerJoin(registrationDetails, eq(registrationDetails.student, students.userId))
       .where(eq(universities.id, universityId))
 
     return { allStudents };
   }

   async getLanguagesFromStudent(studentId: string): Promise<AllLanguagesSpoken> {
     const languages = await this.db
     .select({
          code: languagesSpokenByStudent.languageCode
     })
     .from(languagesSpokenByStudent)
     .where(eq(languagesSpokenByStudent.studentId, studentId))

     return { languages }
   }

   async getCoursesFromStudent(studentId: string): Promise<AllCoursesCompleted> {
     const courses = await this.db
     .select({
          code: coursesCompletedByStudent.courseId
     })
     .from(coursesCompletedByStudent)
     .where(eq(coursesCompletedByStudent.studentId, studentId))

     return { courses }
   }
}

