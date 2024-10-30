import express from "express";
import cors from "cors";
import { Database, seed } from "./db/index.js";
import {
  CoachService,
  CodesService,
  ContestRegistrationService,
  SiteCoordinatorService,
  StudentService,
  TeamService,
  AuthService,
  AdminService,
  EmailService,
} from "./services/index.js";
import {
  coachRouter,
  codesRouter,
  siteCoordinatorRouter,
  studentRouter,
  teamRouter,
  authRouter,
  adminRouter,
  emailRouter,
} from "./routers/index.js";
import {
  errorHandlerMiddleware,
  loggingMiddlware,
} from "./middleware/index.js";
import { getLogger } from "./utils/logger.js";
import { contestRegistrationRouter } from "./routers/contest-registration-router.js";
import { AlgorithmService } from "./services/algorithm-service.js";

const logger = getLogger();

logger.info("Setup Express");
const app = express();
const port = process.env.PORT || "3000";

const databaseConnection = Database.getConnection();
await seed(databaseConnection);

const studentService = new StudentService(databaseConnection);
const teamService = new TeamService(databaseConnection);
const coachService = new CoachService(databaseConnection);
const siteCoordinatorService = new SiteCoordinatorService(databaseConnection);
const contestRegistrationService = new ContestRegistrationService(
  databaseConnection,
);
const authService = new AuthService(databaseConnection);
const codesService = new CodesService(databaseConnection);
const adminService = new AdminService(databaseConnection);
const algorithmService = new AlgorithmService(databaseConnection);
const emailService = new EmailService(databaseConnection);

logger.info("Setup HTTP Server");
app
  .use(cors())
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(loggingMiddlware)
  .use("/api", teamRouter(teamService))
  .use("/api", studentRouter(studentService))
  .use("/", coachRouter(coachService))
  .use("/api", siteCoordinatorRouter(siteCoordinatorService))
  .use("/api", contestRegistrationRouter(contestRegistrationService))
  .use("/api", authRouter(authService))
  .use("/api", codesRouter(codesService))
  .use(
    "/api",
    adminRouter(
      adminService,
      coachService,
      studentService,
      siteCoordinatorService,
      algorithmService
    ),
  )
  .use("/api", emailRouter(emailService))
  .use(errorHandlerMiddleware);

app.listen(port, () => {
  logger.info(`Started up HTTP Server on ${port}`);
});
