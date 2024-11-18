import request from "supertest";
import express from "express";
import { DatabaseConnection, authCodes, inviteCodes } from "../db/index.js";
import { role } from "../utils/createcode.js";
import { authRouter, codesRouter } from "../routers/index.js";
import { AuthService, CodesService } from "../services/index.js";
import {
  beforeAll,
  afterAll,
  describe,
  afterEach,
  it,
  expect,
  beforeEach,
} from "vitest";
import { setupTestDatabase, dropTestDatabase } from "./db-test-helpers.js";
import cookieParser from "cookie-parser";
import { env } from "../env.js";

describe("contestRegistrationRouter tests", () => {
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
      .use("/api/auth", authRouter(authService))
      .use("/api", codesRouter(new CodesService(db), authService));
  });

  beforeEach(async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
      })
      .expect(200);
    cookies = loginRes.headers["set-cookie"];
  });

  afterEach(async () => {
    await db.delete(authCodes);
    await db.delete(inviteCodes);
  });

  afterAll(async () => {
    await dropTestDatabase();
  });

  it("should create a new coach code, return that code, and have it be in the db", async () => {
    const res = await request(app)
      .get("/api/newCoachCode")
      .set("Cookie", cookies)
      .expect(200);

    expect(res.body.code).not.toBeNull();
    expect(res.body.code > 1000000);
    expect(res.body.code < 9999999);

    const res2 = await request(app)
      .get("/api/allRoleCodes")
      .set("Cookie", cookies)
      .expect(200);

    expect(res2.body).not.toBeNull();
    expect(res2.body[0].role).toEqual(role.coach);
    expect(res2.body[0].code).toEqual(res.body.code);
  });

  it("should create a new coach code, return that code, and have it be in the db, check that it is verified", async () => {
    const res = await request(app)
      .get("/api/newCoachCode")
      .set("Cookie", cookies)
      .expect(200);

    expect(res.body.code).not.toBeNull();
    expect(res.body.code > 1000000);
    expect(res.body.code < 9999999);

    const res2 = await request(app)
      .get("/api/allRoleCodes")
      .set("Cookie", cookies)
      .expect(200);

    expect(res2.body).not.toBeNull();
    expect(res2.body[0].role).toEqual(role.coach);
    expect(res2.body[0].code).toEqual(res.body.code);
  });

  it("should create a new site-coord code, return that code, and have it be in the db", async () => {
    const res = await request(app)
      .get("/api/newSiteCoordCode")
      .set("Cookie", cookies)
      .expect(200);

    expect(res.body.code).not.toBeNull();
    expect(res.body.code > 1000000);
    expect(res.body.code < 9999999);

    const res2 = await request(app)
      .get("/api/allRoleCodes")
      .set("Cookie", cookies)
      .expect(200);

    expect(res2.body).not.toBeNull();
    expect(res2.body[0].role).toEqual(role.site_coord);
    expect(res2.body[0].code).toEqual(res.body.code);
  });

  it("should create a new auth code, return that code, and have it be in the db", async () => {
    const newAuthCodeReq = {
      email: "jerryyang@comp3900.com",
    };
    const res = await request(app)
      .post("/api/newAuthCode")
      .set("Cookie", cookies)
      .send(newAuthCodeReq)
      .expect(200);

    expect(res.body.code).not.toBeNull();
    expect(res.body.code > 1000000);
    expect(res.body.code < 9999999);

    const res2 = await request(app)
      .get("/api/allAuthCodes")
      .set("Cookie", cookies)
      .expect(200);

    expect(res2.body).not.toBeNull();
    expect(res2.body[0].email).toEqual("jerryyang@comp3900.com");
    expect(res2.body[0].code).toEqual(res.body.code);
  });

  it("should create a new coach code and site coord code, return both codes, and have them be in the db", async () => {
    const res = await request(app)
      .get("/api/newCoachCode")
      .set("Cookie", cookies)
      .expect(200);

    expect(res.body.code).not.toBeNull();
    expect(res.body.code > 1000000);
    expect(res.body.code < 9999999);

    const res2 = await request(app)
      .get("/api/newSiteCoordCode")
      .set("Cookie", cookies)
      .expect(200);

    expect(res2.body.code).not.toBeNull();
    expect(res2.body.code > 1000000);
    expect(res2.body.code < 9999999);

    const res3 = await request(app)
      .get("/api/allRoleCodes")
      .set("Cookie", cookies)
      .expect(200);

    expect(res3.body).not.toBeNull();
    expect(res3.body[0].role).toEqual(role.coach);
    expect(res3.body[0].code).toEqual(res.body.code);
    expect(res3.body[1].role).toEqual(role.site_coord);
    expect(res3.body[1].code).toEqual(res2.body.code);
  });

  it("should create two auth codes, return both code, and have them be in the db", async () => {
    const newAuthCodeReq = {
      email: "jerryyang@comp3900.com",
    };
    const res = await request(app)
      .post("/api/newAuthCode")
      .set("Cookie", cookies)
      .send(newAuthCodeReq)
      .expect(200);

    expect(res.body.code).not.toBeNull();
    expect(res.body.code > 1000000);
    expect(res.body.code < 9999999);

    const newAuthCodeReq2 = {
      email: "adrianbarb@comp3900.com",
    };
    const res2 = await request(app)
      .post("/api/newAuthCode")
      .set("Cookie", cookies)
      .send(newAuthCodeReq2)
      .expect(200);

    expect(res2.body.code).not.toBeNull();
    expect(res2.body.code > 1000000);
    expect(res2.body.code < 9999999);

    const res3 = await request(app)
      .get("/api/allAuthCodes")
      .set("Cookie", cookies)
      .expect(200);

    expect(res3.body).not.toBeNull();
    expect(res3.body[0].email).toEqual("jerryyang@comp3900.com");
    expect(res3.body[0].code).toEqual(res.body.code);
    expect(res3.body[1].email).toEqual("adrianbarb@comp3900.com");
    expect(res3.body[1].code).toEqual(res2.body.code);
  });
});
