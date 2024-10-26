import { DatabaseConnection, users, verifyEmail } from "../db/index.js";
import {
  PassVerificationRequest,
  SendEmailCodeRequest,
} from "../schemas/index.js";
import { eq } from "drizzle-orm";
// import { sendVerificationCode } from "./email-handler"
import { sendEmail } from "./email-handler/email.js"; // Adjust the path as necessary
import { HTTPError, badRequest } from "../utils/errors.js";
export class EmailService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  private async codeExists(code: number): Promise<boolean> {
    const existingCode = await this.db
      .select({ code: verifyEmail.code })
      .from(verifyEmail)
      .where(eq(verifyEmail.code, code));
    return existingCode.length !== 0;
  }

  private async finishVerification(email: string): Promise<void> {
    const target = await this.db
      .select({ email: verifyEmail.email })
      .from(verifyEmail)
      .where(eq(verifyEmail.email, email));

    if (target.length === 0) {
      return;
    }

    await this.db.delete(verifyEmail).where(eq(verifyEmail.email, email));
  }

  private generateSixDigitCode(): number {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private async generateUniqueCode(email: string): Promise<number> {
    const target = await this.db
      .select({ code: verifyEmail.code })
      .from(verifyEmail)
      .where(eq(verifyEmail.email, email));

    if (target.length > 0) {
      return target[0].code;
    }
    let code: number;

    do {
      code = this.generateSixDigitCode();
    } while (await this.codeExists(code));

    await this.db.insert(verifyEmail).values({
      email,
      code,
    });

    return code;
  }

  // Check that email is a valid university email.
  public isValidUniversityEmail(email: string): boolean {
    const regex =
      /^[\w!#$%&'*+=?^`{|}~-]+(?:\.[\w!#$%&'*+=?^`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(\.(edu|edu\.au|ac|ac\.uk|edu\.ca|edu\.cn|edu\.sg|edu\.nz|edu\.in|edu\.jp|ac\.nz))$/;

    return regex.test(email);
  }

  // Check that no previous user uses the same email.
  public async isNewRegisteredEmail(email: string): Promise<boolean> {
    try {
      const existingUser = await this.db
        .select()
        .from(users)
        .where(eq(users.email, email));
      return existingUser.length === 0;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return false;
    }
  }

  // Send code to the email so that the user can verify his/her email box.
  // Note that the email address provided should be valid: I.e, no previous user uses the same email.
  // Will throw err if it is not a uni email/ valid email/ or email that has been created by someone before.
  public async sendEmailVerificationCode(
    req: SendEmailCodeRequest,
  ): Promise<string> {
    const { email } = req;
    if (!this.isValidUniversityEmail(email)) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: "Invalid University Email Address provided.",
      });
    } else if (!(await this.isNewRegisteredEmail(email))) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: "Email Address provided has been used by others before.",
      });
    }
    const code = (await this.generateUniqueCode(email)).toString();
    await sendEmail("New User", email, "ICPC Verification Code", code);

    return code;
  }

  public async passVerification(
    req: PassVerificationRequest,
  ): Promise<boolean> {
    const { email, userProvidedCode } = req;
    const targetCode = await this.db
      .select({ code: verifyEmail.code })
      .from(verifyEmail)
      .where(eq(verifyEmail.email, email));
    if (targetCode.length === 0) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: "You need to send email verification first.",
      });
    }
    const result = targetCode[0].code.toString() === userProvidedCode;

    if (result) {
      await this.finishVerification(email);
    }

    return result;
  }
}
