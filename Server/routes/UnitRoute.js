import express from "express";
import { getAllUnits } from "../controllers/UnitController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/get-units", authMiddleware, getAllUnits);

export default router;