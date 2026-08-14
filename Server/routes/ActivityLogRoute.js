import express from "express";
import { listActivityLogs, getActivityLog, cleanupActivityLogs } from "../controllers/ActivityLogController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { requirePermission } from "../middleware/rbacmiddleware.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

router.get("/", authMiddleware, requirePermission(PERMISSIONS.AUDIT_LOGS_VIEW), listActivityLogs);
router.get("/:id", authMiddleware, requirePermission(PERMISSIONS.AUDIT_LOGS_VIEW), getActivityLog);
router.post("/retention", authMiddleware, requirePermission(PERMISSIONS.AUDIT_LOGS_MANAGE), cleanupActivityLogs);

export default router;
