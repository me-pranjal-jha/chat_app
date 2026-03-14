import { resendClient, sender } from "./resend.js";
import { welcomeEmailTemplate } from "./emailTemplate.js";

export const sendWelcomeEmail = async (email, username, clientURL) => {
  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: [email],
    subject: "Welcome to Chatify! 🎉",
    html: welcomeEmailTemplate(username, clientURL)
  });

  if (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send welcome email. Please try again later.");
  }

  console.log("Welcome email sent successfully:", data);
};