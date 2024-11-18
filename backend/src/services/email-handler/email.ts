import nodemailer from "nodemailer";
import {
  forget_password_email_content,
  verification_email_content,
} from "./email-template/index.js";
import { group_arranged_email_content } from "./email-template/group-arranged-template.js";
import { SendTeamAllocationEmail } from "../../schemas/index.js";
import { env, isProdEnv } from "../../env.js";

const frontendUrl = isProdEnv(env) ? env.FRONTEND_URL : "http://localhost:3000";

export async function sendHtmlEmail(
  userName: string,
  userEmailAddress: string,
  emailTitle: string,
  htmlContent: string,
): Promise<string> {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_SERVER,
    port: env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: '"No Reply" <noreply@yourdomain.com>',
    to: `${userName} <${userEmailAddress}>`,
    subject: emailTitle,
    html: htmlContent,
    text: "Hello, please verify your email using the code sent in the HTML body.",
  };

  try {
    await transporter.sendMail(mailOptions);
    return "Email sent successfully!";
  } catch (error) {
    throw new Error(`Failed to send email: ${error}`);
  }
}

export async function sendGroupArrangedEmail(
  userName: string,
  userEmailAddress: string,
  emailTitle: string,
  teamName: string,
  allMembersName: string[],
): Promise<string> {
  let memberNameString;
  const otherMembers = allMembersName.filter((name) => name !== userName);
  if (otherMembers.length > 0) {
    memberNameString = "and your other team members include: ";
    memberNameString += otherMembers.join(", ");
    memberNameString += ".";
  } else {
    memberNameString = "and you are currently the only one in the group.";
  }
  const content = group_arranged_email_content
    .replace("<span> USER_NAME <span>", userName)
    .replace("<span> GROUP_NAME <span>", teamName)
    .replace("<span> GROUP_MEMBERS <span>", memberNameString);
  return sendHtmlEmail(userName, userEmailAddress, emailTitle, content);
}

export async function sendTeamAllocationEmails(
  req: SendTeamAllocationEmail,
): Promise<void> {
  const { name, memberNames, memberEmails } = req;
  for (let i = 0; i < memberNames.length; ++i) {
    const memberName = memberNames[i];
    const memberEmail = memberEmails[i];
    sendGroupArrangedEmail(
      memberName,
      memberEmail,
      "You have been allocated into an ICPC group",
      name,
      memberNames,
    );
  }
}

export async function sendEmail(
  userName: string,
  userEmailAddress: string,
  emailTitle: string,
  verificationCode: string,
  id?: string,
): Promise<string> {
  let content: string;

  if (id === undefined || id === null) {
    content = verification_email_content
      .replace('<span id="verification-code"></span>', verificationCode)
      .replace("<span>USER_NAME</span>", userName);
  } else {
    content = forget_password_email_content.replace(
      "<span> SWITCH_LINK <span>",
      `${frontendUrl}/reset-password/${id}?q=${verificationCode}`,
    );
  }

  return sendHtmlEmail(userName, userEmailAddress, emailTitle, content);
}
