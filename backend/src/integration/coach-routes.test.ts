import { v4 as uuidv4 } from "uuid";
import request from "supertest";
import express from "express";
import { CoachService } from "../services/index.js";
import { coachRouter } from "../routers/index.js";
import {
  Database,
  DatabaseConnection,
  seed,
  universities,
  users,
} from "../db/index.js";
import { CreateCoachRequest, UpdateCoachRequest } from "../schemas/index.js";

let db: DatabaseConnection;
let app: ReturnType<typeof express>;

beforeAll(async () => {
  db = Database.getConnection();
  await seed(db);
  app = express()
    .use(express.json())
    .use("/api", coachRouter(new CoachService(db)));
});

afterAll(async () => {
  await db.delete(users);
  await db.delete(universities);
  await Database.endConnection();
});

describe("coachRouter tests", () => {
  afterEach(async () => {
    await db.delete(users);
  });

  it("should register a new coach", async () => {});

  it("should get all coaches", async () => {});
  it("should get a coach by id", async () => {});
  it("should throw if a coach cannot be found", async () => {});
  it("should update the coaches details", async () => {});
  it("should remove the coach from the database", async () => {});
  it("should throw when trying to delete a coach that does not exist", async () => {});
});
