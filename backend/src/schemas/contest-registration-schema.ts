import { z } from "zod";


const LevelEnum = z.enum(["A", "B"]);
export type Level = z.infer<typeof LevelEnum>;

const LanguageExperienceEnum = z.enum(["none", "some", "prof"]);
export type LanguageExperience = z.infer<typeof LanguageExperienceEnum>;

const CoursesTakenUnion = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);
export type CoursesTakenUnion = z.infer<typeof CoursesTakenUnion>;

export const CreateContestRegistrationFormSchema = z.object({
  student: z.string(),
  level: LevelEnum,
  contestExperience: z.number(),
  codeforcesRating: z.number(),
  leetcodeRating: z.number(),
  cppExperience: LanguageExperienceEnum,
  cExperience: LanguageExperienceEnum,
  javaExperience: LanguageExperienceEnum,
  pythonExperience: LanguageExperienceEnum,
  coursesTaken: z.array(CoursesTakenUnion),
});

export type CreateContestRegistrationForm = z.infer<
  typeof CreateContestRegistrationFormSchema
>;

export const UpdateContestRegistrationFormSchema =
  CreateContestRegistrationFormSchema.omit({ student: true });
export type UpdateContestRegistrationForm = z.infer<
  typeof UpdateContestRegistrationFormSchema
>;
