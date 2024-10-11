import { eq, is } from "drizzle-orm";
import { DatabaseConnection } from "../db/database.js";
import { users } from "../db/schema.js";
import { passwordUtils } from "../utils/encrypt.js";
import { HTTPError, unauthorizedError } from "../utils/errors.js";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";

export interface LoginRequest {
    email: string,
    password: string
}

export const SECRET_KEY: Secret = 'placeholder-key';

export class AuthService {
    private readonly db: DatabaseConnection;

    constructor(db: DatabaseConnection) {
        this.db = db;
    }

    async login(req: LoginRequest) {
        const { email, password } = req;

        const user = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email));

        console.log(user)
        if (!user.length) {
            throw new HTTPError(unauthorizedError)
        }

        // Compare the provided password with the stored hash
        const storedHash = user[0].password;
        const isPasswordValid = await passwordUtils().compare(password, storedHash);

        if (isPasswordValid) {
            const token = jwt.sign({ id: user[0].id, role: user[0].role }, SECRET_KEY, {
                expiresIn: '2 days',
            });
            return { token: token };
        } else {
            throw new HTTPError(unauthorizedError)
        }
    }
}