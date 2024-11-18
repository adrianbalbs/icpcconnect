import { InferSelectModel, relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
  primaryKey,
  date,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "Student",
  "Coach",
  "Site Coordinator",
  "Admin",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  givenName: varchar("given_name", { length: 35 }).notNull(),
  familyName: varchar("family_name", { length: 35 }).notNull(),
  password: varchar("password", { length: 128 }).notNull(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull(),
  university: integer("university")
    .references(() => universities.id)
    .notNull(),
  refreshTokenVersion: integer("refresh_token_version").default(1).notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  studentDetails: one(studentDetails),
  registrationDetails: one(registrationDetails),
  university: one(universities, {
    fields: [users.university],
    references: [universities.id],
  }),
}));

export type User = InferSelectModel<typeof users>;

export const universities = pgTable("universities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  hostedAt: integer("hosted_at").notNull(),
});

export const universityRelations = relations(universities, ({ one, many }) => ({
  hostedAt: one(universities, {
    fields: [universities.hostedAt],
    references: [universities.id],
    relationName: "hosted_universities",
  }),
  users: many(users),
  teams: many(teams),
  hostedUniversities: many(universities, {
    relationName: "hosted_universities",
  }),
  contests: one(contests),
}));

export type University = InferSelectModel<typeof universities>;

export const levelEnum = pgEnum("level", ["A", "B"]);
export const languageExperienceEnum = pgEnum("language_experience", [
  "none",
  "some",
  "prof",
]);

export const studentDetails = pgTable("student_details", {
  userId: uuid("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  studentId: text("student_id").notNull().default(""),
  profilePic: text("profile_picture").notNull().default(""),
  pronouns: text("pronouns").notNull().default(""),
  dietaryRequirements: text("dietary_requirements").notNull().default(""),
  tshirtSize: text("tshirt_size").notNull().default(""),
  team: uuid("team").references(() => teams.id),
  photoConsent: boolean("photo_consent").notNull().default(false),
  level: levelEnum("level").default("B").notNull(),
  contestExperience: integer("contest_experience").default(0).notNull(),
  leetcodeRating: integer("leetcode_rating").default(0).notNull(),
  codeforcesRating: integer("codeforces_rating").default(0).notNull(),
  cppExperience: languageExperienceEnum("cpp_experience")
    .default("none")
    .notNull(),
  cExperience: languageExperienceEnum("c_experience").default("none").notNull(),
  javaExperience: languageExperienceEnum("java_experience")
    .default("none")
    .notNull(),
  pythonExperience: languageExperienceEnum("python_experience")
    .default("none")
    .notNull(),
  exclusions: text("exclusions").default("").notNull(),
  preferences: text("preferences").default("").notNull(),
});

export const studentDetailsRelations = relations(
  studentDetails,
  ({ one, many }) => ({
    coursesCompleted: many(coursesCompletedByStudent),
    languagesSpoken: many(languagesSpokenByStudent),
    user: one(users, {
      fields: [studentDetails.userId],
      references: [users.id],
    }),
    team: one(teams, {
      fields: [studentDetails.team],
      references: [teams.id],
    }),
  }),
);

export type StudentDetails = InferSelectModel<typeof studentDetails>;

export const registrationDetails = pgTable(
  "registration_details",
  {
    student: uuid("student")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    contest: uuid("contest")
      .references(() => contests.id, { onDelete: "cascade" })
      .notNull(),
    timeSubmitted: timestamp("time_submitted").notNull().defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.student, table.contest] }),
    };
  },
);

export type RegistrationDetails = InferSelectModel<typeof registrationDetails>;

export const registrationDetailsRelations = relations(
  registrationDetails,
  ({ one }) => ({
    registeredBy: one(users, {
      fields: [registrationDetails.student],
      references: [users.id],
    }),
    contest: one(contests, {
      fields: [registrationDetails.contest],
      references: [contests.id],
    }),
  }),
);

export const languages = pgTable("languages", {
  code: text("code").primaryKey().notNull(),
  name: text("name").notNull(),
});

export const languagesSpokenRelations = relations(languages, ({ many }) => ({
  spokenBy: many(languagesSpokenByStudent),
}));

export type SpokenLanguage = InferSelectModel<typeof languages>;

