/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from "uuid";
import request from "supertest";
import express from "express";
import {
  AdminService,
  CoachService,
  SiteCoordinatorService,
  StudentService,
} from "../services/index.js";
import {
  adminRouter,
  coachRouter,
  siteCoordinatorRouter,
  studentRouter,
} from "../routers/index.js";
import {
  Database,
  DatabaseConnection,
  seed,
  universities,
  users,
} from "../db/index.js";
import {
  CreateAdminRequest,
  CreateCoachRequest,
  CreateSiteCoordinatorRequest,
  CreateStudentRequest,
  UpdateStudentRequest,
} from "../schemas/index.js";

let db: DatabaseConnection;
let adminApp: ReturnType<typeof express>;
let coachApp: ReturnType<typeof express>;
let studentApp: ReturnType<typeof express>;
let siteCoordinatorApp: ReturnType<typeof express>;

beforeAll(async () => {
  db = Database.getConnection();
  await seed(db);
  adminApp = express()
    .use(express.json())
    .use(
      "/api",
      adminRouter(
        new AdminService(db),
        new CoachService(db),
        new StudentService(db),
        new SiteCoordinatorService(db),
      ),
    );
  coachApp = express()
    .use(express.json())
    .use("/api", coachRouter(new CoachService(db)));
  studentApp = express()
    .use(express.json())
    .use("/api", studentRouter(new StudentService(db)));
  siteCoordinatorApp = express()
    .use(express.json())
    .use("/api", siteCoordinatorRouter(new SiteCoordinatorService(db)));
});

afterAll(async () => {
  await db.delete(users);
  await db.delete(universities);
  await Database.endConnection();
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
    const r = await request(coachApp)
      .post("/api/coaches")
      .send(coach)
      .expect(200);
    ids.push(r.body.userId);
  }

  all_request.push(...coaches);

  // Create site coordinators
  const siteCoordinators: CreateSiteCoordinatorRequest[] = [
    {
      role: "site_coordinator",
      givenName: "d2o3jos",
      familyName: "s2ij2qio3",
      email: "s2oi3qj@comp3900.com",
      password: "xio2wqwa",
      university: 1,
      verificationCode: "test",
    },
  ];

  all_request.push(...siteCoordinators);

  for (const siteCoordinator of siteCoordinators) {
    const r = await request(siteCoordinatorApp)
      .post("/api/site-coordinators")
      .send(siteCoordinator)
      .expect(200);
    ids.push(r.body.userId);
  }

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
    const r = await request(studentApp)
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

describe("adminRouter tests", () => {
  afterEach(async () => {
    await db.delete(users);
  });

  it("should register a new admin", async () => {
    const req: CreateAdminRequest = {
      role: "admin",
      givenName: "Yuyun",
      familyName: "Zhou",
      password: "why I'm happy to study computer science",
      email: "hello_word@comp3900.com",
    };
    const response = await request(adminApp)
      .post("/api/admin")
      .send(req)
      .expect(200);

    expect(response.body).toHaveProperty("userId");
  });

  it("should get all users info", async () => {
    const all_request = (await createDifferentUserObjs()).requests;
    const response = await request(adminApp).get("/api/admin").expect(200);
    // The response should be equal to the all_request
    all_request.forEach((expectedUser) => {
      const matchingUser = response.body.users.find(
        (requestedUser: any) =>
          (expectedUser as any).email === requestedUser.email &&
          (expectedUser as any).familyName === requestedUser.familyName &&
          (expectedUser as any).givenName === requestedUser.givenName &&
          (expectedUser as any).role === requestedUser.role,
      );

      expect(matchingUser).toBeDefined();
      expect(matchingUser.id).toBeDefined();
    });
    // Also check length
    expect(response.body.users.length === all_request.length);
  });

  // Although access all user's info in details is unexpected to use, but still write a test however...
  it("should get all users info in details", async () => {
    const all_request = (await createDifferentUserObjs()).requests;
    const response = await request(adminApp)
      .get("/api/admin/details")
      .expect(200);

    // The response should be equal to the all_request
    all_request.forEach((expectedUser) => {
      const matchingUser = response.body.find(
        (requestedUser: any) =>
          (expectedUser as any).email === requestedUser.email &&
          (expectedUser as any).familyName === requestedUser.familyName &&
          (expectedUser as any).givenName === requestedUser.givenName &&
          (expectedUser as any).role === requestedUser.role,
      );

      expect(matchingUser).toBeDefined();
      expect(matchingUser.id).toBeDefined();
    });
    // Also check length
    expect(response.body.length === all_request.length);
    // console.log("Response:", response.body);
    // console.log("Actual:", all_request);
  });

  it("should get any user info in details by id", async () => {
    const created_user_ids = (await createDifferentUserObjs()).ids;
    for (const id of created_user_ids) {
      const response = await request(adminApp)
        .get(`/api/admin/${id}`)
        .expect(200);

      expect(response.body.id).toEqual(id);
    }
  });

  it("should throw if a user cannot be found", async () => {
    await request(adminApp).get(`/api/admin/${uuidv4()}`).expect(500);
  });

  // The admin can change any person's profile, but here I just showcase and test the student case.
  it("should update the students details (even it is an admin server)", async () => {
    const { requests, ids } = await createDifferentUserObjs();

    // The 4th obj of the requsts is student "Yuyun Zhou" with email "qx3d23qw@comp3900.com"
    const fouthObj: any = requests[3];
    const targetId = ids[3];
    expect(fouthObj.email).toEqual("qx3d23qw@comp3900.com");
    expect(fouthObj.givenName).toEqual("Yuyun");
    expect(fouthObj.familyName).toEqual("Zhou");

    // Check that this user is indeed exist and can be found
    const res = await request(adminApp)
      .get(`/api/admin/${targetId}`)
      .expect(200);

    expect(fouthObj.email).toEqual(res.body.email);
    expect(fouthObj.givenName).toEqual(res.body.givenName);
    expect(fouthObj.familyName).toEqual(res.body.familyName);

    // Now try to update this student email and pronouns:
    const new_pronouns = "he/him";
    const new_email = "adrianbalbs@comp3900.com";
    const req: UpdateStudentRequest = {
      ...fouthObj,
      email: new_email,
      pronouns: new_pronouns,
      team: null,
    };

    // update the student
    const result = await request(adminApp)
      .put(`/api/admin/${targetId}`)
      .send(req)
      .expect(200);

    // Update result check
    expect(result.body.email).toEqual(req.email);
    expect(result.body.pronouns).toEqual(req.pronouns);
  });

  // The admin can change any person's profile, but here I just showcase and test the student case.
  it("should remove the admin itself", async () => {
    const req: CreateAdminRequest = {
      role: "admin",
      givenName: "Yuyun",
      familyName: "Zhou",
      password: "why I'm happy to study computer science",
      email: "hello_word@comp3900.com",
    };
    const response = await request(adminApp)
      .post("/api/admin")
      .send(req)
      .expect(200);

    await request(adminApp)
      .get(`/api/admin/${response.body.userId}`)
      .expect(200);
    await request(adminApp)
      .delete(`/api/admin/${response.body.userId}`)
      .expect(200);
    await request(adminApp)
      .get(`/api/admin/${response.body.userId}`)
      .expect(500);
  });

  it("should throw when trying to delete an admin that does not exist", async () => {
    await request(adminApp).delete(`/api/admin/${uuidv4()}`).expect(500);
  });
});
