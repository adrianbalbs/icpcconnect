import request from "supertest";
import express from "express";
import { EmailService } from "../services/index.js";
import { emailRouter } from "../routers/index.js";
import { DatabaseConnection, verifyEmail } from "../db/index.js";
import {
  SendEmailCodeRequest,
  PassVerificationRequest,
} from "../schemas/index.js";
import { beforeAll, afterAll, describe, afterEach, it, expect } from "vitest";
import { setupTestDatabase, dropTestDatabase } from "./db-test-helpers.js";

let db: DatabaseConnection;
let emailApp: ReturnType<typeof express>;

beforeAll(async () => {
  const dbSetup = await setupTestDatabase();
  db = dbSetup.db;
  emailApp = express()
    .use(express.json())
    .use("/api", emailRouter(new EmailService(db)));
});

afterAll(async () => {
  await dropTestDatabase();
});

describe("emailRouter tests", () => {
  afterEach(async () => {
    await db.delete(verifyEmail);
  });

  it("should fail if user provide a non valid email address", async () => {
    const req: SendEmailCodeRequest = {
      email: "wrong@com",
    };

    // It is not a valid email
    await request(emailApp).post("/api/send").send(req).expect(400);
  });

  it("should fail if user provide a non university email address", async () => {
    const req: SendEmailCodeRequest = {
      email: "icpc_test@outlook.com",
    };

    // It is not a valid university email
    const response = await request(emailApp)
      .post("/api/send")
      .send(req)
      .expect(500);

    expect(response.text).toContain(
      "Invalid University Email Address provided.",
    );
  });

  it("should send valid link to a valid email address and user can verify", async () => {
    const req: SendEmailCodeRequest = {
      email: "z5354052@ad.unsw.edu.au",
    };
    const response = await request(emailApp)
      .post("/api/send")
      .send(req)
      .expect(200);

    const actual_key = response.body.codes; // Return is a string of the actual key.

    // Given a wrong key from user will verify fail
    let verify_req: PassVerificationRequest = {
      email: "z5354052@ad.unsw.edu.au",
      userProvidedCode: actual_key + "1",
    };

    let verify_response = await request(emailApp)
      .post("/api/verify")
      .send(verify_req)
      .expect(200);

    expect(verify_response.body.result === false);

    // Given a correct key from user will verify successfully.

    verify_req = {
      email: "z5354052@ad.unsw.edu.au",
      userProvidedCode: actual_key,
    };

    verify_response = await request(emailApp)
      .post("/api/verify")
      .send(verify_req)
      .expect(200);

    expect(verify_response.body.result === true);

    // The verification Code can only be used once. After the successful verification,
    // the old verification code will be invalid and return with Error.
    // To gain a valid verification code, you have to send the request again.

    verify_response = await request(emailApp)
      .post("/api/verify")
      .send(verify_req)
      .expect(500);
  }, 20000);

  it("should fail to verify if verification request not yet sent to email box", async () => {
    // Verification directly will fail. You have to send the verification code to user first.
    const verify_req: PassVerificationRequest = {
      email: "z5354052@ad.unsw.edu.au",
      userProvidedCode: "123456",
    };

    await request(emailApp).post("/api/verify").send(verify_req).expect(500);
  });
});
