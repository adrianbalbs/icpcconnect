import { z } from "zod";

export const AlgorithmRequestSchema = z.strictObject({
  contestId: z.string(),
});

export const EmailTeamsScehma = z.strictObject({
  contestId: z.string(),
});

export type EmailTeams = z.infer<typeof EmailTeamsScehma>;
export type AlgorithmRequest = z.infer<typeof AlgorithmRequestSchema>;
