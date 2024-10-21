import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { badRequest, unauthorizedError } from "../utils/errors.js";
import { UserRole } from "../schemas/user-schema.js";
import { getLogger } from "../utils/logger.js";

dotenv.config();
const logger = getLogger();

export const authorise = (roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    logger.debug("Authorising request");
    const role = req.role;
    if (!role) {
      res.status(badRequest.errorCode).send({ message: "Role is missing" });
      return;
    }
    if (!roles.includes(role)) {
      res.status(unauthorizedError.errorCode).send(unauthorizedError);
      return;
    }
    next();
  };
};