export const languagesSpokenByStudent = pgTable(
  "languages_spoken_by_student",
  {
    studentId: uuid("student_id")
      .references(() => studentDetails.userId, { onDelete: "cascade" })
      .notNull(),
    languageCode: text("language_code")
      .references(() => languages.code, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.studentId, table.languageCode] }),
    };
  },
);

export const languagesSpokenByStudentRelations = relations(
  languagesSpokenByStudent,
  ({ one }) => ({
    student: one(studentDetails, {
      fields: [languagesSpokenByStudent.studentId],
      references: [studentDetails.userId],
    }),
    language: one(languages, {
      fields: [languagesSpokenByStudent.languageCode],
      references: [languages.code],
    }),
  }),
);

export const courseTypeEnum = pgEnum("course_type", [
  "Programming Fundamentals",
  "Data Structures and Algorithms",
  "Algorithm Design",
  "Programming Challenges",
]);

export const courses = pgTable("courses", {
  id: serial("id").primaryKey().notNull(),
  type: courseTypeEnum("type").notNull(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
  takenBy: many(coursesCompletedByStudent),
}));

export type Course = InferSelectModel<typeof courses>;

export const coursesCompletedByStudent = pgTable(
  "courses_completed_by_student",
  {
    studentId: uuid("student_id")
      .references(() => studentDetails.userId, { onDelete: "cascade" })
      .notNull(),
    courseId: integer("course_id")
      .references(() => courses.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.studentId, table.courseId] }),
    };
  },
);

export const coursesCompletedByStudentRelations = relations(
  coursesCompletedByStudent,
  ({ one }) => ({
    student: one(studentDetails, {
      fields: [coursesCompletedByStudent.studentId],
      references: [studentDetails.userId],
    }),
    course: one(courses, {
      fields: [coursesCompletedByStudent.courseId],
      references: [courses.id],
    }),
  }),
);

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  university: integer("university")
    .references(() => universities.id)
    .notNull(),
  contest: uuid("contest")
    .references(() => contests.id, {
      onDelete: "cascade",
    })
    .notNull(),
  flagged: boolean("flagged").default(false).notNull(),
});

export const replacements = pgTable("replacements", {
  associated_team: uuid("team_id").references(() => teams.id),
  leavingInternalId: text("leaving_id").notNull().default(""),
  replacementStudentId: text("student_id").notNull().default(""),
  reason: text("reason").notNull().default(""),
});

export const replacementRelations = relations(replacements, ({ one }) => ({
  associated_team: one(teams, {
    fields: [replacements.associated_team],
    references: [teams.id],
  }),
}));

export const teamRelations = relations(teams, ({ many, one }) => ({
  replacements: many(replacements),
  members: many(studentDetails),
  contest: one(contests, {
    fields: [teams.contest],
    references: [contests.id],
  }),
  university: one(universities, {
    fields: [teams.university],
    references: [universities.id],
  }),
}));

export type Team = InferSelectModel<typeof teams>;

export const inviteCodes = pgTable("invite_codes", {
  code: integer("code").notNull(),
  role: integer("role").notNull(),
  createdAt: timestamp("created_at::timestamp without time zone")
    .notNull()
    .defaultNow(),
});

export type InviteCodes = InferSelectModel<typeof inviteCodes>;

export const authCodes = pgTable("auth_codes", {
  code: integer("code").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at::timestamp without time zone")
    .notNull()
    .defaultNow(),
});

export type AuthCodes = InferSelectModel<typeof authCodes>;

export const verifyEmail = pgTable("verify_emails", {
  id: text("id").notNull(),
  code: integer("code").notNull().unique(),
  email: text("email").notNull(),
  userName: text("userName").notNull(),
  isVerified: boolean("verified").default(false).notNull(),
});

export type VerifyEmail = InferSelectModel<typeof verifyEmail>;

export const contests = pgTable("contests", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  earlyBirdDate: date("early_bird_date", { mode: "date" }).notNull(),
  cutoffDate: date("cutoff_date", { mode: "date" }).notNull(),
  contestDate: date("contest_date", { mode: "date" }).notNull(),
  site: integer("university")
    .references(() => universities.id)
    .notNull(),
});

export const contestRelations = relations(contests, ({ one, many }) => ({
  site: one(universities, {
    fields: [contests.site],
    references: [universities.id],
  }),
  registrations: many(registrationDetails),
}));

export type Contest = InferSelectModel<typeof contests>;
