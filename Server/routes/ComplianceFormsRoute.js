import express from "express";
import * as ComplianceFormsTitleController from "../controllers/ComplianceFormsTitleController.js";
import * as ComplianceFormsController from "../controllers/ComplianceFormsController.js";
import * as ComplianceSubFormsController from "../controllers/ComplianceSubFormsController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

// Protect all routes with authentication
router.use(authMiddleware);

// ==================== Compliance Forms Title Routes ====================

// GET all titles with forms
router.get("/titles", ComplianceFormsTitleController.getAllTitles);

// GET single title with forms
router.get("/titles/:id", ComplianceFormsTitleController.getTitleById);

// CREATE new title
router.post("/titles", ComplianceFormsTitleController.createTitle);

// UPDATE title
router.put("/titles/:id", ComplianceFormsTitleController.updateTitle);

// DELETE title (cascades to forms)
router.delete("/titles/:id", ComplianceFormsTitleController.deleteTitle);

// ==================== Compliance Forms Routes ====================

// GET all forms (optionally filter by titleId query param)
router.get("/forms", ComplianceFormsController.getAllForms);

// GET single form
router.get("/forms/:id", ComplianceFormsController.getFormById);

// CREATE new form under a title
router.post("/forms", ComplianceFormsController.createForm);

// UPDATE form
router.put("/forms/:id", ComplianceFormsController.updateForm);

// DELETE form
router.delete("/forms/:id", ComplianceFormsController.deleteForm);

// ==================== Compliance Subform Routes ====================

// GET all subforms (optionally filter by formId query param)
router.get("/subforms", ComplianceSubFormsController.getAllSubForms);

// GET single subform
router.get("/subforms/:id", ComplianceSubFormsController.getSubFormById);

// CREATE new subform under a form
router.post("/subforms", ComplianceSubFormsController.createSubForm);

// UPDATE subform
router.put("/subforms/:id", ComplianceSubFormsController.updateSubForm);

// DELETE subform
router.delete("/subforms/:id", ComplianceSubFormsController.deleteSubForm);

export default router;
