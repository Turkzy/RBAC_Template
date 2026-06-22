import express from "express";
import { createAccount, deleteUser, getAllUsers, login, logout, updateUser, verifyAuth } from "../controllers/UserController.js"
import { authMiddleware } from "../middleware/authmiddleware.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimiter.js";
import { passwordValidationRules, handleValidationErrors, optionalPasswordValidationRules } from "../validations/passwordValidation.js";
import { requirePermission } from "../middleware/rbacmiddleware.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

router.post("/create-account", registerLimiter, passwordValidationRules, handleValidationErrors, createAccount);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/verify", authMiddleware, verifyAuth);

router.get("/get-users", authMiddleware, requirePermission(PERMISSIONS.USERS_VIEW), getAllUsers);
router.put("/update-user/:id", authMiddleware, requirePermission(PERMISSIONS.USERS_UPDATE), optionalPasswordValidationRules, handleValidationErrors, updateUser);
router.delete("/delete-user/:id", authMiddleware, requirePermission(PERMISSIONS.USERS_DELETE), deleteUser);

export default router;