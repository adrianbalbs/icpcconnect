import { UserRole } from "../schemas/index.js";

export interface IHttpError {
  errorCode: number;
  message: string;
}

export type NewUserResponse = {
  userId: string;
};

export type UserProfileResponse = {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  role: UserRole;
};

export type DeleteResponse = {
  status: "OK";
};
