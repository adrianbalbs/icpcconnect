import { NextFunction, Request, Response, Router } from "express";
// import { getLogger } from "../utils/logger.js";
import { CodesService } from "../services/index.js";
import {
    pushCodeAuth,
    pushCodeCoach,
    pushCodeSiteCoord,
} from "../utils/createcode.js"
import {
    CreateAuthCodeRouteRequest
} from "../schemas/codes-schema.js"

export function codesRouter(codesService: CodesService) {
//   const logger = getLogger();
  return Router()

    /** THESE ARE UNSAFE IN PROD (WE SHOULD REMOVE THESE) **/
    .get("/allRoleCodes", async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const codes = await codesService.getAllRoleCodes();
            res.status(200).json(codes);
        } catch (err) {
            next(err);
        }
    })

    /** THESE ARE UNSAFE IN PROD (WE SHOULD REMOVE THESE) **/
    .get("/allAuthCodes", async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const codes = await codesService.getAllAuthCodes();
            res.status(200).json(codes);
        } catch (err) {
            next(err);
        }
    })

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
            req: Request<Record<string, never>, unknown, CreateAuthCodeRouteRequest>,
            res: Response,
            next: NextFunction,
        ) => {
        const { email } = req.body;
        try {
            const code = await pushCodeAuth(codesService, email)
            res.status(200).json(code);
        } catch (err) {
            next(err);
        }
    })
}
