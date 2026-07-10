import express from "express";
import { requestPasswordReset, verifyResetToken, resetPassword } from "../controllers/PasswordResetController.js";
import { loginLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/request", loginLimiter, requestPasswordReset);
router.post("/verify", verifyResetToken);
router.post("/reset", resetPassword);

export default router;