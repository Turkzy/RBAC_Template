import { sendEmail } from "../config/mail.js";
import crypto from "crypto";

export const escapeHtml = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

// Generate reset token
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Hash reset token for secure storage
export const hashResetToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Send forgot password email
export const sendForgotPasswordEmail = async (email, resetToken) => {
  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    throw new Error("Missing FRONTEND_URL environment variable for reset email links.");
  }

  const resetLink = new URL("/reset-password", frontendUrl);
  resetLink.searchParams.set("token", resetToken);

  const safeResetLink = escapeHtml(resetLink.toString());
  const safeEmail = escapeHtml(email);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #333; margin: 0; }
          .content { color: #555; line-height: 1.6; }
          .button { display: inline-block; background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { color: #d9534f; font-size: 12px; margin-top: 20px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset the password for your NDC CMS account.</p>
            <p>If you did not make this request, you can safely ignore this email.</p>
            
            <p><strong>To reset your password, click the button below:</strong></p>
            
            <center>
              <a href="${safeResetLink}" class="button">Reset Password</a>
            </center>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background-color: #f9f9f9; padding: 10px; border-radius: 4px;">
              ${safeResetLink}
            </p>
            
            <p class="warning">
              ⏰ <strong>Note:</strong> This link will expire in 1 hour for security reasons.
            </p>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br><strong>NDC CMS Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2026 NDC CMS. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  await sendEmail(email, "Password Reset Request - NDC CMS", htmlContent);
};

// Send password reset confirmation
export const sendPasswordResetConfirmation = async (email) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; }
          .success { color: #5cb85c; text-align: center; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">
            <h1>✓ Password Changed Successfully</h1>
          </div>
          
          <p>Your password has been successfully reset.</p>
          <p>You can now log in with your new password.</p>
          
          <p style="color: #d9534f;">
            <strong>If you did not make this change, please contact support immediately.</strong>
          </p>
          
          <div class="footer">
            <p>© 2026 NDC CMS. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  await sendEmail(email, "Password Reset Successful - NDC CMS", htmlContent);
};