import z from "zod";
import { UserRoleEnum } from "./user-schema.js";

export const JwtPayloadSchema = z.object({
  id: z.string(),
  role: UserRoleEnum,
});

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
