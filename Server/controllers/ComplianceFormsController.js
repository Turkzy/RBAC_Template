import ComplianceForms from "../models/ComplianceForms.js";
import ComplianceFormsTitle from "../models/ComplianceFormsTitle.js";
import { recordActivity } from "../services/activityService.js";
import {
  buildCreateDescription,
  buildDeleteDescription,
  buildUpdateDescription,
} from "../utils/activityLogMessage.js";

// GET all forms (optionally filtered by title)
export const getAllForms = async (req, res) => {
  try {
    const { titleId } = req.query;
    const where = titleId ? { ComplianceFormsTitleId: titleId } : {};

    const forms = await ComplianceForms.findAll({
      where,
      include: [
        {
          model: ComplianceFormsTitle,
          attributes: ["id", "title"],
        },
      ],
      order: [["id", "ASC"]],
    });

    return res.status(200).json({ error: false, data: forms });
  } catch (error) {
    console.error("Get forms error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// GET single form
export const getFormById = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await ComplianceForms.findByPk(id, {
      include: [
        {
          model: ComplianceFormsTitle,
          attributes: ["id", "title"],
        },
      ],
    });

    if (!form) {
      return res.status(404).json({ error: true, message: "Form not found" });
    }

    return res.status(200).json({ error: false, data: form });
  } catch (error) {
    console.error("Get form error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// CREATE new form under a title
export const createForm = async (req, res) => {
  try {
    const { ComplianceFormsTitleId, formName } = req.body;

    if (!ComplianceFormsTitleId) {
      return res.status(400).json({ error: true, message: "Title ID is required" });
    }

    if (!formName || formName.trim() === "") {
      return res.status(400).json({ error: true, message: "Form name is required" });
    }

    // Verify title exists
    const title = await ComplianceFormsTitle.findByPk(ComplianceFormsTitleId);
    if (!title) {
      return res.status(404).json({ error: true, message: "Title not found" });
    }

    const newForm = await ComplianceForms.create({
      ComplianceFormsTitleId,
      formName: formName.trim(),
    });

    await recordActivity(
      req,
      "create",
      buildCreateDescription("compliance form", newForm.formName || newForm.id),
      {
        entity: "compliance_form",
        complianceFormId: newForm.id,
        complianceTitleId: Number(ComplianceFormsTitleId),
      }
    );

    return res.status(201).json({ error: false, data: newForm, message: "Form created successfully" });
  } catch (error) {
    console.error("Create form error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// UPDATE form
export const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { formName } = req.body;

    const form = await ComplianceForms.findByPk(id);
    if (!form) {
      return res.status(404).json({ error: true, message: "Form not found" });
    }

    if (formName !== undefined && (formName === "" || formName === null)) {
      return res.status(400).json({ error: true, message: "Form name cannot be empty" });
    }

    const beforeName = form.formName;

    await form.update({
      formName: formName !== undefined ? formName.trim() : form.formName,
    });

    if (beforeName !== form.formName) {
      const changeDetails = [{ field: "formName", before: beforeName, after: form.formName }];
      await recordActivity(
        req,
        "update",
        buildUpdateDescription("compliance form", changeDetails, { target: form.formName }),
        {
          entity: "compliance_form",
          complianceFormId: form.id,
          complianceTitleId: form.ComplianceFormsTitleId,
          changes: changeDetails,
        }
      );
    }

    return res.status(200).json({ error: false, data: form, message: "Form updated successfully" });
  } catch (error) {
    console.error("Update form error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// DELETE form
export const deleteForm = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await ComplianceForms.findByPk(id);
    if (!form) {
      return res.status(404).json({ error: true, message: "Form not found" });
    }

    const formNameValue = form.formName;
    const titleId = form.ComplianceFormsTitleId;
    await form.destroy();

    await recordActivity(
      req,
      "delete",
      buildDeleteDescription("compliance form", formNameValue || id),
      {
        entity: "compliance_form",
        complianceFormId: Number(id),
        complianceTitleId: titleId,
      }
    );

    return res.status(200).json({ error: false, message: "Form deleted successfully" });
  } catch (error) {
    console.error("Delete form error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

