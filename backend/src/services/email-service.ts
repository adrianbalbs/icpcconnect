import { DatabaseConnection, studentDetails, users, verifyEmail } from "../db/index.js";
import { ForgotPasswordResetPasswordRequest, PassForgotPasswordVerificationRequest, PassRegisterEmailVerificationRequest, SendEmailForgotPasswordCodeRequest, SendEmailVerificationCodeRequest, SendTeamAllocationEmail } from "../schemas/index.js";
import { eq, inArray } from "drizzle-orm";
// import { sendVerificationCode } from "./email-handler"
import { sendEmail, sendGroupArrangedEmail, sendTeamAllocationEmails } from './email-handler/email.js'; // Adjust the path as necessary
import { HTTPError, badRequest, internalServerError } from "../utils/errors.js";
import { passwordUtils } from "../utils/encrypt.js";


export type GenerateEmailVerificationCodeResponse = {
    id: string,
    code: number,
    userName: string
};

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

        await this.db
            .delete(verifyEmail)
            .where(eq(verifyEmail.email, email));
    }
    
    private generateSixDigitCode(): number {
        const min = 100000;
        const max = 999999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Generate a code based on email.
    private async generateUniqueCode(email: string): Promise<GenerateEmailVerificationCodeResponse> {
        const target = await this.db
            .select(
                { 
                id: verifyEmail.id,
                code: verifyEmail.code,
                userName: verifyEmail.userName,
                }
            )
            .from(verifyEmail)
            .where(eq(verifyEmail.email, email));

        if (target.length > 0) {
            return {
                id: target[0].id,
                code: target[0].code,
                userName: target[0].userName
            }

        }
        let code: number;
    
        do {
            code = this.generateSixDigitCode();
        } while (await this.codeExists(code));

        let id: string;
        let name: string;
        const target_user = await this.db
            .select(
            { 
                id: users.id,
                name: users.givenName
            }
            )
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

        await this.db
            .insert(verifyEmail)
            .values(
            {
                id: id,
                code: code,
                email: email,
                userName: name,
                isVerified: false
            }
            );
    
        return {
            id: id,
            code: code,
            userName: name,
        }
    }
    

    // Check that email is a valid university email.
    public isValidUniversityEmail(email: string): boolean {
        // eslint-disable-next-line no-useless-escape
        const regex = /^[\w!#$%&'*+\=?^`{|}~-]+(?:\.[\w!#$%&'*+\=?^`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(\.(edu|edu\.au|ac|ac\.uk|edu\.ca|edu\.cn|edu\.sg|edu\.nz|edu\.in|edu\.jp|ac\.nz|ac\.fj))$/;

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
    public async sendEmailVerificationCode(req: SendEmailVerificationCodeRequest): Promise<string> {
        const { email } = req;
        if (!this.isValidUniversityEmail(email)) {
            throw new HTTPError({
                errorCode: badRequest.errorCode,
                message: "Invalid University Email Address provided.",
            });
        } else if (!await this.isNewRegisteredEmail(email)) {
            throw new HTTPError({
                errorCode: badRequest.errorCode,
                message: "Email Address not found in database.",
            });
        }
        const code = (await this.generateUniqueCode(email)).code.toString();
        await sendEmail("New User", email, "ICPC Verification Code", code);

        return code;
    }

    // Send link to the email so that the user can click the link and reset password.
    // Note that the email address provided should be already created/registered by user before.
    public async sendEmailForgotPasswordCode(req: SendEmailForgotPasswordCodeRequest): Promise<string> {
    const { email } = req;
    if (!this.isValidUniversityEmail(email)) {
        throw new HTTPError({
            errorCode: badRequest.errorCode,
            message: "Invalid University Email Address provided.",
        });
    } else if (await this.isNewRegisteredEmail(email)) {
        throw new HTTPError({
            errorCode: badRequest.errorCode,
            message: "You have to provide an email address that is successfully registered before.",
        });
    }
    await this.finishVerification(email);
    const generateCodeResult = await this.generateUniqueCode(email);
    await sendEmail(generateCodeResult.userName, email, "ICPC Forgot Password Link",
                        generateCodeResult.code.toString(), generateCodeResult.id);
    return generateCodeResult.code.toString();
}

    public async passRegisterEmailVerification(req: PassRegisterEmailVerificationRequest): Promise<boolean> {
        const {email, userProvidedCode} = req;
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

    public async passForgotPasswordVerification(req: PassForgotPasswordVerificationRequest): Promise<boolean> {
    const {id, authenticationCode} = req;
    const targetInfo = await this.db
        .select(
            {
            uid: verifyEmail.id,
            code: verifyEmail.code,
            email: verifyEmail.email,
            userName: verifyEmail.userName,
            }
        )
        .from(verifyEmail)
        .where(eq(verifyEmail.id, id));

    if (targetInfo.length === 0) {
        throw new HTTPError({
            errorCode: badRequest.errorCode,
            message: "You need to send forgot password verification first.",
        });
    }
    const {uid, code, email, userName } = targetInfo[0];
    const result = code.toString() === authenticationCode && uid === id;
    if (result) {
        await this.db
        .update(verifyEmail)
        .set({ id: uid, code, email, userName, isVerified: result})
        .where(eq(verifyEmail.id, uid));
    }
    return result;
}

// Only when you pass the forgot password verification, you can then change the password.
// Note that this function won't check the verification code is correct,
// it would just change the password and then invalidate the verification code.
public async forgotPasswordChangePassword(req: ForgotPasswordResetPasswordRequest): Promise<boolean> {
    const {id, newPassword} = req;
    const targetInfo = await this.db
        .select(
        {
            id: verifyEmail.id,
            isVerified: verifyEmail.isVerified,
            email: verifyEmail.email,
        }
        )
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

async sendTeamMemberInfo(): Promise<void> {
    const teams = await this.db.query.teams.findMany();

    for (const team of teams) {
        const members = await this.db.query.studentDetails.findMany({
            where: eq(studentDetails.team, team.id)
        });

        const memberNames = [];
        const memberEmails = [];
        for (const member of members) {
            const result = await this.db.query.users.findMany({
                where: eq(users.id, member.userId)
            });
            if (result.length === 0) {
                throw new HTTPError({
                    errorCode: internalServerError.errorCode,
                    message: "It should not happen, check whether you have runned the runalgo.",
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