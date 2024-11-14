import { Router, Request, Response, NextFunction } from "express";
import { AdminService, AuthService } from "../services/index.js";
import {
  createAuthenticationMiddleware,
  validateData,
  authorise,
} from "../middleware/index.js";
import { AlgorithmService } from "../services/algorithm-service.js";
import { AlgorithmRequest, AlgorithmRequestSchema } from "../schemas/index.js";

export function adminRouter(
  adminService: AdminService,
  authService: AuthService,
  algorithmService: AlgorithmService,
) {
  const authenticate = createAuthenticationMiddleware(authService);
  return Router()
    .use(authenticate)
    .post(
      "/algo",
      validateData(AlgorithmRequestSchema, "body"),
      async (
        req: Request<unknown, unknown, AlgorithmRequest>,
        res: Response,
        next: NextFunction,
      ) => {
        try {
          const { contestId } = req.body;
          const success = await algorithmService.callAlgorithm(contestId);
          res.status(200).json(success);
        } catch (err) {
          next(err);
        }
      },
    )
    .delete(
      "/:id",
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
