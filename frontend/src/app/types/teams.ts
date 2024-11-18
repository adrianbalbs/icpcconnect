import { User } from "./users";

export type Member = Pick<
  User,
  "id" | "studentId" | "givenName" | "familyName" | "email"
>;

export type Team = {
  id: string;
  name: string;
  university: string;
  contest: string;
  flagged: boolean;
  members: Member[];
  replacements: {
    reason: string;
    leavingUserId: string;
    replacementStudentId: string;
  }[];
};
