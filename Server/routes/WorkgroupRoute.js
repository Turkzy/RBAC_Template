import express from "express";
import { getAllWorkgroups } from "../controllers/WorkgroupController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/get-workgroups", authMiddleware, getAllWorkgroups);

export default router;