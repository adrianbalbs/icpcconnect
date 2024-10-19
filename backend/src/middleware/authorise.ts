import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { badRequest, unauthorizedError } from "../utils/errors.js";
import { AuthService } from "../services/auth-service.js";
import { UserRole } from "../schemas/user-schema.js";
import { getLogger } from "../utils/logger.js";

dotenv.config();
const logger = getLogger();

export const createAuthoriseMiddleware =
  (authService: AuthService) => (roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      logger.info("Authorising request");
      const id = req.userId;
      if (!id) {
        res.status(badRequest.errorCode).send({ message: "UserId is missing" });
        return;
      }
      try {
        const role = await authService.getUserRole(id);
        if (!roles.includes(role)) {
          res.status(unauthorizedError.errorCode).send(unauthorizedError);
          return;
        }
        next();
      } catch (err) {
        next(err);
      }
    };
  };
