import nodemailer from 'nodemailer';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

export async function sendEmail(
    userName: string,
    userEmailAddress: string,
    emailTitle: string,
    verificationCode: string
): Promise<string> {
    // const __filename = fileURLToPath(import.meta.url);
    // const __dirname = path.dirname(__filename);

    // const templatePath = path.join(__dirname, 'verification-email-template.html');
    // let content: string;

    // try {
    //     content = fs.readFileSync(templatePath, 'utf-8');
    // } catch (e) {
    //     throw new Error(`Failed to read HTML template: ${e}`);
    // }
    let content: string = `<!DOCTYPE html>
    <!-- Feel free to modify style things of the email content in this file. -->
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Template</title>
    </head>
    <body>
        <!-- Please don't change line below -->
        <h1> Hi, <span>USER_NAME</span>! Welcome to ICPC!</h1>
        <p>Please enter the verification code in the website to verify your email account.</p>
    
        <!-- Please don't change this line below, since the rust will replace part of the code content in the line below. -->
        <p>Your verification code is: <span id="verification-code"></span></p>
    
        <p>If you did not request the verification, please disregard this email.</p>
    </body>
    </html>`;
    
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