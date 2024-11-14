import { z } from "zod";

export const AlgorithmRequestSchema = z.strictObject({
  contestId: z.string(),
});

export type AlgorithmRequest = z.infer<typeof AlgorithmRequestSchema>;
