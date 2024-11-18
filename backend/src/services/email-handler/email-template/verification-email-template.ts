export const verification_email_content = `<!DOCTYPE html>
<!-- Feel free to modify style things of the email content in this file. -->
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
</head>
<body>
    <!-- Please don't change line below -->
    <h1> Hi, <span>USER_NAME</span>! Welcome to ICPC Connect!</h1>
    <p>Please enter the verification code in the website to verify your email account.</p>

    <!-- Please don't change this line below, since the rust will replace part of the code content in the line below. -->
    <p>Your verification code is: <span id="verification-code"></span></p>

    <p>If you did not request the verification, please disregard this email.</p>
</body>
</html>
`; // Provide as a html file content string. Feel free to adjust it if you want a different style.
