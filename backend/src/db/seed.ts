import { eq } from "drizzle-orm";
import { UserRole } from "../schemas/user-schema.js";
import { passwordUtils } from "../utils/encrypt.js";
import { getLogger } from "../utils/logger.js";
import { DatabaseConnection } from "./database.js";
import {
  coaches,
  Course,
  courses,
  siteCoordinators,
  spokenLanguages,
  students,
  universities,
  users,
} from "./schema.js";

type UserTable = {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  password: string;
  role: UserRole;
};

type StudentTable = UserTable & {
  university: number;
  team: string | null;
  pronouns: string;
  studentId: string;
};

type CoachTable = UserTable & {
  university: number;
};

type SiteCoordinatorTable = CoachTable;

const addStudent = async (db: DatabaseConnection, student: StudentTable) => {
  const {
    id,
    givenName,
    familyName,
    email,
    password,
    role,
    university,
    team,
    pronouns,
    studentId,
  } = student;

  const newPassword = await passwordUtils().hash(password);
  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existing) {
      const [user] = await tx
        .insert(users)
        .values({
          id,
          givenName,
          familyName,
          email,
          password: newPassword,
          role,
        })
        .returning({ userId: users.id });
      await tx
        .insert(students)
        .values({ userId: user.userId, university, team, pronouns, studentId });
    }
  });
};

const addSiteCoordinator = async (
  db: DatabaseConnection,
  siteCoordinator: SiteCoordinatorTable,
) => {
  const { id, givenName, familyName, email, password, role, university } =
    siteCoordinator;

  const newPassword = await passwordUtils().hash(password);
  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existing) {
      const [user] = await tx
        .insert(users)
        .values({
          id,
          givenName,
          familyName,
          email,
          password: newPassword,
          role,
        })
        .returning({ userId: users.id });
      await tx
        .insert(siteCoordinators)
        .values({ userId: user.userId, university });
    }
  });
};

const addCoach = async (
  db: DatabaseConnection,
  siteCoordinator: CoachTable,
) => {
  const { id, givenName, familyName, email, password, role, university } =
    siteCoordinator;

  const newPassword = await passwordUtils().hash(password);
  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existing) {
      const [user] = await tx
        .insert(users)
        .values({
          id,
          givenName,
          familyName,
          email,
          password: newPassword,
          role,
        })
        .returning({ userId: users.id });
      await tx.insert(coaches).values({ userId: user.userId, university });
    }
  });
};

export const seed = async (db: DatabaseConnection) => {
  const logger = getLogger();
  const data = await import("../../seed-data/seed.json", {
    assert: { type: "json" },
  });
  logger.info("Seeding University and Site information");
  await db
    .insert(universities)
    .values(data.default.universities)
    .onConflictDoNothing();

  logger.info("Seeding Course Information");
  await db
    .insert(courses)
    .values(data.default.courses as Course[])
    .onConflictDoNothing();

  logger.info("Seeding Language Information");
  await db
    .insert(spokenLanguages)
    .values(data.default.spokenLanguages)
    .onConflictDoNothing();

  logger.info("Adding dummy students");
  const students = data.default.students as StudentTable[];
  for (const student of students) {
    await addStudent(db, student);
  }

  logger.info("Adding dummy coaches");
  const coaches = data.default.coaches as CoachTable[];
  for (const coach of coaches) {
    await addCoach(db, coach);
  }

  logger.info("Adding dummy site coordinators");
  const siteCoordinators = data.default
    .siteCoordinators as SiteCoordinatorTable[];
  for (const siteCoordinator of siteCoordinators) {
    await addSiteCoordinator(db, siteCoordinator);
  }

  logger.info("Adding default admin");
  const admins = data.default.admins as UserTable[];
  for (const admin of admins) {
    const { id, givenName, familyName, password, email, role } = admin;
    const newPassword = await passwordUtils().hash(password);
    await db
      .insert(users)
      .values({ id, givenName, familyName, password: newPassword, email, role })
      .onConflictDoNothing();
  }
};

export const seedTest = async (db: DatabaseConnection) => {
  const data = await import("../../seed-data/seed.json", {
    assert: { type: "json" },
  });
  await db
    .insert(universities)
    .values(data.default.universities)
    .onConflictDoNothing();

  await db
    .insert(courses)
    .values(data.default.courses as Course[])
    .onConflictDoNothing();
  await db
    .insert(spokenLanguages)
    .values(data.default.spokenLanguages)
    .onConflictDoNothing();
};
