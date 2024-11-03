import { Request, Response, NextFunction } from "express";

type AsyncHandler<T extends Request = Request> = (
  req: T,
  res: Response,
) => Promise<void>;

export const handle = <T extends Request = Request>(fn: AsyncHandler<T>) => {
  return async (req: T, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (err) {
      next(err);
    }
  };
};
