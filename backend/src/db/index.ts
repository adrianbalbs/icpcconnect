import Database from "./database";

export type DatabaseInstance = ReturnType<typeof Database.getConnection>;

export * from "./database";
