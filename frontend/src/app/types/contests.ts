import { z } from "zod";

// This file is temporary, want to find a nicer way to share BE and FE schemas and types
export const CreateContestSchema = z
  .object({
    contestName: z.string().min(5),
    earlyBirdDate: z
      .date({ required_error: "Early Bird Date is required" })
      .refine((date) => date > new Date(), {
        message: "Early Bird Date must be in the future",
      }),
    cutoffDate: z
      .date({ required_error: "Cutoff Date is required" })
      .refine((date) => date > new Date(), {
        message: "Cutoff Date must be in the future",
      }),
    contestDate: z
      .date({ required_error: "Contest Date is required" })
      .refine((date) => date > new Date(), {
        message: "Contest Date must be in the future",
      }),
    university: z.number(),
  })
  .refine((data) => data.earlyBirdDate <= data.cutoffDate, {
    message: "Early Bird Date should be before Cutoff Date",
    path: ["earlyBirdDate"],
  })
  .refine((data) => data.cutoffDate <= data.contestDate, {
    message: "Cutoff Date should be before Contest Date",
    path: ["cutoffDate"],
  });

export type CreateContest = z.infer<typeof CreateContestSchema>;
