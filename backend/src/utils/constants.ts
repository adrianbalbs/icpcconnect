import { env } from "../env.js";

export const __prod__ = env.NODE_ENV === "prod";
