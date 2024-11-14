import { z } from "zod";
import { UserDTO } from "./user-schema.js";

//How do model the students??
export const CreateTeamRequestSchema = z.object({
  name: z.string(),
  university: z.number(),
  memberIds: z.array(z.string()),
  flagged: z.boolean(),
  contest: z.string(),
});

export type CreateTeamRequest = z.infer<typeof CreateTeamRequestSchema>;

export const UpdateTeamRequestSchema = CreateTeamRequestSchema.partial();

export type UpdateTeamRequest = z.infer<typeof UpdateTeamRequestSchema>;

export type Member = Pick<
  UserDTO,
  "id" | "studentId" | "givenName" | "familyName" | "email"
>;

export type TeamDTO = {
  id: string;
  name: string;
  university: string;
  contest: string;
  flagged: boolean;
  members: Member[];
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

export const GetAllTeamsQuerySchema = z.strictObject({
  contest: z.string().optional(),
});

export type GetAllTeamsQuery = z.infer<typeof GetAllTeamsQuerySchema>;
