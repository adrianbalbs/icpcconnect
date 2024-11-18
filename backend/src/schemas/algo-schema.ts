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
  studentId: string;
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

export type TeamId = {
  teamId: string;
};
