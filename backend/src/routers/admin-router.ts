import { Router, Request, Response, NextFunction } from "express";
import { AdminService, AuthService } from "../services/index.js";
import {
  createAuthenticationMiddleware,
  authorise,
} from "../middleware/index.js";
import { AlgorithmService } from "../services/algorithm-service.js";

export function adminRouter(
  adminService: AdminService,
  authService: AuthService,
  algorithmService: AlgorithmService,
) {
  const authenticate = createAuthenticationMiddleware(authService);
  return Router()
    .use(authenticate)
    .post(
      "/runalgo",
      async (_req: Request, res: Response, next: NextFunction) => {
        try {
          const success = await algorithmService.callAlgorithm();
          res.status(200).json(success);
        } catch (err) {
          next(err);
        }
      },
    )
    .delete(
      "/admin/:id",
      authorise(["Admin"]),
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const result = await adminService.deleteAdmin(id);
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    );
}
