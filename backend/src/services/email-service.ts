import {
  DatabaseConnection,
  studentDetails,
  teams,
  users,
  verifyEmail,
} from "../db/index.js";
import {
  ForgotPasswordResetPasswordRequest,
  PassForgotPasswordVerificationRequest,
  PassRegisterEmailVerificationRequest,
  SendEmailForgotPasswordCodeRequest,
  SendEmailVerificationCodeRequest,
} from "../schemas/index.js";
import { eq } from "drizzle-orm";
// import { sendVerificationCode } from "./email-handler"
import { sendEmail, sendTeamAllocationEmails } from "./email-handler/email.js"; // Adjust the path as necessary
import { HTTPError, badRequest, internalServerError } from "../utils/errors.js";
import { passwordUtils } from "../utils/encrypt.js";

export type GenerateEmailVerificationCodeResponse = {
  id: string;
  code: number;
  userName: string;
};

export class EmailService {
  private readonly db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /*
   * Check whether a given code exists in the db/has a matching verification-request
   *
   * @param code - the code we are checking
   *
   * @returns boolean - whether code exists in the entry-db
   *
   */
  private async codeExists(code: number): Promise<boolean> {
    const existingCode = await this.db
      .select({ code: verifyEmail.code })
      .from(verifyEmail)
      .where(eq(verifyEmail.code, code));
    return existingCode.length !== 0;
  }

  /*
   * Remove a given email's requests (verification/forgot password) from the db
   *
   * @param email - email whose requests we are removing from db
   *
   */
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

