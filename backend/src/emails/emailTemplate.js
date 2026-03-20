export const welcomeEmailTemplate = (username, clientURL) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Welcome to Chat-ting !</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;margin-top:40px;border-radius:10px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.08);">
            <tr>
              <td align="center" style="background:#4f46e5;padding:30px;color:white;font-size:24px;font-weight:bold;">
                Chatify
              </td>
            </tr>

            <tr>
              <td style="padding:40px;text-align:center;">
                <h2 style="margin:0;color:#333;">
                  Welcome to Chat-ting, ${username}! 🎉
                </h2>

                <p style="color:#555;font-size:16px;margin-top:15px;line-height:1.6;">
                  We're excited to have you join our messaging platform.
                  Chat-ting helps you connect with friends and colleagues instantly.
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

            <tr>
              <td style="padding:25px;text-align:center;background:#f9fafb;">
                <p style="margin:0;font-size:13px;color:#888;">
                  If you didn’t create this account, you can safely ignore this email.
                </p>

                <p style="margin-top:10px;font-size:12px;color:#aaa;">
                  © ${new Date().getFullYear()} Chat-ting. All rights reserved.
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

export const otpEmailTemplate = (otp) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Verify Your Email</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;margin-top:40px;border-radius:10px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.08);">

            <tr>
              <td align="center" style="background:#4f46e5;padding:30px;color:white;font-size:24px;font-weight:bold;">
                Chatify
              </td>
            </tr>

            <tr>
              <td style="padding:40px;text-align:center;">
                <h2 style="margin:0;color:#333;">Verify Your Email</h2>

                <p style="color:#555;font-size:16px;margin-top:15px;line-height:1.6;">
                  Use the OTP below to verify your Chat-ting account:
                </p>

                <div style="margin:30px 0;">
                  <span style="
                    display:inline-block;
                    padding:14px 24px;
                    font-size:28px;
                    font-weight:bold;
                    letter-spacing:6px;
                    color:#4f46e5;
                    background:#eef2ff;
                    border:1px solid #c7d2fe;
                    border-radius:8px;
                  ">
                    ${otp}
                  </span>
                </div>

                <p style="color:#555;font-size:14px;">
                  This OTP will expire in <b>10 minutes</b>.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:25px;text-align:center;background:#f9fafb;">
                <p style="margin:0;font-size:13px;color:#888;">
                  If you didn’t request this OTP, you can safely ignore this email.
                </p>

                <p style="margin-top:10px;font-size:12px;color:#aaa;">
                  © ${new Date().getFullYear()} Chat-ting. All rights reserved.
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

export const resetPasswordOtpTemplate = (otp) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Reset Your Password</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;margin-top:40px;border-radius:10px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.08);">

            <tr>
              <td align="center" style="background:#dc2626;padding:30px;color:white;font-size:24px;font-weight:bold;">
                Chatify
              </td>
            </tr>

            <tr>
              <td style="padding:40px;text-align:center;">
                <h2 style="margin:0;color:#333;">Reset Your Password</h2>

                <p style="color:#555;font-size:16px;margin-top:15px;line-height:1.6;">
                  Use the OTP below to reset your password:
                </p>

                <div style="margin:30px 0;">
                  <span style="
                    display:inline-block;
                    padding:14px 24px;
                    font-size:28px;
                    font-weight:bold;
                    letter-spacing:6px;
                    color:#dc2626;
                    background:#fee2e2;
                    border:1px solid #fecaca;
                    border-radius:8px;
                  ">
                    ${otp}
                  </span>
                </div>

                <p style="color:#555;font-size:14px;">
                  This OTP will expire in <b>10 minutes</b>.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:25px;text-align:center;background:#f9fafb;">
                <p style="margin:0;font-size:13px;color:#888;">
                  If you didn’t request a password reset, ignore this email.
                </p>

                <p style="margin-top:10px;font-size:12px;color:#aaa;">
                  © ${new Date().getFullYear()} Chat-ting. All rights reserved.
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