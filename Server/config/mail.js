import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  throw new Error("Missing Gmail SMTP configuration. Please set GMAIL_USER and GMAIL_APP_PASSWORD in your environment.");
}

// Create transporter for Gmail SMTP
export const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Test connection on startup
export const testMailConnection = async () => {
  const retries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mailTransporter.verify();
      console.log("✓ Gmail SMTP connection successful");
      return;
    } catch (error) {
      lastError = error;
      console.warn(`Gmail SMTP verification attempt ${attempt}/${retries} failed:`, error.message);

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  console.error("✗ Gmail SMTP connection failed after retries:", lastError?.message || "Unknown error");
};

// Send email helper
export const sendEmail = async (to, subject, htmlContent) => {
  try {
    await mailTransporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html: htmlContent,
      text: htmlContent
        .replace(/<style>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
      replyTo: process.env.GMAIL_USER,
    });
  } catch (error) {
    console.error("Error sending email:", error?.message || error);
    throw new Error("Failed to send email. Please verify SMTP configuration and credentials.");
  }
};