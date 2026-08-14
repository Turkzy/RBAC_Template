import express from "express";
import {
  listComplianceItems,
  getComplianceItem,
  createComplianceItem,
  updateComplianceItem,
  deleteComplianceItem,
  downloadComplianceFile,
  markComplianceItemRead,
  markAllComplianceItemsRead,
  deleteComplianceNotification,
  deleteComplianceNotificationPermanent,
  listNotificationRecords,
  restoreComplianceNotification,
  streamComplianceNotifications,
} from "../controllers/ComplianceController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { requirePermissionOrSuperAdmin } from "../middleware/rbacmiddleware.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

router.get("/stream", authMiddleware, streamComplianceNotifications);
router.get("/", authMiddleware, listComplianceItems);
router.get(
  "/notifications",
  authMiddleware,
  requirePermissionOrSuperAdmin(PERMISSIONS.RECORDS),
  listNotificationRecords,
);
router.get("/:id", authMiddleware, getComplianceItem);
router.post("/", authMiddleware, createComplianceItem);
router.patch("/:id/mark-read", authMiddleware, markComplianceItemRead);
router.delete("/:id/notification", authMiddleware, deleteComplianceNotification);
router.delete("/:id/notification/permanent", authMiddleware, deleteComplianceNotificationPermanent);
router.patch("/:id/notification/restore", authMiddleware, restoreComplianceNotification);
router.patch("/mark-all-read", authMiddleware, markAllComplianceItemsRead);
router.get("/:id/download", authMiddleware, downloadComplianceFile);
router.put("/:id", authMiddleware, updateComplianceItem);
router.delete("/:id", authMiddleware, deleteComplianceItem);

export default router;
