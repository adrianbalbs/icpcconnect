import nodemailer from 'nodemailer';
import { verification_email_content, forget_password_email_content } from './email-template/index.js';

export async function sendEmail(
    userName: string,
    userEmailAddress: string,
    emailTitle: string,
    verificationCode: string,
    isNormalVerificationEmail: boolean
): Promise<string> {

    let content: string = verification_email_content;
    if (!isNormalVerificationEmail) {
        content = forget_password_email_content;
    }
    
    const updatedContent = content
        .replace('<span id="verification-code"></span>', verificationCode)
        .replace('<span>USER_NAME</span>', userName);

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
        html: updatedContent, // HTML body
        text: 'Hello, please verify your email using the code sent in the HTML body.', // Plain text body
    };
    try {
        await transporter.sendMail(mailOptions);
        return 'Email sent successfully!';
    } catch (error) {
        throw new Error(`Failed to send email: ${error}`);
    }
}