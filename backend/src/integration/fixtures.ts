import { CreateUser } from "../schemas/index.js";

export const generateCreateUserFixture = (
  overrides: Partial<CreateUser> = {},
): CreateUser => {
  const defaultUser: CreateUser = {
    givenName: "John",
    familyName: "Doe",
    email: "johndoe@example.com",
    password: "securePassword123!",
    role: "Student",
    university: 1,
  };

  return { ...defaultUser, ...overrides };
};
