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
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "student",
  "coach",
  "site_coordinator",
  "admin",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  givenName: varchar("given_name", { length: 35 }).notNull(),
  familyName: varchar("family_name", { length: 35 }).notNull(),
  password: varchar("password", { length: 128 }).notNull(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  student: one(students),
  coach: one(coaches),
  siteCoordinator: one(siteCoordinators),
}));

export type User = InferSelectModel<typeof users>;

export const universities = pgTable("universities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  hostedAt: integer("hosted_at"),
});

export const universityRelations = relations(universities, ({ one, many }) => ({
  hostedAt: one(universities, {
    fields: [universities.hostedAt],
    references: [universities.id],
    relationName: "hosted_universities",
  }),
  coaches: many(coaches),
  students: many(students),
  teams: many(teams),
  hostedUniversities: many(universities, {
    relationName: "hosted_universities",
  }),
  siteCoordinator: one(siteCoordinators),
}));

export type University = InferSelectModel<typeof universities>;

export const students = pgTable("students", {
  userId: uuid("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  studentId: text("student_id").notNull(),
  pronouns: text("pronouns"),
  dietaryRequirements: text("dietary_requirements"),
  tshirtSize: text("tshirt_size"),
  team: uuid("team").references(() => teams.id),
  university: integer("university").references(() => universities.id),
});

export const studentRelations = relations(students, ({ one }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  university: one(universities, {
    fields: [students.university],
    references: [universities.id],
  }),
  team: one(teams, {
    fields: [students.team],
    references: [teams.id],
  }),
  registrationDetails: one(registrationDetails),
}));

export type Student = InferSelectModel<typeof students>;

export const levelEnum = pgEnum("level", ["A", "B"]);
export const languageExperienceEnum = pgEnum("language_experience", [
  "none",
  "some",
  "prof",
]);

export const registrationDetails = pgTable("registration_details", {
  student: uuid("id")
    .primaryKey()
    .references(() => students.userId, { onDelete: "cascade" })
    .notNull(),
  level: levelEnum("level").notNull(),
  contestExperience: integer("contest_experience").default(0).notNull(),
  leetcodeRating: integer("leetcode_rating").default(0).notNull(),
  codeforcesRating: integer("codeforces_rating").default(0).notNull(),
  allergies: text("allergies").default("").notNull(),
  photoConsent: boolean("photo_consent").notNull(),
  cppExperience: languageExperienceEnum("cpp_experience").notNull(),
  cExperience: languageExperienceEnum("c_experience").notNull(),
  javaExperience: languageExperienceEnum("java_experience").notNull(),
  pythonExperience: languageExperienceEnum("python_experience").notNull(),
  timeSubmitted: timestamp("time_submitted").notNull().defaultNow(),
});

export type RegistrationDetails = InferSelectModel<typeof registrationDetails>;

export const registrationDetailsRelations = relations(
  registrationDetails,
  ({ many, one }) => ({
    languagesSpoken: many(languagesSpokenByStudent),
    coursesCompleted: many(coursesCompletedByStudent),
    registeredBy: one(students, {
      fields: [registrationDetails.student],
      references: [students.userId],
    }),
  }),
);

export const spokenLanguages = pgTable("spoken_languages", {
  code: text("code").primaryKey().notNull(),
  name: text("name").notNull(),
});

export type SpokenLanguage = InferSelectModel<typeof spokenLanguages>;

export const languagesSpokenByStudent = pgTable(
  "languages_spoken_by_student",
  {
    studentId: uuid("student_id")
      .references(() => registrationDetails.student, { onDelete: "cascade" })
      .notNull(),
    languageCode: text("language_code")
      .references(() => spokenLanguages.code, { onDelete: "cascade" })
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
    student: one(registrationDetails, {
      fields: [languagesSpokenByStudent.studentId],
      references: [registrationDetails.student],
    }),
    language: one(spokenLanguages, {
      fields: [languagesSpokenByStudent.languageCode],
      references: [spokenLanguages.code],
    }),
  }),
);

export const spokenLanguagesRelations = relations(
  spokenLanguages,
  ({ many }) => ({
    spokenBy: many(languagesSpokenByStudent),
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
      .references(() => registrationDetails.student, { onDelete: "cascade" })
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
    student: one(registrationDetails, {
      fields: [coursesCompletedByStudent.studentId],
      references: [registrationDetails.student],
    }),
    course: one(courses, {
      fields: [coursesCompletedByStudent.courseId],
      references: [courses.id],
    }),
  }),
);

export const coaches = pgTable("coaches", {
  userId: uuid("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  university: integer("university")
    .references(() => universities.id)
    .notNull(),
});

export const coachesRelations = relations(coaches, ({ one }) => ({
  user: one(users, { fields: [coaches.userId], references: [users.id] }),
  university: one(universities, {
    fields: [coaches.university],
    references: [universities.id],
  }),
}));

export type Coach = InferSelectModel<typeof coaches>;

export const siteCoordinators = pgTable("site_coordinators", {
  userId: uuid("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  university: integer("university")
    .references(() => universities.id)
    .notNull(),
});

export const siteCoordinatorRelations = relations(
  siteCoordinators,
  ({ one }) => ({
    user: one(users, {
      fields: [siteCoordinators.userId],
      references: [users.id],
    }),
    site: one(universities, {
      fields: [siteCoordinators.university],
      references: [universities.id],
    }),
  }),
);

export type SiteCoordinator = InferSelectModel<typeof siteCoordinators>;

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }),
  university: integer("university").references(() => universities.id),
});

export const teamRelations = relations(teams, ({ many, one }) => ({
  members: many(students),
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
