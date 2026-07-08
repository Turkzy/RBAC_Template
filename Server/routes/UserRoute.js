import express from "express";
import { createAccount, deleteUser, getAllUsers, login, logout, updateUser, verifyAuth, setTwoFactor, trustDevice } from "../controllers/UserController.js"
import { authMiddleware } from "../middleware/authmiddleware.js";
import { accountManagementLimiter, loginLimiter, registerLimiter } from "../middleware/rateLimiter.js";
import { passwordValidationRules, handleValidationErrors, optionalPasswordValidationRules } from "../validations/passwordValidation.js";
import { requirePermission, requirePermissionOrSelf } from "../middleware/rbacmiddleware.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

router.post("/create-account", authMiddleware, requirePermission(PERMISSIONS.ACCOUNTS_CREATE), registerLimiter, passwordValidationRules, handleValidationErrors, createAccount);
router.post("/login", loginLimiter, login);
router.post("/set-2fa", authMiddleware, setTwoFactor);
router.post("/trust-device", authMiddleware, trustDevice);
router.post("/logout", authMiddleware, logout);
router.get("/verify", authMiddleware, verifyAuth);

router.get("/get-users", authMiddleware, requirePermission(PERMISSIONS.ACCOUNTS_MANAGE), getAllUsers);
router.put("/update-user/:id", authMiddleware, requirePermissionOrSelf(PERMISSIONS.ACCOUNTS_UPDATE), accountManagementLimiter, optionalPasswordValidationRules, handleValidationErrors, updateUser);
router.delete("/delete-user/:id", authMiddleware, requirePermission(PERMISSIONS.ACCOUNTS_DELETE), accountManagementLimiter, deleteUser);

export default router;