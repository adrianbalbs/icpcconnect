import { z } from "zod";

export const CreateRoleCodeSchema = z.object({
  code: z.number(),
  role: z.number(),
});

export type CreateRoleCodeRequest = z.infer<typeof CreateRoleCodeSchema>;

export const CreateAuthCodeSchema = z.object({
  code: z.number(),
  email: z.string(),
});

export type CreateAuthCodeRequest = z.infer<typeof CreateAuthCodeSchema>;

export const CreateAuthCodeRouteSchema = z.object({
  email: z.string(),
});

export type CreateAuthCodeRouteRequest = z.infer<
  typeof CreateAuthCodeRouteSchema
>;
