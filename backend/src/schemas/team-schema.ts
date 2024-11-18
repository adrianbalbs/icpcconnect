import { z } from "zod";
import { UserDTO } from "./user-schema.js";
export type UpdateTeamRequestSID = UpdateTeamRequest;
export type UpdateTeamResponseSID = UpdateTeamRequest;

//How do model the students??
export const CreateTeamRequestSchema = z.object({
  name: z.string(),
  university: z.number(),
  memberIds: z.array(z.string()),
  flagged: z.boolean(),
  contest: z.string(),
});

export type CreateTeamRequest = z.infer<typeof CreateTeamRequestSchema>;

export const CreateTeamResponseSchema = z.object({
  teamId: z.string(),
});

export type CreateTeamResponse = z.infer<typeof CreateTeamResponseSchema>;

export const UpdateTeamRequestSchema = CreateTeamRequestSchema.partial();

export type UpdateTeamRequest = z.infer<typeof UpdateTeamRequestSchema>;
export type UpdateTeamResponse = UpdateTeamRequest;

export type Member = Pick<
  UserDTO,
  "id" | "studentId" | "givenName" | "familyName" | "email"
>;

export const ReplacementSchema = z.object({
  reason: z.string(),
  leavingUserId: z.string(),
  replacementStudentId: z.string(),
});
export type Replacement = z.infer<typeof ReplacementSchema>;

export type TeamDTO = {
  id: string;
  name: string;
  university: string;
  contest: string;
  flagged: boolean;
  members: Member[];
  replacements: Replacement[];
};

export const PutStudentTeamSchema = z.object({
  studentIds: z.string(),
});

export type PutStudentTeamRequest = z.infer<typeof PutStudentTeamSchema>;

export const SendTeamAllocatedEmailSchema = z.object({
  name: z.string(),
  memberNames: z.array(z.string()),
  memberEmails: z.array(z.string().email()),
});

export type SendTeamAllocationEmail = z.infer<
  typeof SendTeamAllocatedEmailSchema
>;

export const ReplacementRequestSchema = z.object({
  team: z.string(),
  student: z.string(),
  replacedWith: z.string(),
});

export type ReplacementRequest = z.infer<typeof ReplacementRequestSchema>;

export const PulloutRequestSchema = z.object({
  studentId: z.string(),
  replacedWith: z.string(),
  reason: z.string(),
});

export type PulloutRequest = z.infer<typeof PulloutRequestSchema>;

export const GetAllTeamsQuerySchema = z.strictObject({
  contest: z.string().optional(),
});

export type GetAllTeamsQuery = z.infer<typeof GetAllTeamsQuerySchema>;
