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
export const SendEmailCodeRequestSchema = z.object({
  email: z.string().email(),
});

export type SendEmailCodeRequest = z.infer<typeof SendEmailCodeRequestSchema>;

export const PassVerificationSchema = z.object({
  email: z.string().email(),
  userProvidedCode: z.string(),
});

export type PassVerificationRequest = z.infer<typeof PassVerificationSchema>;

export const UserRoleEnum = z.enum([
  "Student",
  "Coach",
  "Site Coordinator",
  "Admin",
]);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const CreateAdminRequestSchema = z.object({
  givenName: z.string().min(1).max(35),
  familyName: z.string().min(1).max(35),
  password: z.string().min(1).max(128),
  email: z.string().email(),
  role: UserRoleEnum.refine((val) => val === "Admin", {
    message: "Role must be admin",
  }),
});

export type CreateAdminRequest = z.infer<typeof CreateAdminRequestSchema>;

export type UpdateAdminRequest = z.infer<typeof CreateAdminRequestSchema>;

export const CreateStudentRequestSchema = z.object({
  givenName: z.string().min(1).max(35),
  familyName: z.string().min(1).max(35),
  password: z.string().min(1).max(128),
  email: z.string().email(),
  role: UserRoleEnum,
  studentId: z.string().min(1),
  university: z.number(),
  verificationCode: z.string(),
  photoConsent: z.boolean(),
  languagesSpoken: z.array(SpokenLanguageEnum),
});

export type CreateStudentRequest = z.infer<typeof CreateStudentRequestSchema>;

export const UpdateStudentRequestSchema = CreateStudentRequestSchema.omit({
  verificationCode: true,
})
  .extend({
    university: z.number(),
    pronouns: z.string(),
    team: z.string().nullable(),
    dietaryRequirements: z.string().nullable(),
    tshirtSize: z.string(), // Thinking "M", "L", etc. Could do it by numbers? Seems less descriptive
    photoConsent: z.boolean(),
  })
  .partial();

export type UpdateStudentRequest = z.infer<typeof UpdateStudentRequestSchema>;

export const UpdateStudentExclusionsRequestSchema = z.object({
  exclusions: z.string(),
});

export type UpdateStudentExclusionsRequest = z.infer<
  typeof UpdateStudentExclusionsRequestSchema
>;

export const CreateCoachRequestSchema = z.object({
  givenName: z.string().min(1).max(35),
  familyName: z.string().min(1).max(35),
  password: z.string().min(1).max(128),
  email: z.string().email(),
  role: UserRoleEnum,
  university: z.number(),
  verificationCode: z.string(),
});

export type CreateCoachRequest = z.infer<typeof CreateCoachRequestSchema>;

export const UpdateCoachRequestSchema = CreateCoachRequestSchema.omit({
  verificationCode: true,
}).partial();

export type UpdateCoachRequest = z.infer<typeof UpdateCoachRequestSchema>;

export const CreateSiteCoordinatorRequestSchema = z.object({
  givenName: z.string().min(1).max(35),
  familyName: z.string().min(1).max(35),
  password: z.string().min(1).max(128),
  email: z.string().email(),
  role: UserRoleEnum,
  university: z.number(),
  verificationCode: z.string(),
});

export type CreateSiteCoordinatorRequest = z.infer<
  typeof CreateSiteCoordinatorRequestSchema
>;

export const UpdateSiteCoordinatorRequestSchema =
  CreateSiteCoordinatorRequestSchema.omit({ verificationCode: true }).partial();

export type UpdateSiteCoordinatorRequest = z.infer<
  typeof UpdateSiteCoordinatorRequestSchema
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

export const StudentDetailsScehma = z.strictObject({
  studentId: z.string().min(1),
  pronouns: z.string().default(""),
  team: z.string().nullable(),
  dietaryRequirements: z.string().default(""),
  tshirtSize: z.string().default(""), // Thinking "M", "L", etc. Could do it by numbers? Seems less descriptive
  photoConsent: z.boolean().default(false),
  exclusions: z.string().default(""),
  languagesSpoken: z.array(LanguagesSchema).default([]),
});
export type StudentDetailsDTO = z.infer<typeof StudentDetailsScehma>;

export const UpdateStudentDetailsSchema = StudentDetailsScehma.extend({
  languagesSpoken: z.array(z.string().min(1)), // Array of language IDs for updating
}).partial();
export type UpdateStudentDetails = z.infer<typeof UpdateStudentDetailsSchema>;

export const BaseUserSchema = z.strictObject({
  id: z.string(),
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
}).partial();

export type UpdateUser = z.infer<typeof UpdateUserSchema>;

export const UpdatePasswordSchema = z.strictObject({
  password: z.string().min(1).max(255),
});

export type UpdatePassword = z.infer<typeof UpdatePasswordSchema>;

export const BaseUserWithStudentDetailsSchema = BaseUserSchema.extend({
  studentDetails: StudentDetailsScehma.optional(),
}).refine((data) => data.role === "Student" && data.studentDetails, {
  message: "studentDetails must be provided if the role is student",
  path: ["studentDetails"],
});
export type BaseUserWithStudentDetails = z.infer<
  typeof BaseUserWithStudentDetailsSchema
>;
export type BaseUserWithStudentDetailsDTO = Omit<
  BaseUserWithStudentDetails,
  "password" | "university"
> & {
  university: string;
};
