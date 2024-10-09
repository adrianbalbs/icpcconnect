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
import {
    CreateCoachRequest,
    UpdateCoachRequest, 
    LoginRequest,
} from "../schemas/index.js";

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

  it("should register a new coach, have them login, and receive a token", async () => {
    const req1: CreateCoachRequest = {
      role: "coach",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
    };
    const response1 = await request(app)
      .post("/api/coaches")
      .send(req1)
      .expect(200);

    expect(response1.body).toHaveProperty("userId");

    const req2: LoginRequest = {
        email: "adrianbalbs@comp3900.com",
        password: "helloworld"
    }

    const response2 = await request(app)
      .post("/login")
      .send(req2)
      .expect(200);

    expect(response2.body).toHaveProperty("token");
  });
});
