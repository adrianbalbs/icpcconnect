import bcrypt from "bcrypt";

export function passwordUtils(saltRounds = 10) {
  async function hash(password: string) {
    return await bcrypt.hash(password, saltRounds);
  }

  async function compare(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  return { hash, compare };
}
