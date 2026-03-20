import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPmail = async (to, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Email Verification OTP</h2>
          <p>Your OTP for signup verification is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Signup OTP email error:", error);
      throw new Error("Failed to send signup OTP");
    }

    return data;
  } catch (err) {
    console.error("sendOTPmail error:", err);
    throw err;
  }
};

export const sendWelcomeEmail = async (to, fullname, clientUrl) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Welcome to Chat App 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Welcome, ${fullname} 🎉</h2>
          <p>Your account has been verified successfully.</p>
          <p>You can now use the app.</p>
          <a href="${clientUrl}" target="_blank">Open Chat App</a>
        </div>
      `,
    });

    if (error) {
      console.error("Welcome email error:", error);
      throw new Error("Failed to send welcome email");
    }

    return data;
  } catch (err) {
    console.error("sendWelcomeEmail error:", err);
    throw err;
  }
};

export const sendResetPasswordOTPmail = async (to, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Password Reset OTP</h2>
          <p>You requested to reset your password.</p>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Reset password OTP email error:", error);
      throw new Error("Failed to send reset password OTP");
    }

    return data;
  } catch (err) {
    console.error("sendResetPasswordOTPmail error:", err);
    throw err;
  }
};