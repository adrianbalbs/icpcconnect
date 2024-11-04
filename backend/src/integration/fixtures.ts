import { v4 } from "uuid";
import { CreateUser } from "../schemas/index.js";

export const generateCreateUserFixture = (
  overrides: Partial<CreateUser> = {},
): CreateUser => {
  const defaultUser: CreateUser = {
    id: v4(),
    givenName: "John",
    familyName: "Doe",
    email: "johndoe@example.com",
    password: "securePassword123!",
    role: "Student",
    university: 1,
  };

  return { ...defaultUser, ...overrides };
};
