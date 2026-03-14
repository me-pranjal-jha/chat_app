export const welcomeEmailTemplate = (username, clientURL) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Welcome to Chatify</title>
  </head>

  <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;margin-top:40px;border-radius:10px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.08);">

            <!-- Header -->
            <tr>
              <td align="center" style="background:#4f46e5;padding:30px;color:white;font-size:24px;font-weight:bold;">
                Chatify
              </td>
            </tr>

            <!-- Welcome Section -->
            <tr>
              <td style="padding:40px;text-align:center;">
                <h2 style="margin:0;color:#333;">
                  Welcome to Chatify, ${username}! 🎉
                </h2>

                <p style="color:#555;font-size:16px;margin-top:15px;line-height:1.6;">
                  We're excited to have you join our messaging platform.  
                  Chatify helps you connect with friends and colleagues instantly.
                </p>

                <a 
                  href="${clientURL}"
                  style="
                    display:inline-block;
                    margin-top:25px;
                    padding:14px 26px;
                    background:#4f46e5;
                    color:white;
                    text-decoration:none;
                    font-weight:bold;
                    border-radius:6px;
                    font-size:15px;
                  "
                >
                  Start Chatting
                </a>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:25px;text-align:center;background:#f9fafb;">
                <p style="margin:0;font-size:13px;color:#888;">
                  If you didn’t create this account, you can safely ignore this email.
                </p>

                <p style="margin-top:10px;font-size:12px;color:#aaa;">
                  © ${new Date().getFullYear()} Chatify. All rights reserved.
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};