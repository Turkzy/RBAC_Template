import User from "../models/UserModel.js";
import PasswordReset from "../models/PasswordResetModel.js";
import { generateResetToken, hashResetToken, sendForgotPasswordEmail, sendPasswordResetConfirmation } from "../services/mailService.js";
import { recordActivity } from "../services/activityService.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

// Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: true, message: "Email is required" });
    }

    const user = await User.findOne({ where: { email } });
    
    // For security: don't reveal if email exists
    if (!user) {
      return res.status(200).json({ 
        error: false, 
        message: "If an account with that email exists, a password reset link will be sent" 
      });
    }

    // Invalidate existing reset tokens
    await PasswordReset.update(
      { usedAt: new Date() },
      { where: { userId: user.id, usedAt: null } }
    );

    // Generate new reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await PasswordReset.create({
      userId: user.id,
      resetTokenHash: hashResetToken(resetToken),
      expiresAt,
    });

    // Send email without blocking the response to avoid client timeouts
    void sendForgotPasswordEmail(email, resetToken).catch((sendError) => {
      console.error("⚠️ Password reset email send failed:", sendError?.message || sendError);
    });

    // Log activity
    await recordActivity(req, "password_reset_requested", `Password reset requested for ${email}`, {
      email,
    });

    return res.status(200).json({ 
      error: false, 
      message: "Password reset email sent successfully" 
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// Verify reset token
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: true, message: "Token is required" });
    }

    const resetRecord = await PasswordReset.findOne({
      where: {
        resetTokenHash: hashResetToken(token),
        usedAt: null,
        expiresAt: { [Op.gt]: new Date() }, // Not expired
      },
    });

    if (!resetRecord) {
      return res.status(400).json({ error: true, message: "Invalid or expired reset token" });
    }

    return res.status(200).json({ 
      error: false, 
      message: "Token is valid",
      userId: resetRecord.userId 
    });
  } catch (error) {
    console.error("Verify token error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: true, message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: true, message: "Passwords do not match" });
    }

    const resetRecord = await PasswordReset.findOne({
      where: {
        resetTokenHash: hashResetToken(token),
        usedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!resetRecord) {
      return res.status(400).json({ error: true, message: "Invalid or expired reset token" });
    }
    
    const user = await User.findByPk(resetRecord.userId);
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await user.update({ password: hashedPassword });

    // Mark token as used
    await resetRecord.update({ usedAt: new Date() });

    // Send confirmation email without blocking the response
    void sendPasswordResetConfirmation(user.email).catch((emailError) => {
      console.error("⚠️ Email send failed (but password was reset):", emailError?.message || emailError);
    });

    // Log activity
    try {
      await recordActivity(req, "password_reset", `Password reset completed for ${user.email}`, {
        userId: user.id,
        email: user.email,
      });
    } catch (logError) {
      console.error("⚠️ Activity log failed:", logError.message);
    }

    return res.status(200).json({ 
      error: false, 
      message: "Password reset successfully" 
    });
  } catch (error) {
    console.error("❌ Reset password error:", error?.message || error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};