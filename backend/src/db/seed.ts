import { UserRole } from "../schemas/user-schema.js";
import { passwordUtils } from "../utils/encrypt.js";
import { getLogger } from "../utils/logger.js";
import { DatabaseConnection } from "./database.js";
import { SpokenLanguage } from "../schemas/user-schema.js";
import {
  coaches,
  Course,
  courses,
  siteCoordinators,
  spokenLanguages,
  students,
  universities,
  users,
  languagesSpokenByStudent,
} from "./schema.js";

type UserTable = {
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
  photoConsent: boolean,
  languagesSpoken: SpokenLanguage[],
};

type CoachTable = UserTable & {
  university: number;
};

type SiteCoordinatorTable = CoachTable;

const addStudent = async (db: DatabaseConnection, student: StudentTable) => {
  const {
    givenName,
    familyName,
    email,
    password,
    role,
    university,
    team,
    pronouns,
    studentId,
    photoConsent,
    languagesSpoken,
  } = student;

  const newPassword = await passwordUtils().hash(password);
  await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ givenName, familyName, email, password: newPassword, role })
      .returning({ userId: users.id })
      .onConflictDoNothing();
    await tx
      .insert(students)
      .values({ userId: user.userId, university, team, pronouns, studentId, photoConsent })
      .onConflictDoNothing();
    for (const languageCode of languagesSpoken) {
      await tx
        .insert(languagesSpokenByStudent)
        .values({ studentId: user.userId, languageCode });
     }
  });
};

const addSiteCoordinator = async (
  db: DatabaseConnection,
  siteCoordinator: SiteCoordinatorTable,
) => {
  const { givenName, familyName, email, password, role, university } =
    siteCoordinator;

  const newPassword = await passwordUtils().hash(password);
  await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ givenName, familyName, email, password: newPassword, role })
      .returning({ userId: users.id })
      .onConflictDoNothing();
    await tx
      .insert(siteCoordinators)
      .values({ userId: user.userId, university })
      .onConflictDoNothing();
  });
};

const addCoach = async (
  db: DatabaseConnection,
  siteCoordinator: CoachTable,
) => {
  const { givenName, familyName, email, password, role, university } =
    siteCoordinator;

  const newPassword = await passwordUtils().hash(password);
  await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ givenName, familyName, email, password: newPassword, role })
      .returning({ userId: users.id })
      .onConflictDoNothing();
    await tx
      .insert(coaches)
      .values({ userId: user.userId, university })
      .onConflictDoNothing();
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
    await db.insert(users).values(admin).onConflictDoNothing();
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
