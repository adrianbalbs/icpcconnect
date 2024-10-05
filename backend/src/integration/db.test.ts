import { Database, DatabaseConnection, universities } from "../db/index.js";

let db: DatabaseConnection;

beforeAll(async () => {
  db = Database.getConnection();
});

afterAll(async () => {
  await db.delete(universities);
  Database.endConnection();
});

describe("Database Tests", () => {
  it("should insert uni", async () => {
    const result = await db
      .insert(universities)
      .values({ name: "UNSW", id: 1 })
      .returning({ name: universities.name });
    expect(result[0].name).toBe("UNSW");
  });

  it("should get uni", async () => {
    const result = await db.select().from(universities);
    expect(result[0].name).toBe("UNSW");
  });
});
