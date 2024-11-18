import { z } from "zod";

const SpokenLanguageEnum = z.enum([
  "ab",
  "aa",
  "af",
  "ak",
  "sq",
  "am",
  "ar",
  "an",
  "hy",
  "as",
  "av",
  "ae",
  "ay",
  "az",
  "bm",
  "ba",
  "eu",
  "be",
  "bn",
  "bh",
  "bi",
  "bs",
  "br",
  "bg",
  "my",
  "ca",
  "ch",
  "ce",
  "ny",
  "zh",
  "zh-Hans",
  "zh-Hant",
  "cv",
  "kw",
  "co",
  "cr",
  "hr",
  "cs",
  "da",
  "dv",
  "nl",
  "dz",
  "en",
  "eo",
  "et",
  "ee",
  "fo",
  "fj",
  "fi",
  "fr",
  "ff",
  "gl",
  "gd",
  "gv",
  "ka",
  "de",
  "el",
  "kl",
  "gn",
  "gu",
  "ht",
  "ha",
  "he",
  "hz",
  "hi",
  "ho",
  "hu",
  "is",
  "io",
  "ig",
  "id",
  "ia",
  "ie",
  "iu",
  "ik",
  "ga",
  "it",
  "ja",
  "jv",
  "kn",
  "kr",
  "ks",
  "kk",
  "km",
  "ki",
  "rw",
  "rn",
  "ky",
  "kv",
  "kg",
  "ko",
  "ku",
  "kj",
  "lo",
  "la",
  "lv",
  "li",
  "ln",
  "lt",
  "lu",
  "lg",
  "lb",
  "mk",
  "mg",
  "ms",
  "ml",
  "mt",
  "mi",
  "mr",
  "mh",
  "mo",
  "mn",
  "na",
  "nv",
  "ng",
  "nd",
  "ne",
  "no",
  "nb",
  "nn",
  "ii",
  "oc",
  "oj",
  "cu",
  "or",
  "om",
  "os",
  "pi",
  "ps",
  "fa",
  "pl",
  "pt",
  "pa",
  "qu",
  "rm",
  "ro",
  "ru",
  "se",
  "sm",
  "sg",
  "sa",
  "sr",
  "sh",
  "st",
  "tn",
  "sn",
  "sd",
  "si",
  "ss",
  "sk",
  "sl",
  "so",
  "nr",
  "es",
  "su",
  "sw",
  "sv",
  "tl",
  "ty",
  "tg",
  "ta",
  "tt",
  "te",
  "th",
  "bo",
  "ti",
  "to",
  "ts",
  "tr",
  "tk",
  "tw",
  "ug",
  "uk",
  "ur",
  "uz",
  "ve",
  "vi",
  "vo",
  "wa",
  "cy",
  "wo",
  "fy",
  "xh",
  "yi",
  "yo",
  "za",
  "zu",
]);

export type SpokenLanguage = z.infer<typeof SpokenLanguageEnum>;

export const SendEmailVerificationCodeRequestSchema = z.object({
  email: z.string().email(),
  isNormalVerificationEmail: z.boolean(),
});

export type SendEmailVerificationCodeRequest = z.infer<
  typeof SendEmailVerificationCodeRequestSchema
>;

export const SendEmailForgotPasswordCodeRequestSchema = z.object({
  email: z.string().email(),
});

export type SendEmailForgotPasswordCodeRequest = z.infer<
  typeof SendEmailForgotPasswordCodeRequestSchema
>;

export const PassRegisterEmailVerificationSchema = z.object({
  email: z.string().email(),
  userProvidedCode: z.string(),
});

export type PassRegisterEmailVerificationRequest = z.infer<
  typeof PassRegisterEmailVerificationSchema
>;

export const PassForgotPasswordVerificationSchema = z.object({
  id: z.string(),
  authenticationCode: z.string(),
});

export type PassForgotPasswordVerificationRequest = z.infer<
  typeof PassForgotPasswordVerificationSchema
>;

export const ForgotPasswordResetPasswordSchema = z.object({
  id: z.string(),
  newPassword: z.string(),
});

export type ForgotPasswordResetPasswordRequest = z.infer<
  typeof ForgotPasswordResetPasswordSchema
>;

export const UserRoleEnum = z.enum([
  "Student",
  "Coach",
  "Site Coordinator",
  "Admin",
]);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const UpdateStudentExclusionsRequestSchema = z.object({
  exclusions: z.string(),
});

