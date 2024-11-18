export type Role = "Admin" | "Site Coordinator" | "Coach" | "Student";

export type User = {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  role: Role;
  university: string;
  studentId: string;
  pronouns: string;
  dietaryRequirements: string;
  tShirtSize: string;
  team: string | null;
  photoConsent: boolean;
  level: "A" | "B";
  contestExperience: number;
  codeforcesRating: number;
  leetcodeRating: number;
  cExperience: "none" | "some" | "prof";
  cppExperience: "none" | "some" | "prof";
  javaExperience: "none" | "some" | "prof";
  pythonExperience: "none" | "some" | "prof";
  timeSubmitted: string;
  languagesSpoken: { code: string; name: string }[];
  coursesCompleted: { id: number; type: string }[];
};

export type University = {
  id: number;
  name: string;
  hostedAt: number;
};
