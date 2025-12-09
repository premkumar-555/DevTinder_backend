const html = `<!DOCTYPE html>
<html>

<body style="margin:0; padding:0; background:#f4f4f6; font-family:Verdana, Geneva, Tahoma, sans-serif">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td align="center">
                <table width="600" cellpadding="20" cellspacing="0" style="background:#ffffff; margin-top:40px; border-radius:10px; 
                        box-shadow:0 2px 8px rgba(0,0,0,0.05);">

                    <!-- Logo + Company Name -->
                    <tr>
                        <td align="center" style="padding:10px 0 0;">
                            <div style="display:flex; align-items:center; justify-content:center; gap:5px;">
                                <span style="font-size:25px; line-height:1;">👨‍💻</span>
                                <span style="font-size:16px; font-weight:bold; color:#2d89ef; font-family:Arial;">
                                    devTinder
                                </span>
                            </div>
                        </td>
                    </tr>

                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding-bottom:0;">
                            <h3 style="color:#333; margin:0;">New Connection Request</h3>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding-top:10px;">
                            <p style="font-size:16px; color:#555;">
                                Hi <b>{{receiverName}}</b>,
                            </p>

                            <!-- Sender message -->
                            <div style="background:#f8f8ff; border-left:4px solid #2d89ef; 
                            padding:12px 16px; margin:20px 0; border-radius:6px; 
                            color:#555; font-size:15px; line-height:1.6;">
                                <b>{{reqFromUser}}</b> has sent a connection request to user <b>{{reqToUser}}</b>.
                            </div>


                            <p style="font-size:14px; color:#999; margin-top:20px;">
                                Warm regards,<br>
                                <b>{{appName}}</b>
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Footer -->
                <p style="font-size:13px; color:#999; margin-top:20px;">
                    © 2025 {{appName}} • All Rights Reserved
                </p>
            </td>
        </tr>
    </table>
</body>

</html>`;

const getMailTemplate = async (receiver, reqFromUser, reqToUser, appName) => {
  return new Promise((resolve, reject) => {
    try {
      const mailTemplate = html
        .replace(/{{receiverName}}/g, receiver)
        .replace(/{{reqFromUser}}/g, reqFromUser)
        .replace(/{{reqToUser}}/g, reqToUser)
        .replace(/{{appName}}/g, appName);
      resolve(mailTemplate);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = getMailTemplate;
