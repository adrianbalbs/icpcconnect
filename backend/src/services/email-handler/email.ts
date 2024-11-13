import nodemailer from 'nodemailer';
import { forget_password_email_content, verification_email_content } from './email-template/index.js';
import { group_arranged_email_content } from './email-template/group-arranged-template.js';
import { SendTeamAllocationEmail } from 'src/schemas/index.js';
import { inArray } from 'drizzle-orm';

export async function sendHtmlEmail(
    userName: string,
    userEmailAddress: string,
    emailTitle: string,
    htmlContent: string
) : Promise<string> {

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'zhouyuyundelph@gmail.com', // Your email address
            pass: 'ehyl lkzx ypxj axah', // Your email password (consider using environment variables)
        },
    });

    const mailOptions = {
        from: '"No Reply" <noreply@yourdomain.com>', // Sender address
        to: `${userName} <${userEmailAddress}>`, // List of recipients
        subject: emailTitle, // Subject line
        html: htmlContent, // HTML body
        text: 'Hello, please verify your email using the code sent in the HTML body.', // Plain text body
    };

    try {
        await transporter.sendMail(mailOptions);
        return 'Email sent successfully!';
    } catch (error) {
        throw new Error(`Failed to send email: ${error}`);
    }


}

export async function sendGroupArrangedEmail(
    userName: string,
    userEmailAddress: string,
    emailTitle: string,
    teamName: string,
    allMembersName: string[]
) : Promise<string> {
    let memberNameString;
    const otherMembers = allMembersName.filter(name => name !== userName);
    if (otherMembers.length > 0) {
        memberNameString = "and your other team members include: ";
        memberNameString += otherMembers.join(", ");
        memberNameString += "."
    } else {
        memberNameString = "and you are currently the only one in the group.";
    }
    const content = group_arranged_email_content
        .replace('<span> USER_NAME <span>', userName)
        .replace('<span> GROUP_NAME <span>', teamName)
        .replace('<span> GROUP_MEMBERS <span>', memberNameString);
    return sendHtmlEmail(userName, userEmailAddress, emailTitle, content);
}

export async function sendTeamAllocationEmails(req: SendTeamAllocationEmail): Promise<void> {
    const {name, memberNames, memberEmails} = req;
    for (let i = 0; i < memberNames.length; ++i) {
        const memberName = memberNames[i];
        const memberEmail = memberEmails[i];
        sendGroupArrangedEmail(
            memberName,
            memberEmail,
            "You have been allocated into an ICPC group",
            name,
            memberNames
        );
    }
}


export async function sendEmail(
    userName: string,
    userEmailAddress: string,
    emailTitle: string,
    verificationCode: string,
    id?: string
): Promise<string> {
    let content: string;

    if (id === undefined || id === null) {
        content = verification_email_content
            .replace('<span id="verification-code"></span>', verificationCode)
            .replace('<span>USER_NAME</span>', userName);;
    } else {
        content = forget_password_email_content
            .replace('<span> SWITCH_LINK <span>', `http://localhost:3000/reset-password/${id}?q=${verificationCode}`);
    }

    return sendHtmlEmail(userName, userEmailAddress, emailTitle, content);
}