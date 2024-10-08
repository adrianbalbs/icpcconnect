import express from "express";
import cors from "cors";
import { Database } from "./db/index.js";
import {
  CoachService,
  SiteCoordinatorService,
  StudentService,
} from "./services/index.js";
import {
  coachRouter,
  siteCoordinatorRouter,
  studentRouter,
} from "./routers/index.js";
import {
  errorHandlerMiddleware,
  loggingMiddlware,
} from "./middleware/index.js";
import { getLogger } from "./utils/logger.js";

const logger = getLogger();

logger.info("Setup Express");
const app = express();
const port = process.env.PORT || "3000";

const databaseConnection = Database.getConnection();

const studentService = new StudentService(databaseConnection);
const coachService = new CoachService(databaseConnection);
const siteCoordinatorService = new SiteCoordinatorService(databaseConnection);

logger.info("Setup HTTP Server");
app
  .use(cors())
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(loggingMiddlware)
  .use("/api", studentRouter(studentService))
  .use("/api", coachRouter(coachService))
  .use("/api", siteCoordinatorRouter(siteCoordinatorService))
  .use(errorHandlerMiddleware);

app.listen(port, () => {
  logger.info(`Started up HTTP Server on ${port}`);
});
