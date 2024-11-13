import express from "express";
import cors from "cors";
import { DevDatabase, runMigrations, seed } from "./db/index.js";
import {
  CodesService,
  TeamService,
  AuthService,
  AdminService,
  ContestService,
  UserService,
  EmailService,
  JobQueue,
} from "./services/index.js";
import {
  codesRouter,
  teamRouter,
  authRouter,
  adminRouter,
  contestRouter,
  emailRouter,
} from "./routers/index.js";
import {
  errorHandlerMiddleware,
  loggingMiddlware,
} from "./middleware/index.js";
import { getLogger } from "./utils/logger.js";
import cookieParser from "cookie-parser";
import { AlgorithmService } from "./services/algorithm-service.js";
import { userRouter } from "./routers/user-router.js";

const logger = getLogger();

logger.info("Setup Express");
const app = express();
const port = process.env.PORT || "3000";

const db = new DevDatabase();
const dbConn = db.getConnection();

await runMigrations(dbConn);
await seed(dbConn);

const userService = new UserService(dbConn);
const teamService = new TeamService(dbConn);
const authService = new AuthService(dbConn);
const codesService = new CodesService(dbConn);
const adminService = new AdminService(dbConn);
const algorithmService = new AlgorithmService(dbConn);
const emailService = new EmailService(dbConn);
const jobQueue = new JobQueue(algorithmService);
const contestService = new ContestService(dbConn, jobQueue);

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
  .use("/api/auth", authRouter(authService))
  .use("/api/users", userRouter(userService, authService, codesService))
  .use("/api/teams", teamRouter(teamService, authService))
  .use("/api/email", emailRouter(emailService))
  .use("/api/contests", contestRouter(contestService, authService))
  .use("/api", codesRouter(codesService, authService))
  .use("/api", adminRouter(adminService, authService, algorithmService))
  .use(errorHandlerMiddleware);

app.listen(port, () => {
  logger.info(`Started up HTTP Server on ${port}`);
});
