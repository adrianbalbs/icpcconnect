import express from "express";
import cors from "cors";
import { Database, seed } from "./db/index.js";
import {
  CoachService,
  ContestRegistrationService,
  SiteCoordinatorService,
  StudentService,
  AlgorithmService,
} from "./services/index.js";
import {
  coachRouter,
  siteCoordinatorRouter,
  studentRouter,
  algoRouter,
} from "./routers/index.js";
import {
  errorHandlerMiddleware,
  loggingMiddlware,
} from "./middleware/index.js";
import { getLogger } from "./utils/logger.js";
import { contestRegistrationRouter } from "./routers/contest-registration-router.js";

const logger = getLogger();

logger.info("Setup Express");
const app = express();
const port = process.env.PORT || "3000";

const databaseConnection = Database.getConnection();
await seed(databaseConnection);

const studentService = new StudentService(databaseConnection);
const coachService = new CoachService(databaseConnection);
const siteCoordinatorService = new SiteCoordinatorService(databaseConnection);
const contestRegistrationService = new ContestRegistrationService(
  databaseConnection,
);
const algoService = new AlgorithmService(databaseConnection, contestRegistrationService);

logger.info("Setup HTTP Server");
app
  .use(cors())
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(loggingMiddlware)
  .use("/api", studentRouter(studentService))
  .use("/api", coachRouter(coachService))
  .use("/api", siteCoordinatorRouter(siteCoordinatorService))
  .use("/api", contestRegistrationRouter(contestRegistrationService))
  .use("/api", algoRouter(algoService))
  .use(errorHandlerMiddleware);

app.listen(port, () => {
  logger.info(`Started up HTTP Server on ${port}`);
});
