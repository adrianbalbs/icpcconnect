import { z } from "zod";
import { passwordUtils } from "../utils/encrypt.js";

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

export const UpdateStudentRequestSchema = CreateStudentRequestSchema.extend({
  studentId: z.string(),
  university: z.number(),
  pronouns: z.string(),
  team: z.string().nullable(),
});

export type UpdateStudentRequest = z.infer<typeof UpdateStudentRequestSchema>;

export const CreateCoachRequestSchema = z.object({
  givenName: z.string(),
  familyName: z.string(),
  password: z.string(),
  email: z.string(),
  role: UserRoleEnum,
  university: z.number(),
});

export type CreateCoachRequest = z.infer<typeof CreateCoachRequestSchema>;

export const UpdateCoachRequestSchema = CreateCoachRequestSchema;
export type UpdateCoachRequest = z.infer<typeof UpdateCoachRequestSchema>;

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

export const UpdateSiteCoordinatorRequestSchema =
  CreateSiteCoordinatorRequestSchema;

export type UpdateSiteCoordinatorRequest = z.infer<
  typeof UpdateSiteCoordinatorRequestSchema
>;

export const LoginRequestSchema = z.object({
  email: z.string(),
  password: z.string(),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>;