import { Router, Request, Response, NextFunction } from "express";
import { AuthService, SiteCoordinatorService } from "../services/index.js";
import {
  CreateSiteCoordinatorRequest,
  CreateSiteCoordinatorRequestSchema,
  UpdateSiteCoordinatorRequest,
  UpdateSiteCoordinatorRequestSchema,
} from "../schemas/user-schema.js";
import { validateData } from "../middleware/validator-middleware.js";
import { createAuthenticationMiddleware } from "../middleware/authenticate.js";
import { createAuthoriseMiddleware } from "../middleware/authorise.js";

export function siteCoordinatorRouter(
  siteCoordinatorService: SiteCoordinatorService,
  authService: AuthService,
) {
  const authenticate = createAuthenticationMiddleware(authService);
  const authorise = createAuthoriseMiddleware(authService);
  return Router()
    .get(
      "/",
      [authenticate, authorise(["admin"])],
      async (_req: Request, res: Response, next: NextFunction) => {
        try {
          const siteCoordinators =
            await siteCoordinatorService.getAllSiteCoordinators();
          res.status(200).json(siteCoordinators);
        } catch (err) {
          next(err);
        }
      },
    )
    .get(
      "/:id",
      [authenticate, authorise(["admin", "site_coordinator"])],
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const siteCoordinator =
            await siteCoordinatorService.getSiteCoordinatorById(id);
          res.status(200).json(siteCoordinator);
        } catch (err) {
          next(err);
        }
      },
    )
    .delete(
      "/:id",
      [authenticate, authorise(["admin"])],
      async (
        req: Request<{ id: string }, unknown>,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        try {
          const result = await siteCoordinatorService.deleteSiteCoordinator(id);
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    )
    .post(
      "/",
      validateData(CreateSiteCoordinatorRequestSchema, "body"),
      async (
        req: Request<
          Record<string, never>,
          unknown,
          CreateSiteCoordinatorRequest
        >,
        res: Response,
        next: NextFunction,
      ) => {
        const siteCoordinatorDetails = req.body;
        try {
          const result = await siteCoordinatorService.createSiteCoordinator(
            siteCoordinatorDetails,
          );
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    )
    .put(
      "/:id",
      [
        authenticate,
        authorise(["admin", "site_coordinator"]),
        validateData(UpdateSiteCoordinatorRequestSchema, "body"),
      ],

      async (
        req: Request<
          Record<string, never>,
          unknown,
          UpdateSiteCoordinatorRequest
        >,
        res: Response,
        next: NextFunction,
      ) => {
        const { id } = req.params;
        const newSiteCoordinatorDetails = req.body;
        try {
          const result = await siteCoordinatorService.updateSiteCoordinator(
            id,
            newSiteCoordinatorDetails,
          );
          res.status(200).json(result);
        } catch (err) {
          next(err);
        }
      },
    );
}
