import { z } from "zod";


//How do model the students??
export const CreateTeamRequestSchema = z.object({
  name: z.string(),
  university: z.number(),
  memberIds: z.array(z.string()), 
});

export type CreateTeamRequest = z.infer<typeof CreateTeamRequestSchema>;


export const UpdateTeamRequestSchema = CreateTeamRequestSchema;

export type UpdateTeamRequest = z.infer<typeof UpdateTeamRequestSchema>;