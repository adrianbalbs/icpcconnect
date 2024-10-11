import { z } from "zod";

//const ExperienceEnum = z.enum(["none", "some", "prof"]);

/*
export const StudentInfoSchema = z.object({
  id: z.number(),
  uniId: z.number(),
  contestExperience: z.number(),
  leetcodeRating: z.number(),
  codeforcesRating: z.number(),
  completedCourses: z.array(z.string()),
  spokenLanguages: z.array(z.string()),
  cppExperience: ExperienceEnum,
  cExperience: ExperienceEnum,
  javaExperience: ExperienceEnum,
  pythonExperience: ExperienceEnum,
  paired_with: z.number(),
  markdone: z.boolean(),
});
*/

export const StudentInfoSchema = z.object({
  id: z.number(),
  uniId: z.number(),
  contestExperience: z.number(),
  leetcodeRating: z.number(),
  codeforcesRating: z.number(),
  completedCourses: z.array(z.string()),
  spokenLanguages: z.array(z.string()),
  cppExperience: z.number(),
  cExperience: z.number(),
  javaExperience: z.number(),
  pythonExperience: z.number(),
  paired_with: z.number(),
  markdone: z.boolean(),
});
export type StudentScoreRequest = z.infer<typeof StudentInfoSchema>;

export const RunGroupingSchema = z.object({
  ids: z.array(z.number()),
  studentScore: z.number(),
});

export type RunGroupingRequest = z.infer<typeof RunGroupingSchema>;