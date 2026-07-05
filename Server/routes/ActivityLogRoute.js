import express from "express";
import { listActivityLogs, getActivityLog, cleanupActivityLogs } from "../controllers/ActivityLogController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

// Only allow authorized users with auditing permission — middleware should check permissions
router.get("/", authMiddleware, listActivityLogs);
router.get("/:id", authMiddleware, getActivityLog);
router.post("/retention", authMiddleware, cleanupActivityLogs);

export default router;
