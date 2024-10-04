import { z } from "zod";

const UserRoleEnum = z.enum(["student", "coach", "site_coordinator", "admin"]);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const CreateStudentRequestSchema = z.object({
  givenName: z.string(),
  familyName: z.string(),
  password: z.string(),
  email: z.string(),
  role: UserRoleEnum,
  studentId: z.string(),
  university: z.number(),
});

export type CreateStudentRequest = z.infer<typeof CreateStudentRequestSchema>;

export const CreateCoachRequestSchema = z.object({
  givenName: z.string(),
  familyName: z.string(),
  password: z.string(),
  email: z.string(),
  role: UserRoleEnum,
  university: z.number(),
});

export type CreateCoachRequest = z.infer<typeof CreateCoachRequestSchema>;

export const CreateSiteCoordinatorRequestSchema = z.object({
  givenName: z.string(),
  familyName: z.string(),
  password: z.string(),
  email: z.string(),
  role: UserRoleEnum,
  site: z.number(),
});

export type CreateSiteCoordinatorRequest = z.infer<
  typeof CreateSiteCoordinatorRequestSchema
>;
