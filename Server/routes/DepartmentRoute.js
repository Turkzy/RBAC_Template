import express from "express";
import { getAllDepartments } from "../controllers/DepartmentController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/get-departments", authMiddleware, getAllDepartments);

export default router;
