import express from "express";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { requirePermissionOrSuperAdmin } from "../middleware/rbacmiddleware.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { getSystemSetting, upsertSystemSetting } from "../controllers/SystemSettingController.js";

const router = express.Router();

router.get("/:key", authMiddleware, requirePermissionOrSuperAdmin(PERMISSIONS.SYSTEM_SETTINGS_MANAGE), getSystemSetting);
router.put("/", authMiddleware, requirePermissionOrSuperAdmin(PERMISSIONS.SYSTEM_SETTINGS_MANAGE), upsertSystemSetting);

export default router;
