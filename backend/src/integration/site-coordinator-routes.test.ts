import { v4 as uuidv4 } from "uuid";
import request from "supertest";
import express from "express";
import { SiteCoordinatorService } from "../services/index.js";
import { siteCoordinatorRouter } from "../routers/index.js";
import {
  Database,
  DatabaseConnection,
  seed,
  universities,
  users,
} from "../db/index.js";
import {
  CreateSiteCoordinatorRequest,
  UpdateSiteCoordinatorRequest,
} from "../schemas/user-schema.js";

let db: DatabaseConnection;
let app: ReturnType<typeof express>;

beforeAll(async () => {
  db = Database.getConnection();
  await seed(db);
  app = express()
    .use(express.json())
    .use("/api", siteCoordinatorRouter(new SiteCoordinatorService(db)));
});

afterAll(async () => {
  await db.delete(users);
  await db.delete(universities);
  await Database.endConnection();
});

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
      site: 1,
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
        site: 1,
      },
      {
        role: "site_coordinator",
        givenName: "Test",
        familyName: "User",
        email: "testuser@comp3900.com",
        password: "helloworld",
        site: 1,
      },
      {
        role: "site_coordinator",
        givenName: "Test",
        familyName: "User2",
        email: "testuser2@comp3900.com",
        password: "helloworld",
        site: 1,
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
      site: 1,
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
    await request(app).get(`/api/site-coordinators/${uuidv4()}`).expect(500);
  });

  it("should update the site-coordinator's details", async () => {
    const newSiteCoordinator: CreateSiteCoordinatorRequest = {
      role: "site_coordinator",
      givenName: "Adrian",
      familyName: "Balbalosa",
      email: "adrianbalbs@comp3900.com",
      password: "helloworld",
      site: 1,
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
      site: 1,
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
      .expect(500);
  });

  it("should throw when trying to delete a site coordinator that does not exist", async () => {
    await request(app).delete(`/api/site-coordinators/${uuidv4()}`).expect(500);
  });
});
