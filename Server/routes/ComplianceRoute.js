import express from "express";
import {
  listComplianceItems,
  createComplianceItem,
  updateComplianceItem,
  deleteComplianceItem,
} from "../controllers/ComplianceController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, listComplianceItems);
router.post("/", authMiddleware, createComplianceItem);
router.put("/:id", authMiddleware, updateComplianceItem);
router.delete("/:id", authMiddleware, deleteComplianceItem);

export default router;
