import express from "express";
import { getAllNotificationRules, updateNotificationRule } from "../controllers/NotificationruleController.js";
import { PERMISSIONS } from "../constants/permissions.js";

import { authMiddleware } from "../middleware/authmiddleware.js";
import { requirePermission, requirePermissionOrSuperAdminMultiple } from "../middleware/rbacmiddleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  requirePermissionOrSuperAdminMultiple([
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_RULES_MANAGE,
  ]),
  getAllNotificationRules
);

router.patch(
  "/:id",
  authMiddleware,
  requirePermission(PERMISSIONS.NOTIFICATIONS_RULES_MANAGE),
  updateNotificationRule
);

export default router;