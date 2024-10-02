import { InferSelectModel, relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", [
  "student",
  "coach",
  "site_coordinator",
  "admin",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  givenName: varchar("given_name", { length: 35 }).notNull(),
  familyName: varchar("family_name", { length: 35 }).notNull(),
  password: varchar("password", { length: 128 }).notNull(),
  email: text("email").notNull(),
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
  userId: integer("id")
    .primaryKey()
    .references(() => users.id)
    .notNull(),
  studentId: text("student_id").notNull(),
  pronouns: text("pronouns").notNull(),
  team: integer("team").references(() => teams.id),
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
}));

export type Student = InferSelectModel<typeof students>;

export const coaches = pgTable("coaches", {
  userId: integer("id")
    .primaryKey()
    .references(() => users.id)
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
  userId: integer("id")
    .primaryKey()
    .references(() => users.id)
    .notNull(),
  site: integer("site")
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
      fields: [siteCoordinators.site],
      references: [universities.id],
    }),
  }),
);

export type SiteCoordinator = InferSelectModel<typeof siteCoordinators>;

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
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
