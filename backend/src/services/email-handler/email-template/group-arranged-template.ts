export const group_arranged_email_content = `<!DOCTYPE html>
<!-- Feel free to modify style things of the email content in this file. -->
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
</head>
<body>
    <!-- You can change the style of the line below, but DON'T CHANGE ANY <span> related stuff, backend program will swap them. -->
    <h1> Hi, <span> USER_NAME <span>! You have been arranged into a group for the ICPC contest. </h1>
    <p> Your group name is <span> GROUP_NAME <span>, <span> GROUP_MEMBERS <span><p>

    <p>If you did not attend ICPC, please disregard this email.</p>
</body>
</html>
`; // Provide as a html file content string. Feel free to adjust it if you want a different style.
