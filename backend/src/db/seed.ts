import { eq } from "drizzle-orm";
import { LanguageExperience, Level, UserRole } from "../schemas/user-schema.js";
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
  coursesCompletedByStudent,
  registrationDetails,
} from "./schema.js";
import {
  AlgorithmService,
  JobQueue,
  TeamService,
  UserService,
} from "../services/index.js";
import { env } from "../env.js";
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
  profilePic: string;
  photoConsent: boolean;
  languagesSpoken: SpokenLanguage[];
  level: Level;
  contestExperience: number;
  leetcodeRating: number;
  codeforcesRating: number;
  cppExperience: LanguageExperience;
  cExperience: LanguageExperience;
  javaExperience: LanguageExperience;
  pythonExperience: LanguageExperience;
  coursesTaken: number[];
  preferences: string;
};

const addStudent = async (
  db: DatabaseConnection,
  student: StudentTable,
  contestId: string,
) => {
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
    profilePic,
    photoConsent,
    languagesSpoken,
    level,
    contestExperience,
    leetcodeRating,
    codeforcesRating,
    cppExperience,
    cExperience,
    javaExperience,
    pythonExperience,
    coursesTaken,
    preferences,
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
        profilePic,
        level,
        contestExperience,
        codeforcesRating,
        leetcodeRating,
        cppExperience,
        cExperience,
        javaExperience,
        pythonExperience,
        preferences,
      });
      for (const languageCode of languagesSpoken) {
        await tx
          .insert(languagesSpokenByStudent)
          .values({ studentId: user.userId, languageCode });
      }

      for (const courseId of coursesTaken) {
        await tx
          .insert(coursesCompletedByStudent)
          .values({ studentId: id, courseId });
      }

      await tx
        .insert(registrationDetails)
        .values({ student: id, contest: contestId });
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

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const contestDate = new Date();
  contestDate.setDate(contestDate.getDate() + 3);

  logger.info("Seeding contests");
  const allContests = data.default.contests;
  const userService = new UserService(db);
  const jobQueue = new JobQueue(
    new AlgorithmService(userService, new TeamService(db, userService)),
  );
  for (const contest of allContests) {
    const { id, name, site } = contest;
    await db
      .insert(contests)
      .values({
        id,
        name,
        site,
        earlyBirdDate: tomorrow,
        cutoffDate: dayAfterTomorrow,
        contestDate: contestDate,
      })
      .onConflictDoNothing();
    jobQueue.addJob(id, tomorrow, dayAfterTomorrow);
  }

  const defaultContestName = "ICPC Preliminary Contest";
  const [contest] = await db
    .select({ id: contests.id })
    .from(contests)
    .where(eq(contests.name, defaultContestName));

  logger.info("Adding dummy students");
  const students = data.default.students as StudentTable[];
  for (const student of students) {
    await addStudent(db, student, contest.id);
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

  logger.info("Adding default admin");
  const newPassword = await passwordUtils().hash(env.ADMIN_PASSWORD);
  await db.delete(users).where(eq(users.role, "Admin"));
  const [{ id }] = await db
    .insert(users)
    .values({
      givenName: "Admin",
      familyName: "User",
      email: env.ADMIN_EMAIL,
      password: newPassword,
      role: "Admin",
      university: 0,
    })
    .returning({ id: users.id })
    .onConflictDoNothing();
  await db.insert(studentDetails).values({ userId: id }).onConflictDoNothing();
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

  const newPassword = await passwordUtils().hash(env.ADMIN_PASSWORD);
  await db.delete(users).where(eq(users.role, "Admin"));
  const [{ id }] = await db
    .insert(users)
    .values({
      givenName: "Admin",
      familyName: "User",
      email: env.ADMIN_EMAIL,
      password: newPassword,
      role: "Admin",
      university: 0,
    })
    .returning({ id: users.id })
    .onConflictDoNothing();
  await db.insert(studentDetails).values({ userId: id }).onConflictDoNothing();
};
