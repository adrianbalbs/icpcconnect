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

  it("should register a new coach", async () => {
    const req: CreateCoachRequest = {
      role: "coach",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const response = await request(app)
      .post("/api/coaches")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("userId");
  });

  it("should get all coaches", async () => {
    const coaches: CreateCoachRequest[] = [
      {
        role: "coach",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
      },
      {
        role: "coach",
        givenName: "Test",
        familyName: "User",
        email: "testuser@comp3900.com",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
      },
      {
        role: "coach",
        givenName: "Test",
        familyName: "User2",
        email: "testuser2@comp3900.com",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
      },
    ];

    for (const coach of coaches) {
      await request(app).post("/api/coaches").send(coach).expect(200);
    }

    const response = await request(app).get("/api/coaches").expect(200);
    expect(response.body.coaches.length).toEqual(coaches.length);
  });

  it("should get a coach by id", async () => {
    const req: CreateCoachRequest = {
      role: "coach",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const user = await request(app).post("/api/coaches").send(req).expect(200);

    const { userId } = user.body;

    const response = await request(app)
      .get(`/api/coaches/${userId}`)
      .expect(200);

    expect(response.body.id).toEqual(userId);
  });

  it("should throw if a coach cannot be found", async () => {
    await request(app).get(`/api/coaches/${uuidv4()}`).expect(500);
  });

  it("should update the coaches details", async () => {
    const newCoach: CreateCoachRequest = {
      role: "coach",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const res = await request(app)
      .post("/api/coaches")
      .send(newCoach)
      .expect(200);

    await request(app).get(`/api/coaches/${res.body.userId}`).expect(200);

    const req: UpdateCoachRequest = {
      ...newCoach,
      email: "newemail@comp3900.com",
    };

    const result = await request(app)
      .put(`/api/coaches/${res.body.userId}`)
      .send(req)
      .expect(200);
    expect(result.body.email).toEqual(req.email);
  });

  it("should remove the coach from the database", async () => {
    const newCoach: CreateCoachRequest = {
      role: "coach",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const res = await request(app)
      .post("/api/coaches")
      .send(newCoach)
      .expect(200);

    await request(app).get(`/api/coaches/${res.body.userId}`).expect(200);
    await request(app).delete(`/api/coaches/${res.body.userId}`).expect(200);

    await request(app).get(`/api/coaches/${res.body.userId}`).expect(500);
  });

  it("should throw when trying to delete a coach that does not exist", async () => {
    await request(app).delete(`/api/coaches/${uuidv4()}`).expect(500);
  });
});
