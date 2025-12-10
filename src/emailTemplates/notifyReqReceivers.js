function generateUsersList(fromUsers) {
  return fromUsers
    .map(
      (u) => `
      <div style="display:flex; align-items:center; margin-bottom:12px;">
        <img src="${u.profileUrl}" alt="profile" 
             style="width:48px; height:48px; border-radius:50%; object-fit:cover; margin-right:12px;" />
        <span style="font-size:16px; color:#333; font-weight:bold;">
          ${u.name}
        </span>
      </div>
    `
    )
    .join("");
}

function generateFullEmailHTML(receiver, receiverName, fromUsers = []) {
  const usersList = generateUsersList(fromUsers);

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Connection Request Notification</title>
  </head>

  <body style="margin:0; padding:0; background:#f4f4f4;">
    <div
      style="
        font-family: Arial, sans-serif;
        max-width: 650px;
        margin: auto;
        background: #ffffff;
        padding: 25px;
        border-radius: 8px;
      "
    >
      <div style="display:flex; align-items:center; margin-bottom:20px;">
        <div
          style="
            width:25px;
            height:25px;
            display:flex;
            justify-content:center;
            align-items:center;
            font-size:30px;
          "
        >
          👨‍💻
        </div>

        <span
          style="
            font-size:16px;
            font-weight:bold;
            margin-left:12px;
            color:#333;
          "
        >
          devTinder
        </span>
      </div>

      <p style="font-size:16px; color:#555;">
        Hi <strong>${receiver}</strong>,
      </p>

      <p style="font-size:17px; color:#333;">
        <strong>${receiverName}</strong> has received connection requests from the following users:
      </p>

      ${usersList}

      <p style="margin-top:30px; font-size:14px; color:#777;">
        Warm regards,<br />
        <strong>devTinder Team</strong>
      </p>
    </div>
  </body>
</html>
  `;
}

module.exports = generateFullEmailHTML;
