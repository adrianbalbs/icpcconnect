import express from "express";
import cors from "cors";
import { DevDatabase, seed } from "./db/index.js";
import {
  CoachService,
  CodesService,
  ContestRegistrationService,
  SiteCoordinatorService,
  StudentService,
  TeamService,
  AuthService,
  AdminService,
} from "./services/index.js";
import {
  coachRouter,
  codesRouter,
  siteCoordinatorRouter,
  studentRouter,
  teamRouter,
  authRouter,
  adminRouter,
} from "./routers/index.js";
import {
  errorHandlerMiddleware,
  loggingMiddlware,
} from "./middleware/index.js";
import { getLogger } from "./utils/logger.js";
import { contestRegistrationRouter } from "./routers/contest-registration-router.js";
import cookieParser from "cookie-parser";
import { AlgorithmService } from "./services/algorithm-service.js";

const logger = getLogger();

logger.info("Setup Express");
const app = express();
const port = process.env.PORT || "3000";

const db = new DevDatabase();
const dbConn = db.getConnection();
await seed(dbConn);

const studentService = new StudentService(dbConn);
const teamService = new TeamService(dbConn);
const coachService = new CoachService(dbConn);
const siteCoordinatorService = new SiteCoordinatorService(dbConn);
const contestRegistrationService = new ContestRegistrationService(dbConn);
const authService = new AuthService(dbConn);
const codesService = new CodesService(dbConn);
const adminService = new AdminService(dbConn);
const algorithmService = new AlgorithmService(dbConn);

logger.info("Setup HTTP Server");
app
  .use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    }),
  )
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(cookieParser())
  .use(loggingMiddlware)
  .use("/api", teamRouter(teamService))
  .use("/api/students", studentRouter(studentService, authService))
  .use("/api/coaches", coachRouter(coachService, authService))
  .use(
    "/api/site-coordinators",
    siteCoordinatorRouter(siteCoordinatorService, authService),
  )
  .use(
    "/api/contest-registration",
    contestRegistrationRouter(contestRegistrationService, authService),
  )
  .use("/api", authRouter(authService))
  .use("/api", codesRouter(codesService, authService))
  .use(
    "/api",
    adminRouter(
      adminService,
      coachService,
      studentService,
      siteCoordinatorService,
      authService,
      algorithmService,
    ),
  )
  .use(errorHandlerMiddleware);

app.listen(port, () => {
  logger.info(`Started up HTTP Server on ${port}`);
});
