import express from "express";
import {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  updateDepartment,
} from "../controllers/DepartmentController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/get-departments", authMiddleware, getAllDepartments);
router.post("/create-department", authMiddleware, createDepartment);
router.put("/update-department/:id", authMiddleware, updateDepartment);
router.delete("/delete-department/:id", authMiddleware, deleteDepartment);

export default router;
