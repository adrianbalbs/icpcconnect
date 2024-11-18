import express from "express";
import cors from "cors";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
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
  AlgorithmService,
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
import { userRouter } from "./routers/user-router.js";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { env, isProdEnv } from "./env.js";

const logger = getLogger();

logger.info("Setup Express");
const app = express();
const port = isProdEnv(env) ? env.PORT : 3000;
const frontendUrl = isProdEnv(env) ? env.FRONTEND_URL : "http://localhost:3000";

const db = new DevDatabase();
const dbConn = db.getConnection();

await runMigrations(dbConn);
await seed(dbConn);

const userService = new UserService(dbConn);
const teamService = new TeamService(dbConn, userService);
const authService = new AuthService(dbConn);
const codesService = new CodesService(dbConn);
const adminService = new AdminService(dbConn);
const algorithmService = new AlgorithmService(userService, teamService);
const emailService = new EmailService(dbConn);
const jobQueue = new JobQueue(algorithmService);
const contestService = new ContestService(dbConn, jobQueue);

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/api/admin/queues");
createBullBoard({
  queues: [new BullMQAdapter(jobQueue.queue)],
  serverAdapter,
});

logger.info("Setup HTTP Server");
app
  .use(
    cors({
      origin: frontendUrl,
      credentials: true,
    }),
  )
  .use(express.json({ limit: "10mb" }))
  .use(express.urlencoded({ limit: "10mb", extended: true }))
  .use(cookieParser())
  .use(loggingMiddlware)
  .use("/api/auth", authRouter(authService))
  .use("/api/users", userRouter(userService, authService, codesService))
  .use("/api/teams", teamRouter(teamService, authService))
  .use("/api/email", emailRouter(emailService))
  .use("/api/contests", contestRouter(contestService, authService))
  .use("/api", codesRouter(codesService, authService))
  .use("/api/admin", adminRouter(adminService, authService, algorithmService))
  .use("/api/admin/queues", serverAdapter.getRouter())
  .use(errorHandlerMiddleware);

app.listen(port, () => {
  logger.info(`Started up HTTP Server on ${port}`);
  logger.info(
    `Bull Board is available at http://localhost:${port}/api/admin/queues`,
  );
});
