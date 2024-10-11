import { Router, Request, Response, NextFunction } from "express";
import { SiteCoordinatorService } from "../services/index.js";
import {
  CreateSiteCoordinatorRequest,
  CreateSiteCoordinatorRequestSchema,
  UpdateSiteCoordinatorRequest,
  UpdateSiteCoordinatorRequestSchema,
} from "../schemas/user-schema.js";
import { validateData } from "../middleware/validator-middleware.js";

export function siteCoordinatorRouter(
  siteCoordinatorService: SiteCoordinatorService,
) {
  return Router()
    .get(
      "/site-coordinators",
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
      "/site-coordinators/:id",
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
      "/site-coordinators/:id",
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
      "/site-coordinators",
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
      "/site-coordinators/:id",
      validateData(UpdateSiteCoordinatorRequestSchema, "body"),
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
