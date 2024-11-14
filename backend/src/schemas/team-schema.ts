import { z } from "zod";

//How do model the students??
export const CreateTeamRequestSchema = z.object({
  name: z.string(),
  university: z.number(),
  memberIds: z.array(z.string()), 
  flagged: z.boolean()
});

export type CreateTeamRequest = z.infer<typeof CreateTeamRequestSchema>;

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