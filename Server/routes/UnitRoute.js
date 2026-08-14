import express from "express";
import { createUnit, deleteUnit, getAllUnits, updateUnit } from "../controllers/UnitController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/get-units", authMiddleware, getAllUnits);
router.post("/create-unit", authMiddleware, createUnit);
router.put("/update-unit/:id", authMiddleware, updateUnit);
router.delete("/delete-unit/:id", authMiddleware, deleteUnit);

export default router;