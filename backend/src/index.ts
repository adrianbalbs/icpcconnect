import express from "express";
import cors from "cors";
import { Database } from "./db/index.js";
import { StudentService, TeamService } from "./services/index.js";
import { studentRouter, teamRouter } from "./routers/index.js";
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
const teamService = new TeamService(databaseConnection);

logger.info("Setup HTTP Server");
app
  .use(cors())
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(loggingMiddlware)
  .use("/api/students", studentRouter(studentService))
  .use("/api/teams", teamRouter(teamService))
  .use(errorHandlerMiddleware);

app.listen(port, () => {
  logger.info(`Started up HTTP Server on ${port}`);
});
