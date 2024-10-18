import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { forbiddenError, unauthorizedError } from "../utils/errors.js";
import { JwtPayloadSchema } from "../schemas/auth-schema.js";
import { getLogger } from "../utils/logger.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "placeholder-key";
const logger = getLogger();

export function authenticate(req: Request, res: Response, next: NextFunction) {
  logger.info("Authenticating request");
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(unauthorizedError.errorCode).send({ unauthorizedError });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const parsed = JwtPayloadSchema.safeParse(decoded);
    if (!parsed.success) {
      const errorMessages = parsed.error.errors.map((issue) => ({
        message: `${issue.path.join(".")} is ${issue.message}`,
      }));
      logger.error(errorMessages);
      res.status(forbiddenError.errorCode).json({
        error: "Invalid token strucutre",
        details: errorMessages,
      });
      return;
    }
    req.userId = parsed.data.id;
    next();
  } catch (err) {
    res.status(unauthorizedError.errorCode).json({ message: "Forbidden", err });
    return;
  }
}
