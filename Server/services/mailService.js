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
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 20px;
            min-height: 100vh;
          }
          
          .wrapper {
            max-width: 600px;
            margin: 0 auto;
          }
          
          .container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }
          
          .content {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.8;
          }
          
          .greeting {
            font-size: 16px;
            margin-bottom: 20px;
          }
          
          .greeting strong {
            font-weight: 600;
          }
          
          .info-box {
            background-color: #ecfdf5;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 25px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #047857;
          }
          
          .cta-section {
            text-align: center;
            margin: 35px 0;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 14px 40px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
          }
          
          .link-section {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
          
          .link-label {
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
            display: block;
          }
          
          .link-box {
            background-color: #f9f9f9;
            padding: 12px;
            border-radius: 6px;
            word-break: break-all;
            font-size: 12px;
            color: #555;
            font-family: 'Courier New', monospace;
            border: 1px solid #e0e0e0;
          }
          
          .security-notice {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #856404;
          }
          
          .security-notice strong {
            font-weight: 600;
          }
          
          .ignore-notice {
            background-color: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #01579b;
          }
          
          .footer {
            background-color: #f8f9fa;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
          }
          
          .footer p {
            font-size: 12px;
            color: #666;
            margin: 5px 0;
          }
          
          .footer-links {
            margin: 10px 0;
            font-size: 12px;
          }
          
          .footer-links a {
            color: #10b981;
            text-decoration: none;
            margin: 0 10px;
          }
          
          .footer-links a:hover {
            text-decoration: underline;
          }
          
          .divider {
            height: 1px;
            background-color: #e0e0e0;
            margin: 20px 0;
          }
          
          @media (max-width: 600px) {
            .header h1 {
              font-size: 24px;
            }
            
            .content {
              padding: 25px 20px;
            }
            
            .cta-button {
              padding: 12px 30px;
              font-size: 14px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <!-- Header -->
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            
            <!-- Content -->
            <div class="content">
              <p class="greeting">Hello <strong>${safeEmail}</strong>,</p>
              
              <p>We received a password reset request for your NDC CMS account. If you initiated this request, please follow the steps below to create a new password.</p>
              
              <div class="ignore-notice">
                <strong>Didn't request this?</strong> You can safely ignore this email. If you believe this was sent in error, please contact our security team immediately.
              </div>
              
              <!-- CTA Button -->
              <div class="cta-section">
                <p style="font-weight: 600; margin-bottom: 15px;">Click the button below to reset your password:</p>
                <a href="${safeResetLink}" class="cta-button">Reset My Password</a>
              </div>
              
              <!-- Alternative Link -->
              <div class="link-section">
                <span class="link-label">Or copy and paste this link in your browser:</span>
                <div class="link-box">${safeResetLink}</div>
              </div>
              
              <!-- Security Notice -->
              <div class="security-notice">
                <strong>⏰ Link Expires:</strong> This password reset link will expire in <strong>1 hour</strong> for your security. If it expires, you can request a new one.
              </div>
              
              <div class="info-box">
                <strong>💡 Security Tips:</strong>
                <ul style="margin: 8px 0 0 20px; padding: 0;">
                  <li>Never share your password with anyone</li>
                  <li>Use a strong, unique password</li>
                  <li>Enable two-factor authentication for added security</li>
                </ul>
              </div>
              
              <p style="margin-top: 25px;">If you have any questions or need assistance, our support team is here to help.</p>
              
              <p style="margin-top: 20px;">Best regards,<br><strong>The NDC CMS Team</strong></p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p><strong>NDC CMS</strong></p>
              <div class="divider"></div>
              <p>This is an automated security email. Please do not reply to this message.</p>
              <div class="footer-links">
                <a href="#">Support</a> | <a href="#">Privacy Policy</a> | <a href="#">Security</a>
              </div>
              <p style="margin-top: 15px; color: #999;">© 2026 NDC CMS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
  
  await sendEmail(email, "🔐 Password Reset Request - NDC CMS", htmlContent);
};

// Send password reset confirmation
export const sendPasswordResetConfirmation = async (email) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed Successfully</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
          }
          
          .wrapper {
            max-width: 600px;
            margin: 0 auto;
          }
          
          .container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }
          
          .success-icon {
            font-size: 32px;
          }
          
          .content {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.8;
          }
          
          .greeting {
            font-size: 16px;
            margin-bottom: 20px;
          }
          
          .greeting strong {
            font-weight: 600;
          }
          
          .success-message {
            background-color: #ecfdf5;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 25px 0;
            border-radius: 6px;
            font-size: 16px;
            color: #047857;
            font-weight: 500;
          }
          
          .info-box {
            background-color: #f0f4ff;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #444;
          }
          
          .info-box strong {
            font-weight: 600;
          }
          
          .warning-box {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #991b1b;
          }
          
          .warning-box strong {
            font-weight: 600;
          }
          
          .action-list {
            margin: 20px 0;
          }
          
          .action-list li {
            margin: 10px 0;
            padding-left: 25px;
            position: relative;
          }
          
          .action-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
          }
          
          .divider {
            height: 1px;
            background-color: #e0e0e0;
            margin: 25px 0;
          }
          
          .footer {
            background-color: #f8f9fa;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
          }
          
          .footer p {
            font-size: 12px;
            color: #666;
            margin: 5px 0;
          }
          
          .footer-links {
            margin: 10px 0;
            font-size: 12px;
          }
          
          .footer-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
          }
          
          .footer-links a:hover {
            text-decoration: underline;
          }
          
          @media (max-width: 600px) {
            .header h1 {
              font-size: 24px;
            }
            
            .content {
              padding: 25px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <!-- Header -->
            <div class="header">
              <h1><span class="success-icon">✓</span> Password Updated</h1>
            </div>
            
            <!-- Content -->
            <div class="content">
              <p class="greeting">Hello <strong>${escapeHtml(email)}</strong>,</p>
              
              <div class="success-message">
                Your password has been successfully reset! You can now log in with your new password.
              </div>
              
              <p>Your password change took effect immediately. Here's what you should know:</p>
              
              <ul class="action-list">
                <li>Your new password is now active and required for all future logins</li>
                <li>Any previous login sessions on other devices may remain active for security auditing</li>
                <li>Two-factor authentication (if enabled) will be required on your next login</li>
              </ul>
              
              <div class="warning-box">
                <strong>⚠️ Security Alert:</strong> If you did not initiate this password change, please contact our security team immediately at <a href="mailto:security@example.com" style="color: #991b1b; text-decoration: underline;">security@example.com</a>
              </div>
              
              <div class="info-box">
                <strong>💡 Security Recommendations:</strong>
                <ul style="margin: 8px 0 0 20px; padding: 0;">
                  <li>Enable two-factor authentication for enhanced security</li>
                  <li>Review your account activity regularly</li>
                  <li>Never share your password with anyone</li>
                  <li>Use unique passwords for different accounts</li>
                </ul>
              </div>
              
              <div class="divider"></div>
              
              <p>If you have any questions or need further assistance, please don't hesitate to reach out to our support team.</p>
              
              <p style="margin-top: 20px;">Best regards,<br><strong>The NDC CMS Team</strong></p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p><strong>NDC CMS</strong></p>
              <p style="margin: 10px 0;">This is an automated security notification. Please do not reply to this message.</p>
              <div class="footer-links">
                <a href="#">Support</a> | <a href="#">Privacy Policy</a> | <a href="#">Security</a>
              </div>
              <p style="margin-top: 15px; color: #999;">© 2026 NDC CMS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
  
  await sendEmail(email, "✓ Your Password Has Been Changed - NDC CMS", htmlContent);
};