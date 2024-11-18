export const forget_password_email_content = `<!DOCTYPE html>
<!-- Feel free to modify style things of the email content in this file. -->
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
</head>
<body>
    <!-- Please don't change line below -->
    <h1> Hi, user! To update your password, we have to first verify your identity.</h1>
    <p>Please click the link below to verify your email account.</p>
    <p>You will then be able to set a new password for your account.</p>

    <p> Your link is: <span> SWITCH_LINK <span>

    <!-- Please don't change this line below, since the rust will replace part of the code content in the line below. -->
    <p>Your verification code is: <span id="verification-code"></span></p>

    <p>If you did not request the verification, please disregard this email.</p>
</body>
</html>
`; // Provide as a html file content string. Feel free to adjust it if you want a different style.
