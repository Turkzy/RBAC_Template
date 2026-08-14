import ComplianceSubForms from "../models/ComplianceSubForms.js";
import ComplianceForms from "../models/ComplianceForms.js";
import { recordActivity } from "../services/activityService.js";
import {
  buildCreateDescription,
  buildDeleteDescription,
  buildUpdateDescription,
} from "../utils/activityLogMessage.js";

const deleteSubFormBranch = async (subFormId) => {
  const children = await ComplianceSubForms.findAll({
    where: { ParentSubFormId: subFormId },
    attributes: ["id"],
  });

  for (const child of children) {
    await deleteSubFormBranch(child.id);
  }

  await ComplianceSubForms.destroy({ where: { id: subFormId } });
};

export const getAllSubForms = async (req, res) => {
  try {
    const { formId } = req.query;
    const where = formId ? { ComplianceFormsId: formId } : {};

    const subForms = await ComplianceSubForms.findAll({
      where,
      include: [
        {
          model: ComplianceForms,
          attributes: ["id", "formName"],
        },
      ],
      attributes: ["id", "ComplianceFormsId", "ParentSubFormId", "formName"],
      order: [["id", "ASC"]],
    });

    return res.status(200).json({ error: false, data: subForms });
  } catch (error) {
    console.error("Get subforms error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const getSubFormById = async (req, res) => {
  try {
    const { id } = req.params;
    const subForm = await ComplianceSubForms.findByPk(id, {
      include: [
        {
          model: ComplianceForms,
          attributes: ["id", "formName"],
        },
      ],
      attributes: ["id", "ComplianceFormsId", "ParentSubFormId", "formName"],
    });

    if (!subForm) {
      return res.status(404).json({ error: true, message: "Subform not found" });
    }

    return res.status(200).json({ error: false, data: subForm });
  } catch (error) {
    console.error("Get subform error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const createSubForm = async (req, res) => {
  try {
    const { ComplianceFormsId, ParentSubFormId, formName } = req.body;

    if (!ComplianceFormsId) {
      return res.status(400).json({ error: true, message: "Form ID is required" });
    }
    if (!formName || formName.trim() === "") {
      return res.status(400).json({ error: true, message: "Subform name is required" });
    }

    const parentForm = await ComplianceForms.findByPk(ComplianceFormsId);
    if (!parentForm) {
      return res.status(404).json({ error: true, message: "Form not found" });
    }

    if (ParentSubFormId) {
      const parentSubForm = await ComplianceSubForms.findByPk(ParentSubFormId);
      if (!parentSubForm) {
        return res.status(404).json({ error: true, message: "Parent subform not found" });
      }

      if (Number(parentSubForm.ComplianceFormsId) !== Number(ComplianceFormsId)) {
        return res.status(400).json({ error: true, message: "Parent subform does not belong to this form" });
      }
    }

    const newSubForm = await ComplianceSubForms.create({
      ComplianceFormsId,
      ParentSubFormId: ParentSubFormId || null,
      formName: formName.trim(),
    });

    await recordActivity(
      req,
      "create",
      buildCreateDescription("compliance subform", newSubForm.formName || newSubForm.id),
      {
        entity: "compliance_subform",
        complianceSubFormId: newSubForm.id,
        complianceFormId: Number(ComplianceFormsId),
        parentSubFormId: newSubForm.ParentSubFormId,
      }
    );

    return res.status(201).json({ error: false, data: newSubForm, message: "Subform created successfully" });
  } catch (error) {
    console.error("Create subform error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const updateSubForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { formName } = req.body;

    const subForm = await ComplianceSubForms.findByPk(id);
    if (!subForm) {
      return res.status(404).json({ error: true, message: "Subform not found" });
    }

    if (formName !== undefined && (formName === "" || formName === null)) {
      return res.status(400).json({ error: true, message: "Subform name cannot be empty" });
    }

    const beforeName = subForm.formName;

    await subForm.update({
      formName: formName !== undefined ? formName.trim() : subForm.formName,
    });

    if (beforeName !== subForm.formName) {
      const changeDetails = [{ field: "formName", before: beforeName, after: subForm.formName }];
      await recordActivity(
        req,
        "update",
        buildUpdateDescription("compliance subform", changeDetails, { target: subForm.formName }),
        {
          entity: "compliance_subform",
          complianceSubFormId: subForm.id,
          complianceFormId: subForm.ComplianceFormsId,
          parentSubFormId: subForm.ParentSubFormId,
          changes: changeDetails,
        }
      );
    }

    return res.status(200).json({ error: false, data: subForm, message: "Subform updated successfully" });
  } catch (error) {
    console.error("Update subform error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const deleteSubForm = async (req, res) => {
  try {
    const { id } = req.params;
    const subForm = await ComplianceSubForms.findByPk(id);
    if (!subForm) {
      return res.status(404).json({ error: true, message: "Subform not found" });
    }

    const subFormName = subForm.formName;
    const complianceFormId = subForm.ComplianceFormsId;
    const parentSubFormId = subForm.ParentSubFormId;

    await deleteSubFormBranch(subForm.id);

    await recordActivity(
      req,
      "delete",
      buildDeleteDescription("compliance subform", subFormName || id),
      {
        entity: "compliance_subform",
        complianceSubFormId: Number(id),
        complianceFormId,
        parentSubFormId,
      }
    );

    return res.status(200).json({ error: false, message: "Subform deleted successfully" });
  } catch (error) {
    console.error("Delete subform error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