export type UpdateStudentExclusionsRequest = z.infer<
  typeof UpdateStudentExclusionsRequestSchema
>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LanguagesSchema = z.strictObject({
  code: z.string(),
  name: z.string(),
});

const LevelEnum = z.enum(["A", "B"]);
export type Level = z.infer<typeof LevelEnum>;

const LanguageExperienceEnum = z.enum(["none", "some", "prof"]);
export type LanguageExperience = z.infer<typeof LanguageExperienceEnum>;

const CourseNamesEnum = z.enum([
  "Programming Fundamentals",
  "Data Structures and Algorithms",
  "Algorithm Design",
  "Programming Challenges",
]);
export type CourseNames = z.infer<typeof CourseNamesEnum>;

const CourseSchema = z.strictObject({
  id: z.number(),
  type: CourseNamesEnum,
});

export type Course = z.infer<typeof CourseSchema>;

export const StudentDetailsScehma = z.strictObject({
  studentId: z.string().min(1),
  pronouns: z.string().default(""),
  team: z.string().nullable(),
  dietaryRequirements: z.string().default(""),
  profilePic: z.string().default(""),
  tshirtSize: z.string().default(""), // Thinking "M", "L", etc. Could do it by numbers? Seems less descriptive
  photoConsent: z.boolean().default(false),
  languagesSpoken: z.array(LanguagesSchema).default([]),
  level: LevelEnum,
  contestExperience: z.number(),
  codeforcesRating: z.number(),
  leetcodeRating: z.number(),
  cppExperience: LanguageExperienceEnum,
  cExperience: LanguageExperienceEnum,
  javaExperience: LanguageExperienceEnum,
  pythonExperience: LanguageExperienceEnum,
  coursesCompleted: z.array(CourseSchema),
  preferences: z.string().default(""),
  exclusions: z.string().default(""),
});

export type StudentDetailsDTO = z.infer<typeof StudentDetailsScehma>;

export const UpdateStudentDetailsSchema = StudentDetailsScehma.extend({
  languagesSpoken: z.array(SpokenLanguageEnum), // Array of language IDs for updating
  preferences: z.string().default(""),
  coursesCompleted: z.array(z.number()),
}).partial();
export type UpdateStudentDetails = z.infer<typeof UpdateStudentDetailsSchema>;

export const BaseUserSchema = z.strictObject({
  id: z.string().uuid(),
  givenName: z.string().min(1).max(35),
  familyName: z.string().min(1).max(35),
  email: z.string().email(),
  password: z.string().min(1).max(255),
  role: UserRoleEnum,
  university: z.number(),
});
export type BaseUser = z.infer<typeof BaseUserSchema>;
export type BaseUserDTO = Omit<BaseUser, "password" | "university"> & {
  university: string;
};

export const UpdateUserSchema = BaseUserSchema.omit({
  id: true,
  password: true,
  role: true,
}).partial();

export type UpdateUser = z.infer<typeof UpdateUserSchema>;

export const UpdatePasswordSchema = z.strictObject({
  oldPassword: z.string().min(1).max(255),
  newPassword: z.string().min(1).max(255),
});

export const CreateUserSchema = BaseUserSchema.extend({
  studentId: z.string().min(1).optional(),
  inviteCode: z.string().min(1).optional(),
}).omit({ id: true });

export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UserSchema = BaseUserSchema.merge(StudentDetailsScehma);

export type UserDTO = Omit<
  z.infer<typeof UserSchema>,
  "password" | "university"
> & { university: string };

export const GetAllUsersQuerySchema = z.strictObject({
  role: UserRoleEnum.optional(),
  contest: z.string().optional(),
});

export const ExclusionsResponseSchema = z.object({
  exclusions: z.string(),
});

export type ExclusionsResponse = z.infer<typeof ExclusionsResponseSchema>;

export const PreferencesResponseSchema = z.object({
  studentId: z.string(),
  name: z.string(),
});

export type PreferencesResponse = z.infer<typeof PreferencesResponseSchema>;
export const CreateContestRegistrationSchema = z.strictObject({
  student: z.string(),
  contest: z.string(),
});

export type CreateContestRegistration = z.infer<
  typeof CreateContestRegistrationSchema
>;

export const PulloutSchema = z.object({
  associated_team: z.string(), // team id,
  leavingInternalId: z.string(), //leaving persons internal id
  replacementStudentId: z.string(), //potential replacements student id,
  reason: z.string(),
});

export type Pullout = z.infer<typeof PulloutSchema>;
