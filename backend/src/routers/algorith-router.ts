import { NextFunction, Request, Response, Router } from "express";
import { validateData } from "../middleware/index.js";
import {
    StudentScoreRequest,
    RunGroupingRequest,
} from "../schemas/index.js";
import { AlgorithmService } from "../services/index.js";

export function algoRouter(algoService: AlgorithmService) {
  return Router()
    .get(
      "/getGroups",
      async (_req: Request, res: Response, next: NextFunction) => {
        try {
          const groups = await algoService.getGroupings();
          res.status(200).json(groups);
        } catch (err) {
          next(err);
        }
      });
}
