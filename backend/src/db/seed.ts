import { eq } from "drizzle-orm";
import { UserRole } from "../schemas/user-schema.js";
import { passwordUtils } from "../utils/encrypt.js";
import { getLogger } from "../utils/logger.js";
import { DatabaseConnection } from "./database.js";
import { SpokenLanguage } from "../schemas/user-schema.js";
import {
  Course,
  courses,
  languages,
  studentDetails,
  universities,
  users,
  languagesSpokenByStudent,
  contests,
  teams,
} from "./schema.js";

type UserTable = {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  password: string;
  role: UserRole;
  university: number;
};

type StudentTable = UserTable & {
  team: string | null;
  pronouns: string;
  studentId: string;
  profile_pic: string,
  photoConsent: boolean;
  languagesSpoken: SpokenLanguage[];
};

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
    profile_pic,
    photoConsent,
    languagesSpoken,
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
          university,
          role,
        })
        .returning({ userId: users.id });
      await tx.insert(studentDetails).values({
        userId: user.userId,
        team,
        pronouns,
        studentId,
        photoConsent,
        profile_pic,
      });
      for (const languageCode of languagesSpoken) {
        await tx
          .insert(languagesSpokenByStudent)
          .values({ studentId: user.userId, languageCode });
      }
    }
  });
};

const addSiteCoordinator = async (
  db: DatabaseConnection,
  siteCoordinator: UserTable,
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
          university,
          password: newPassword,
          role,
        })
        .returning({ userId: users.id });
      await tx.insert(studentDetails).values({ userId: user.userId });
    }
  });
};

const addCoach = async (db: DatabaseConnection, siteCoordinator: UserTable) => {
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
          university,
          role,
        })
        .returning({ userId: users.id });
      await tx.insert(studentDetails).values({ userId: user.userId });
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
    .insert(languages)
    .values(data.default.languagesSpoken)
    .onConflictDoNothing();

  logger.info("Adding dummy students");
  const students = data.default.students as StudentTable[];
  for (const student of students) {
    await addStudent(db, student);
  }

  logger.info("Adding dummy coaches");
  const coaches = data.default.coaches as UserTable[];
  for (const coach of coaches) {
    await addCoach(db, coach);
  }

  logger.info("Adding dummy site coordinators");
  const siteCoordinators = data.default.siteCoordinators as UserTable[];
  for (const siteCoordinator of siteCoordinators) {
    await addSiteCoordinator(db, siteCoordinator);
  }
  
  logger.info("Seeding Team Information");
  await db
    .insert(teams)
    .values(data.default.teams)
    .onConflictDoNothing();

  logger.info("Seeding contests");
  const allContests = data.default.contests;
  for (const contest of allContests) {
    const { name, site, id } = contest;
    await db
      .insert(contests)
      .values({
        id,
        name,
        site,
        earlyBirdDate: new Date(),
        cutoffDate: new Date(),
        contestDate: new Date(),
      })
      .onConflictDoNothing();
  }

  logger.info("Adding default admin");
  const admins = data.default.admins as UserTable[];
  for (const admin of admins) {
    const { id, givenName, familyName, password, email, role, university } =
      admin;
    const newPassword = await passwordUtils().hash(password);
    await db
      .insert(users)
      .values({
        id,
        givenName,
        familyName,
        password: newPassword,
        email,
        role,
        university,
      })
      .onConflictDoNothing();
    await db
      .insert(studentDetails)
      .values({ userId: id })
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
    .insert(languages)
    .values(data.default.languagesSpoken)
    .onConflictDoNothing();

  const admins = data.default.admins as UserTable[];
  for (const admin of admins) {
    const { id, givenName, familyName, password, email, role, university } =
      admin;
    const newPassword = await passwordUtils().hash(password);
    await db
      .insert(users)
      .values({
        id,
        givenName,
        familyName,
        password: newPassword,
        email,
        role,
        university,
      })
      .onConflictDoNothing();
    await db
      .insert(studentDetails)
      .values({ userId: id })
      .onConflictDoNothing();
  }
};
