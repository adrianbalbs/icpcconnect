import { z } from "zod";

export const SendEmailCodeRequestSchema = z.object({
  email: z.string().email(),
});

export type SendEmailCodeRequest = z.infer<typeof SendEmailCodeRequestSchema>;

export const PassVerificationSchema = z.object({
  email: z.string().email(),
  userProvidedCode: z.string()
});

export type PassVerificationRequest = z.infer<typeof PassVerificationSchema>;

const UserRoleEnum = z.enum(["student", "coach", "site_coordinator", "admin"]);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const CreateAdminRequestSchema = z.object({
  givenName: z.string().min(1).max(35),
  familyName: z.string().min(1).max(35),
  password: z.string().min(1).max(128),
  email: z.string().email(),
  role: UserRoleEnum.refine((val) => val === "admin", {
    message: "Role must be admin",
  }),
});

export type CreateAdminRequest = z.infer<typeof CreateAdminRequestSchema>;

export type UpdateAdminRequest = z.infer<typeof CreateAdminRequestSchema>;

export const CreateStudentRequestSchema = z.object({
  givenName: z.string().min(1).max(35),
  familyName: z.string().min(1).max(35),
  password: z.string().min(1).max(128),
  email: z.string().email(),
  role: UserRoleEnum,
  studentId: z.string().min(1),
  university: z.number(),
  verificationCode: z.string(),
});

export type CreateStudentRequest = z.infer<typeof CreateStudentRequestSchema>;

export const UpdateStudentRequestSchema = CreateStudentRequestSchema.omit({
  verificationCode: true,
})
  .extend({
    university: z.number(),
    pronouns: z.string(),
    team: z.string().nullable(),
  })
  .partial();

export type UpdateStudentRequest = z.infer<typeof UpdateStudentRequestSchema>;

export const CreateCoachRequestSchema = z.object({
  givenName: z.string().min(1).max(35),
  familyName: z.string().min(1).max(35),
  password: z.string().min(1).max(128),
  email: z.string().email(),
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
  givenName: z.string().min(1).max(35),
  familyName: z.string().min(1).max(35),
  password: z.string().min(1).max(128),
  email: z.string().email(),
  role: UserRoleEnum,
  university: z.number(),
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

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
