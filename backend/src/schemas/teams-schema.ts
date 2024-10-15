import { z } from "zod";

export const CreateTeamSchema = z.object({

});
  
export type CreateTeamRequest = z.infer<typeof CreateTeamSchema>;

export const UpdateTeamSchema = z.object({

});
  
export type UpdateTeamRequest = z.infer<typeof UpdateTeamSchema>;
