import { z } from "zod";
import {
  UserSchema,


} from "./index.js";

//How do model the students??
export const CreateTeamRequestSchema = z.object({
  name: z.string(),
  university: z.number(),
  memberIds: z.array(z.string()), 
  flagged: z.boolean()
});

export type CreateTeamRequest = z.infer<typeof CreateTeamRequestSchema>;

export const CreateTeamResponseSchema = z.object({
  teamId: z.string(),
});

export type CreateTeamResponse = z.infer<typeof CreateTeamResponseSchema>;

export const UpdateTeamRequestSchema = CreateTeamRequestSchema.partial();

export type UpdateTeamRequest = z.infer<typeof UpdateTeamRequestSchema>;

export const PutStudentTeamSchema = z.object({
  studentIds: z.string(),
})

export type PutStudentTeamRequest = z.infer<typeof PutStudentTeamSchema>;

export const SendTeamAllocatedEmailSchema = z.object({
  name: z.string(),
  memberNames: z.array(z.string()),
  memberEmails: z.array(z.string().email())
});

export type SendTeamAllocationEmail = z.infer<typeof SendTeamAllocatedEmailSchema>;

export const UniversityDetailsSchema = z.object({
  name: z.string(),
  id: z.number(),
  hostedAt: z.number(),
});

export const TeamDetailsSchema = z.object({
  name: z.string(),
  flagged: z.boolean(),
  id: z.string(),
  university: UniversityDetailsSchema,
  members: z.array(UserSchema),
});

export type TeamDetails = z.infer<typeof TeamDetailsSchema>;