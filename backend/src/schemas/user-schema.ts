import { z } from "zod";

const UserRoleEnum = z.enum(["student", "coach", "site_coordinator", "admin"]);
export type UserRole = z.infer<typeof UserRoleEnum>;


export const CreateAdminRequestSchema = z.object({
  givenName: z.string(),
  familyName: z.string(),
  password: z.string(),
  email: z.string(),
  role: UserRoleEnum.refine((val) => val === "admin", {
    message: "Role must be admin",
  })
});

export type CreateAdminRequest = z.infer<typeof CreateAdminRequestSchema>;

export type UpdateAdminRequest = z.infer<typeof CreateAdminRequestSchema>;

export const CreateStudentRequestSchema = z.object({
  givenName: z.string(),
  familyName: z.string(),
  password: z.string(),
  email: z.string(),
  role: UserRoleEnum,
  studentId: z.string(),
  university: z.number(),
  verificationCode: z.string(),
});

export type CreateStudentRequest = z.infer<typeof CreateStudentRequestSchema>;

export const UpdateStudentRequestSchema = CreateStudentRequestSchema.omit({
  verificationCode: true,
}).extend({
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
  verificationCode: z.string(),
});

export type CreateCoachRequest = z.infer<typeof CreateCoachRequestSchema>;

export const UpdateCoachRequestSchema = CreateCoachRequestSchema.omit({
  verificationCode: true,
});

export type UpdateCoachRequest = z.infer<typeof UpdateCoachRequestSchema>;

export const CreateSiteCoordinatorRequestSchema = z.object({
  givenName: z.string(),
  familyName: z.string(),
  password: z.string(),
  email: z.string(),
  role: UserRoleEnum,
  site: z.number(),
  verificationCode: z.string(),
});

export type CreateSiteCoordinatorRequest = z.infer<
  typeof CreateSiteCoordinatorRequestSchema
>;

export const UpdateSiteCoordinatorRequestSchema =
  CreateSiteCoordinatorRequestSchema.omit({ verificationCode: true });

export type UpdateSiteCoordinatorRequest = z.infer<
  typeof UpdateSiteCoordinatorRequestSchema
>;
