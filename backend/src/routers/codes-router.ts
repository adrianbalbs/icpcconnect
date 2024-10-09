import { NextFunction, Request, Response, Router } from "express";
import { getLogger } from "../utils/logger.js";
import { CodesService } from "../services/index.js";
import {
    pushCodeAuth,
    pushCodeCoach,
    pushCodeSiteCoord,
} from "../utils/createcode.js"

export function codesRouter(codesService: CodesService) {
  const logger = getLogger();
  return Router()
    .get("/newCoachCode", async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const code = await pushCodeCoach(codesService);
            res.status(200).json(code);
        } catch (err) {
            next(err);
        }
    })

    .get("/newSiteCoordCode", async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const code = await pushCodeSiteCoord(codesService);
            res.status(200).json(code);
        } catch (err) {
            next(err);
        }
    })
    
    .post("/newAuthCode", async (
            req: Request<Record<string, never>, unknown, string>,
            res: Response,
            next: NextFunction,
        ) => {
        const email = req.body;
        try {
            const code = await pushCodeAuth(codesService, email)
            res.status(200).json(code);
        } catch (err) {
            next(err);
        }
    })
}
