import { resendClient, sender } from "./resend.js";
import {
  welcomeEmailTemplate,
  otpEmailTemplate,
  resetPasswordOtpTemplate,
} from "./emailTemplate.js";

export const sendWelcomeEmail = async (email, username, clientURL) => {
  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: [email],
    subject: "Welcome to Chatify! 🎉",
    html: welcomeEmailTemplate(username, clientURL),
  });

  if (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send welcome email. Please try again later.");
  }

  console.log("Welcome email sent successfully:", data);
};

export const sendOTPmail = async (email, otp) => {
  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: [email],
    subject: "Verify your email - Chatify OTP",
    html: otpEmailTemplate(otp),
  });

  if (error) {
    console.error("OTP email sending failed:", error);
    throw new Error("Failed to send OTP email. Please try again later.");
  }

  console.log("OTP email sent successfully:", data);
};

export const sendResetPasswordOTPmail = async (email, otp) => {
  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: [email],
    subject: "Reset your password - Chatify OTP",
    html: resetPasswordOtpTemplate(otp),
  });

  if (error) {
    console.error("Reset OTP email sending failed:", error);
    throw new Error("Failed to send reset OTP email. Please try again later.");
  }

  console.log("Reset OTP email sent successfully:", data);
};