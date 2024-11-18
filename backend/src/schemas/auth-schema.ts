import z from "zod";
import { UserRoleEnum } from "./user-schema.js";

export const JwtPayloadSchema = z.object({
  id: z.string(),
  role: UserRoleEnum,
});

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

export const UserAuthInfoSchema = z.object({
  givenName: z.string(),
  familyName: z.string(),
  refreshTokenVersion: z.number(),
  email: z.string(),
  role: UserRoleEnum,
  id: z.string(),
});

export type UserAuthInfo = z.infer<typeof UserAuthInfoSchema>;

export const LoginResponseSchema = z.object({
  userInfo: UserAuthInfoSchema,
  token: z.string(),
  refresh: z.string(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
