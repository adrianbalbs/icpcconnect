import { getLogger } from "../utils/logger.js";
import { DatabaseConnection } from "./database.js";
import { universities } from "./schema.js";

export const seed = async (db: DatabaseConnection) => {
  const logger = getLogger();

  logger.info("Seeding University and Site information");
  await db
    .insert(universities)
    .values([
      { name: "University of New South Wales", id: 1, hostedAt: 1 },
      { name: "University of Sydney", id: 2, hostedAt: 1 },
      { name: "University of Technology Sydney", id: 3, hostedAt: 1 },
      { name: "Macquarie University", id: 4, hostedAt: 1 },
    ])
    .onConflictDoNothing();
};
