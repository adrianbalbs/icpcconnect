/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from "express";
import { UserRole } from "src/schemas/user-schema.ts";

declare module "express" {
  export interface Request {
    userId?: string;
    role?: UserRole;
  }
}
