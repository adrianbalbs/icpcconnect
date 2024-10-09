import { UserRole } from "../schemas/user-schema.js";

export interface IHttpError {
  errorCode: number;
  message: string;
}

export interface NewUserResponse {
  userId: string;
}

export interface UserProfileResponse {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  role: UserRole;
}

export interface DeleteResponse {
  status: "OK";
}
