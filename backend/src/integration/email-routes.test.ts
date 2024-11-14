import request from "supertest";
import express from "express";
import {
  AuthService,
  CodesService,
  EmailService,
  UserService,
} from "../services/index.js";
import { emailRouter, userRouter } from "../routers/index.js";
import { DatabaseConnection, verifyEmail } from "../db/index.js";
import {
  SendEmailVerificationCodeRequest,
  PassRegisterEmailVerificationRequest,
  SendEmailForgotPasswordCodeRequest,
  PassForgotPasswordVerificationRequest,
  CreateUser,
} from "../schemas/index.js";
import { beforeAll, afterAll, describe, afterEach, it, expect } from "vitest";
import { setupTestDatabase, dropTestDatabase } from "./db-test-helpers.js";

let db: DatabaseConnection;
let app: ReturnType<typeof express>;

beforeAll(async () => {
  const dbSetup = await setupTestDatabase();
  db = dbSetup.db;
  const authService = new AuthService(db);
  const codesService = new CodesService(db);
  app = express()
    .use(express.json())
    .use("/api", emailRouter(new EmailService(db)))
    .use(
      "/api/users",
      userRouter(new UserService(db), authService, codesService),
    );
});

afterAll(async () => {
  await dropTestDatabase();
});

describe("emailRouter tests", () => {
  afterEach(async () => {
    await db.delete(verifyEmail);
  });

  it("should fail if user provide a non valid email address", async () => {
    const req: SendEmailVerificationCodeRequest = {
      email: "wrong@com",
      isNormalVerificationEmail: true,
    };

    // It is not a valid email
    await request(app)
      .post("/api/registVerificationSend")
      .send(req)
      .expect(400);
  });

  it("should fail if user provide a non university email address", async () => {
    const req: SendEmailVerificationCodeRequest = {
      email: "icpc_test@outlook.com",
      isNormalVerificationEmail: true,
    };

    // It is not a valid university email
    const response = await request(app)
      .post("/api/registVerificationSend")
      .send(req)
      .expect(500);

    expect(response.text).toContain(
      "Invalid University Email Address provided.",
    );
  });

  it("should send valid link to a valid email address and user can verify", async () => {
    const req: SendEmailVerificationCodeRequest = {
      email: "z5354052@ad.unsw.edu.au",
      isNormalVerificationEmail: true,
    };
    const response = await request(app)
      .post("/api/registVerificationSend")
      .send(req)
      .expect(200);

    const actual_key = response.body.codes; // Return is a string of the actual key.

    // Given a wrong key from user will verify fail
    let verify_req: PassRegisterEmailVerificationRequest = {
      email: "z5354052@ad.unsw.edu.au",
      userProvidedCode: actual_key + "1",
    };

    let verify_response = await request(app)
      .post("/api/registVerificationVerify")
      .send(verify_req)
      .expect(500);

    // expect(verify_response.body.result === false);

    // Given a correct key from user will verify successfully.

    verify_req = {
      email: "z5354052@ad.unsw.edu.au",
      userProvidedCode: actual_key,
    };

    verify_response = await request(app)
      .post("/api/registVerificationVerify")
      .send(verify_req)
      .expect(200);

    expect(verify_response.body.result === true);

    // The verification Code can only be used once. After the successful verification,
    // the old verification code will be invalid and return with Error.
    // To gain a valid verification code, you have to send the request again.

    verify_response = await request(app)
      .post("/api/registVerificationVerify")
      .send(verify_req)
      .expect(500);
  }, 25000);

  it("should fail to verify if verification request not yet sent to email box", async () => {
    // Verification directly will fail. You have to send the verification code to user first.
    const verify_req: PassRegisterEmailVerificationRequest = {
      email: "z5354052@ad.unsw.edu.au",
      userProvidedCode: "123456",
    };

    await request(app)
      .post("/api/registVerificationVerify")
      .send(verify_req)
      .expect(500);
  });

  // Forgot Password Tests
  it("should register a new student and reset password through resetPassword", async () => {
    const user: CreateUser = {
      givenName: "Delph",
      familyName: "Zhou",
      email: "z5354052@ad.unsw.edu.au",
      password: "securePassword123!",
      role: "Student",
      university: 1,
      studentId: "z5397730",
    };

    const res = await request(app).post("/api/users").send(user).expect(200);

    expect(res.body).toHaveProperty("id");
    const userId = res.body.id;

    const forgotPasswordRequest: SendEmailForgotPasswordCodeRequest = {
      email: "z5354052@ad.unsw.edu.au",
    };

    const sendForgotPasswordResponse = await request(app)
      .post("/api/forgotPasswordSend")
      .send(forgotPasswordRequest)
      .expect(200);
    const actual_key = sendForgotPasswordResponse.body.codes;

    const verifyForgotPasswordRequest: PassForgotPasswordVerificationRequest = {
      id: userId,
      authenticationCode: actual_key,
    };
    const verifyForgotPasswordResponse = await request(app)
      .post("/api/verifyForgotPassword")
      .send(verifyForgotPasswordRequest)
      .expect(200);

    expect(verifyForgotPasswordResponse.body.result === true);
  }, 10000);
});
