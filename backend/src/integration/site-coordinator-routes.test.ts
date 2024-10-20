import {
  describe,
  afterEach,
  beforeAll,
  afterAll,
  it,
  expect,
  beforeEach,
} from "vitest";
import { v4 as uuidv4 } from "uuid";
import request from "supertest";
import express from "express";
import { AuthService, SiteCoordinatorService } from "../services/index.js";
import { authRouter, siteCoordinatorRouter } from "../routers/index.js";
import { DatabaseConnection, users } from "../db/index.js";
import {
  CreateSiteCoordinatorRequest,
  UpdateSiteCoordinatorRequest,
} from "../schemas/user-schema.js";
import { errorHandlerMiddleware } from "../middleware/error-handler-middleware.js";
import { dropTestDatabase, setupTestDatabase } from "./db-test-helpers.js";
import cookieParser from "cookie-parser";
import { eq, not } from "drizzle-orm";

describe("siteCoordinatorRouter tests", () => {
  let db: DatabaseConnection;
  let app: ReturnType<typeof express>;
  let cookies: string;

  beforeAll(async () => {
    const dbSetup = await setupTestDatabase();
    db = dbSetup.db;
    const authService = new AuthService(db);
    app = express()
      .use(express.json())
      .use(cookieParser())
      .use("/api", authRouter(authService))
      .use(
        "/api/site-coordinators",
        siteCoordinatorRouter(new SiteCoordinatorService(db), authService),
      )
      .use(errorHandlerMiddleware);
  });

  beforeEach(async () => {
    const loginRes = await request(app)
      .post("/api/login")
      .send({
        email: "admin@comp3900.com",
        password: "tomatofactory",
      })
      .expect(200);
    cookies = loginRes.headers["set-cookie"];
  });

  afterEach(async () => {
    await db.delete(users).where(not(eq(users.email, "admin@comp3900.com")));
  });

  afterAll(async () => {
    await dropTestDatabase();
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
      .set("Cookie", cookies)
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
      .set("Cookie", cookies)
      .expect(200);

    expect(response.body.id).toEqual(userId);
    expect(response.body.managedUniversities.length).toEqual(4);
  });

  it("should throw if a site-coordinator cannot be found", async () => {
    await request(app)
      .get(`/api/site-coordinators/${uuidv4()}`)
      .set("Cookie", cookies)
      .expect(404);
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
      .set("Cookie", cookies)
      .expect(200);

    const req: UpdateSiteCoordinatorRequest = {
      email: "newemail@comp3900.com",
    };

    const result = await request(app)
      .put(`/api/site-coordinators/${res.body.userId}`)
      .set("Cookie", cookies)
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
      .set("Cookie", cookies)
      .expect(200);
    await request(app)
      .delete(`/api/site-coordinators/${res.body.userId}`)
      .set("Cookie", cookies)
      .expect(200);

    await request(app)
      .get(`/api/site-coordinators/${res.body.userId}`)
      .set("Cookie", cookies)
      .expect(404);
  });

  it("should throw when trying to delete a site coordinator that does not exist", async () => {
    await request(app)
      .delete(`/api/site-coordinators/${uuidv4()}`)
      .set("Cookie", cookies)
      .expect(400);
  });
});
