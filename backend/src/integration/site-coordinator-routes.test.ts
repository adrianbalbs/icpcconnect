import { describe, afterEach, beforeAll, afterAll, it, expect } from "vitest";
import { v4 as uuidv4 } from "uuid";
import request from "supertest";
import express from "express";
import { SiteCoordinatorService, StudentService, CoachService} from "../services/index.js";
import { siteCoordinatorRouter, studentRouter, coachRouter } from "../routers/index.js";
import { DatabaseConnection, users } from "../db/index.js";
import {
  CreateSiteCoordinatorRequest,
  UpdateSiteCoordinatorRequest,
  CreateCoachRequest,
  CreateStudentRequest,
} from "../schemas/user-schema.js";
import { errorHandlerMiddleware } from "../middleware/error-handler-middleware.js";
import { dropTestDatabase, setupTestDatabase } from "./db-test-helpers.js";

let db: DatabaseConnection;
let app: ReturnType<typeof express>;

beforeAll(async () => {
  const dbSetup = await setupTestDatabase();
  db = dbSetup.db;
  app = express()
    .use(express.json())
    .use("/api", siteCoordinatorRouter(new SiteCoordinatorService(db)))
    .use("/api", studentRouter(new StudentService(db)))
    .use("/api", coachRouter(new CoachService(db)))
    .use(errorHandlerMiddleware);
});

afterAll(async () => {
  await dropTestDatabase();
});

async function createDifferentUserObjs() {
  const all_request: unknown[] = [];
  const ids: string[] = [];

  // Create coaches
  const coaches: CreateCoachRequest[] = [
    {
      role: "coach",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "s2qd21sqs@comp3900.com",
      password: "dq2w2qw",
      university: 1,
      verificationCode: "test",
    },
    {
      role: "coach",
      givenName: "sqd3",
      familyName: "sdq23",
      email: "d2q3dwd@comp3900.com",
      password: "dq3ddq",
      university: 1,
      verificationCode: "test",
    },
  ];

  for (const coach of coaches) {
    const r = await request(app)
      .post("/api/coaches")
      .send(coach)
      .expect(200);
    ids.push(r.body.userId);
  }

  all_request.push(...coaches);

  // Create students
  const students: CreateStudentRequest[] = [
    {
      role: "student",
      givenName: "Yuyun",
      familyName: "Zhou",
      email: "qx3d23qw@comp3900.com",
      studentId: "z5354057",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    },
    {
      role: "student",
      givenName: "dwe",
      familyName: "dq3was",
      email: "dqwasd3qw@comp3900.com",
      studentId: "z1234567",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    },
  ];

  all_request.push(...students);

  for (const student of students) {
    const r = await request(app)
      .post("/api/students")
      .send(student)
      .expect(200);
    ids.push(r.body.userId);
  }

  return {
    requests: all_request,
    ids: ids,
  };
}


describe("siteCoordinatorRouter tests", () => {
  afterEach(async () => {
    await db.delete(users);
  });

  it("should create a new site-coordinator", async () => {
    const req: CreateSiteCoordinatorRequest = {
      role: "site_coordinator",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const response = await request(app)
      .post("/api/site-coordinators")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("userId");
  });

  it("should get all site-coordinators", async () => {
    const siteCoordinators: CreateSiteCoordinatorRequest[] = [
      {
        role: "site_coordinator",
        givenName: "Adrian",
        familyName: "Balbalosa",
        email: "adrianbalbs@comp3900.com",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
      },
      {
        role: "site_coordinator",
        givenName: "Test",
        familyName: "User",
        email: "testuser@comp3900.com",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
      },
      {
        role: "site_coordinator",
        givenName: "Test",
        familyName: "User2",
        email: "testuser2@comp3900.com",
        password: "helloworld",
        university: 1,
        verificationCode: "test",
      },
    ];

    for (const siteCoordinator of siteCoordinators) {
      await request(app)
        .post("/api/site-coordinators")
        .send(siteCoordinator)
        .expect(200);
    }

    const response = await request(app)
      .get("/api/site-coordinators")
      .expect(200);
    expect(response.body.siteCoordinators.length).toEqual(
      siteCoordinators.length,
    );
  });

  it("should get a site-coordinator by id", async () => {
    const req: CreateSiteCoordinatorRequest = {
      role: "site_coordinator",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const user = await request(app)
      .post("/api/site-coordinators")
      .send(req)
      .expect(200);
    const { userId } = user.body;

    const response = await request(app)
      .get(`/api/site-coordinators/${userId}`)
      .expect(200);

    expect(response.body.id).toEqual(userId);
    expect(response.body.managedUniversities.length).toEqual(4);
  });

  it("should throw if a site-coordinator cannot be found", async () => {
    await request(app).get(`/api/site-coordinators/${uuidv4()}`).expect(404);
  });

  it("should update the site-coordinator's details", async () => {
    const newSiteCoordinator: CreateSiteCoordinatorRequest = {
      role: "site_coordinator",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const res = await request(app)
      .post("/api/site-coordinators")
      .send(newSiteCoordinator)
      .expect(200);

    await request(app)
      .get(`/api/site-coordinators/${res.body.userId}`)
      .expect(200);

    const req: UpdateSiteCoordinatorRequest = {
      ...newSiteCoordinator,
      email: "newemail@comp3900.com",
    };

    const result = await request(app)
      .put(`/api/site-coordinators/${res.body.userId}`)
      .send(req)
      .expect(200);
    expect(result.body.email).toEqual(req.email);
  });

  it("should remove the site-coordinator from the database", async () => {
    const newSiteCoordinator: CreateSiteCoordinatorRequest = {
      role: "site_coordinator",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const res = await request(app)
      .post("/api/site-coordinators")
      .send(newSiteCoordinator)
      .expect(200);

    await request(app)
      .get(`/api/site-coordinators/${res.body.userId}`)
      .expect(200);
    await request(app)
      .delete(`/api/site-coordinators/${res.body.userId}`)
      .expect(200);

    await request(app)
      .get(`/api/site-coordinators/${res.body.userId}`)
      .expect(404);
  });

  it("should throw when trying to delete a site coordinator that does not exist", async () => {
    await request(app).delete(`/api/site-coordinators/${uuidv4()}`).expect(400);
  });

  it("Admins should be able to get everyones emails", async () => {
    const { requests, ids } = await createDifferentUserObjs();
    const studentEmails = requests.filter((r) => r.role == "student").map((r) => r.email);
    const coachEmails = requests.filter((r) => r.role == "coach").map((r) => r.email);

    const req: CreateSiteCoordinatorRequest = {
      role: "site_coordinator",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      university: 1,
      verificationCode: "test",
    };
    const res = await request(app)
      .post("/api/site-coordinators")
      .send(req)
      .expect(200);
    const {userId} = res.body;
  
    {
      let res = await request(app)
        .get(`/api/site-coordinators/${userId}/getEmails/student`)
        .expect(200);

      const { emails } = res.body;
      const emailsSplit = emails.split(";");

      for (const email of studentEmails) {
        expect(emailsSplit).toContain(email);
      }
    }
    {
      let res = await request(app)
        .get(`/api/site-coordinators/${userId}/getEmails/coach`)
        .expect(200);

      const { emails } = res.body;
      const emailsSplit = emails.split(";");

      for (const email of coachEmails) {
        expect(emailsSplit).toContain(email);
      }
    }
  });
});
