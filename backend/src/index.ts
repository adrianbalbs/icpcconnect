import express from "express";
import cors from "cors";
import { Database } from "./db/index.js";
import { CoachService, StudentService } from "./services/index.js";
import { coachRouter, studentRouter } from "./routers/index.js";
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

logger.info("Setup HTTP Server");
app
  .use(cors())
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(loggingMiddlware)
  .use("/api", studentRouter(studentService))
  .use("/api", coachRouter(coachService))
  .use(errorHandlerMiddleware);

app.listen(port, () => {
  logger.info(`Started up HTTP Server on ${port}`);
});
