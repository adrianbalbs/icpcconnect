import { z } from "zod";

export const AlgorithmRequestSchema = z.strictObject({
  contestId: z.string(),
});

export const EmailTeamsScehma = z.strictObject({
  contestId: z.string(),
});

export const VerifyPasswordSchema = z.strictObject({
  id: z.string().uuid(),
  password: z.string().min(1),
});

export type EmailTeams = z.infer<typeof EmailTeamsScehma>;
export type AlgorithmRequest = z.infer<typeof AlgorithmRequestSchema>;
export type VerifyPassword = z.infer<typeof VerifyPasswordSchema>;
