import request from "supertest";
import express from "express";
import { StudentService } from "../services/index.js";
import { studentRouter } from "../routers/index.js";
import { Database, seed, users } from "../db/index.js";

describe("studentRouter tests", () => {
  const db = Database.getConnection();
  seed(db);
  const app = express().use(
    "/api/students",
    studentRouter(new StudentService(db)),
  );

  afterEach(async () => {
    await db.delete(users);
  });
  it("should get all students", async () => {
    await request(app).get("/api/students/all").expect(200);
  });
});
