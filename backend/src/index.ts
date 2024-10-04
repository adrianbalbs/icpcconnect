import express from "express";
import cors from "cors";
import { Database } from "./db/index.js";
import { UserService } from "./services/index.js";
import { userRouter } from "./routers/index.js";
import { errorHandlerMiddleware } from "./middleware/index.js";
import { getLogger } from "./utils/logger.js";

const logger = getLogger();

logger.info("Setup Express");
const app = express();
const port = process.env.PORT || "3000";

const databaseConnection = Database.getConnection();
const userService = new UserService(databaseConnection);

logger.info("Setup HTTP Server");
app
  .use(cors())
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use("/api/users", userRouter(userService))
  .use(errorHandlerMiddleware);

app.listen(port, () => {
  logger.info(`Started up HTTP Server on ${port}`);
});