  /*
   * Generates a six-digit code
   *
   * @returns number - the code
   */
  private generateSixDigitCode(): number {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /*
   * Generate a unique six-digit code
   *
   * @remarks
   * If the email already has a request, just returns that requests details
   * For forgot-password requests, id equals the user-id, because the user has an account
   * For verification-code requests, id equals the email, because they dont have an account yet
   *
   * @param   email - email we are generating code for
   *
   * @returns GenerateEmailVerificationCodeResponse
   *   id   - Either the user-id of the user, or the email
   *   code - the six-digit code we generated
   *   name - the email we entered
   *
   */
  private async generateUniqueCode(
    email: string,
  ): Promise<GenerateEmailVerificationCodeResponse> {
    const target = await this.db
      .select({
        id: verifyEmail.id,
        code: verifyEmail.code,
        userName: verifyEmail.userName,
      })
      .from(verifyEmail)
      .where(eq(verifyEmail.email, email));

    if (target.length > 0) {
      return {
        id: target[0].id,
        code: target[0].code,
        userName: target[0].userName,
      };
    }
    let code: number;

    do {
      code = this.generateSixDigitCode();
    } while (await this.codeExists(code));

    let id: string;
    let name: string;
    const target_user = await this.db
      .select({
        id: users.id,
        name: users.givenName,
      })
      .from(users)
      .where(eq(users.email, email));

    if (target_user.length > 0) {
      // In forgot password, it will find the userid automatically.
      id = target_user[0].id;
      name = target_user[0].name;
    } else {
      // you should not expect this to run in forgot password, since 'forgot password' means
      // the user has already created the account so id should always be found and available from database.
      id = email;
      name = email;
    }

    await this.db.insert(verifyEmail).values({
      id: id,
      code: code,
      email: email,
      userName: name,
      isVerified: false,
    });

    return {
      id: id,
      code: code,
      userName: name,
    };
  }

  /*
   * Check that a given email is a valid university email.
   *
   * @param   email   - the email we are validating
   *
   * @returns boolean - whether it is valid
   *
   */
  public isValidUniversityEmail(email: string): boolean {
    const regex =
      /^[\w!#$%&'*+=?^`{|}~-]+(?:\.[\w!#$%&'*+=?^`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(\.(edu|edu\.au|ac|ac\.uk|edu\.ca|edu\.cn|edu\.sg|edu\.nz|edu\.in|edu\.jp|ac\.nz|ac\.fj))$/;

    return regex.test(email);
  }

  /*
   * Check that a given email is not already associated with a user
   *
   * @param   email   - the email we are checking
   *
   * @returns boolean - email has not yet been registered
   *
   */
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

  /*
   * Sends a verification code to the provided email so that the user can verify his/her email box.
   *
   * @remarks
   * Note that the email address provided should be valid: I.e, no previous user uses the same email.
   *
   * @param   req - SendEmailVerificationCodeRequest
   *   req.email - Email we are sending verification code to
   *   req.isNormalVerificationEmail - Whether we are a normal email - e.g we wish to validate it is a university email
   *
   * @returns string - The verification code generated
   *
   * @throws BadRequest
   *   - If we are verifying a email that should be from a university and the email is not a university email
   *   - If email is already in use
   */
  public async sendEmailVerificationCode(
    req: SendEmailVerificationCodeRequest,
  ): Promise<string> {
    const { email, isNormalVerificationEmail } = req;
    if (isNormalVerificationEmail && !this.isValidUniversityEmail(email)) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: "Invalid University Email Address provided.",
      });
    } else if (!(await this.isNewRegisteredEmail(email))) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: "Email Address not found in database.",
      });
    }
    const code = (await this.generateUniqueCode(email)).code.toString();
    await sendEmail("New User", email, "ICPC Verification Code", code);

    return code;
  }

  /*
   * Sends a link to the provided email so that the user can use to reset their password
   *
   * @remarks
   * Note that the email address provided should be already created/registered by user before.
   *
   * @param   req - SendEmailForgotPasswordRequest
   *   req.email - Email we are sending reset-link / code to
   *
   * @returns string - The code to validate the user when resetting password
   *
   * @throws BadRequest
   *   - If email is not associated with a user
   */
  public async sendEmailForgotPasswordCode(
    req: SendEmailForgotPasswordCodeRequest,
  ): Promise<string> {
    const { email } = req;
    if (await this.isNewRegisteredEmail(email)) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message:
          "You have to provide an email address that is successfully registered before.",
      });
    }
    await this.finishVerification(email);
    const generateCodeResult = await this.generateUniqueCode(email);
    await sendEmail(
      generateCodeResult.userName,
      email,
      "ICPC Forgot Password Link",
      generateCodeResult.code.toString(),
      generateCodeResult.id,
    );
    return generateCodeResult.code.toString();
  }

  /*
   * Function for handling user entering their verification code, and handling
   * finishing verification, or rejecting invalid codes
   *
   * @param   req - PassRegisterEmailVerificationCode
   *   req.email - Email we are trying to verify
   *   req.userProvidedCode - Code user has entered client-side
   *
   * @returns boolean - whether the code provided matches the one generated
   *
   * @throws BadRequest
   *   - if there is not a verification code associated with the given email
   *   - If the verification code provided doesn't match the one stored in the db
   */
  public async passRegisterEmailVerification(
    req: PassRegisterEmailVerificationRequest,
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
    } else {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: "You should give a correct verification code!",
      });
    }

    return result;
  }

  /*
   * @param   req - PassForgotPasswordVerificationCode
   *   req.id - the user-id of the user whose password we are resetting
   *   req.authenticationCode - Code user has entered client-side
   *
   * @returns boolean - whether the code provided matches the one generated
   *
   * @throws BadRequest
   *   - if there is not a forgot-password code associated with the given user
   */
  public async passForgotPasswordVerification(
    req: PassForgotPasswordVerificationRequest,
  ): Promise<boolean> {
    const { id, authenticationCode } = req;
    const targetInfo = await this.db
      .select({
        uid: verifyEmail.id,
        code: verifyEmail.code,
        email: verifyEmail.email,
        userName: verifyEmail.userName,
      })
      .from(verifyEmail)
      .where(eq(verifyEmail.id, id));

    if (targetInfo.length === 0) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: "You need to send forgot password verification first.",
      });
    }
    const { uid, code, email, userName } = targetInfo[0];
    const result = code.toString() === authenticationCode && uid === id;
    if (result) {
      await this.db
        .update(verifyEmail)
        .set({ id: uid, code, email, userName, isVerified: result })
        .where(eq(verifyEmail.id, uid));
    }
    return result;
  }

  /*
   * Resets the users password, and invalidates the entry related to the reset-password request in the db
   *
   * @remarks
   * Must pass the 'forgot-password' verification before being allowed to change password
   * Note that this function won't check the verification code is correct - that is for passForgotPasswordVerificaiton
   * We do check that the 'isVerified' field is true though
   *
   * @param   req - ForgotPasswordResetPasswordRequest
   *   req.id - the user-id of the user whose password we are resetting
   *   req.newPassword - New password for users account
   *
   * @returns boolean - whether the code provided matches the one generated
   *
   * @throws BadRequest
   *   - if there is not a forgot-password entry associated with the user
   *   - if the user has not passed the verification yet (e.g sending the forgot-email code to us)
   */
  public async forgotPasswordChangePassword(
    req: ForgotPasswordResetPasswordRequest,
  ): Promise<boolean> {
    const { id, newPassword } = req;
    const targetInfo = await this.db
      .select({
        id: verifyEmail.id,
        isVerified: verifyEmail.isVerified,
        email: verifyEmail.email,
      })
      .from(verifyEmail)
      .where(eq(verifyEmail.id, id));
    if (targetInfo.length === 0) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: "You need to send forgot password verification first.",
      });
    } else if (targetInfo[0].isVerified === false) {
      throw new HTTPError({
        errorCode: badRequest.errorCode,
        message: "You have to pass the forgot password verification first.",
      });
    }

    // Start update the password
    const hashedPassword = await passwordUtils().hash(newPassword);
    await this.db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id));

    await this.finishVerification(targetInfo[0].email);

    return true;
  }

  /*
   * Once the team-matching algo of a given contest has run, email students about their teams/team-members
   *
   * @param contestId - contest-id of the contest who we want to send out emails for
   *
   *
   * @throws InternalServerError
   *   - MemberIds of a given team do not correspond to actual users
   */
  async sendTeamMemberInfo(contestId: string): Promise<void> {
    const allTeams = await this.db.query.teams.findMany({
      where: eq(teams.contest, contestId),
    });

    for (const team of allTeams) {
      const members = await this.db.query.studentDetails.findMany({
        where: eq(studentDetails.team, team.id),
      });

      const memberNames = [];
      const memberEmails = [];
      for (const member of members) {
        const result = await this.db.query.users.findMany({
          where: eq(users.id, member.userId),
        });
        if (result.length === 0) {
          throw new HTTPError({
            errorCode: internalServerError.errorCode,
            message:
              "It should not happen, check whether you have runned the runalgo.",
          });
        }
        const user = result[0];
        memberNames.push(user.givenName + " " + user.familyName);
        memberEmails.push(user.email);
      }

      const teamName: string = team.name ?? "Unnamed Team";

      // send email info....
      sendTeamAllocationEmails({
        name: teamName,
        memberNames: memberNames,
        memberEmails: memberEmails,
      });
    }
  }
}
