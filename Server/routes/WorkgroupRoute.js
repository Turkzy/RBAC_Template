import express from "express";
import {
  createWorkgroup,
  deleteWorkgroup,
  getAllWorkgroups,
  updateWorkgroup,
} from "../controllers/WorkgroupController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/get-workgroups", authMiddleware, getAllWorkgroups);
router.post("/create-workgroup", authMiddleware, createWorkgroup);
router.put("/update-workgroup/:id", authMiddleware, updateWorkgroup);
router.delete("/delete-workgroup/:id", authMiddleware, deleteWorkgroup);

export default router;