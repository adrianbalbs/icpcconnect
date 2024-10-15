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

export type NewTeamResponse = {
  id: number;
  stuIds: number[];
};

export type GetTeamsResponse = {
  teams: NewTeamResponse[];
}

export type DeleteResponse = {
  status: "OK";
};
