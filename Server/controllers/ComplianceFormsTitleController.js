import ComplianceFormsTitle from "../models/ComplianceFormsTitle.js";
import ComplianceForms from "../models/ComplianceForms.js";
import ComplianceSubForms from "../models/ComplianceSubForms.js";
import { recordActivity } from "../services/activityService.js";
import {
  buildCreateDescription,
  buildDeleteDescription,
  buildUpdateDescription,
} from "../utils/activityLogMessage.js";

const buildSubformTree = (subForms) => {
  const byId = new Map();
  const rootIds = [];

  for (const rawSubForm of subForms) {
    const subForm = rawSubForm.toJSON ? rawSubForm.toJSON() : rawSubForm;
    byId.set(subForm.id, {
      id: subForm.id,
      formName: subForm.formName,
      ParentSubFormId: subForm.ParentSubFormId || null,
      ComplianceSubForms: [],
    });
  }

  for (const node of byId.values()) {
    if (node.ParentSubFormId && byId.has(node.ParentSubFormId)) {
      byId.get(node.ParentSubFormId).ComplianceSubForms.push(node);
    } else {
      rootIds.push(node.id);
    }
  }

  return rootIds.map((id) => byId.get(id));
};

const attachSubformTreeToTitles = async (titles) => {
  const plainTitles = titles.map((title) => title.toJSON());
  const formIds = plainTitles.flatMap((title) =>
    Array.isArray(title.ComplianceForms) ? title.ComplianceForms.map((form) => form.id) : []
  );

  if (formIds.length === 0) {
    return plainTitles;
  }

  const subForms = await ComplianceSubForms.findAll({
    where: { ComplianceFormsId: formIds },
    attributes: ["id", "ComplianceFormsId", "ParentSubFormId", "formName"],
    order: [["id", "ASC"]],
  });

  const groupedByForm = new Map();
  for (const subForm of subForms) {
    const formId = subForm.ComplianceFormsId;
    if (!groupedByForm.has(formId)) {
      groupedByForm.set(formId, []);
    }
    groupedByForm.get(formId).push(subForm);
  }

  for (const title of plainTitles) {
    for (const form of title.ComplianceForms || []) {
      const formSubForms = groupedByForm.get(form.id) || [];
      form.ComplianceSubForms = buildSubformTree(formSubForms);
    }
  }

  return plainTitles;
};

// GET all titles with their forms
export const getAllTitles = async (req, res) => {
  try {
    const titles = await ComplianceFormsTitle.findAll({
      include: [
        {
          model: ComplianceForms,
          as: "ComplianceForms",
          attributes: ["id", "formName"],
        },
      ],
      order: [["id", "ASC"]],
    });

    const data = await attachSubformTreeToTitles(titles);
    return res.status(200).json({ error: false, data });
  } catch (error) {
    console.error("Get titles error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// GET single title with its forms
export const getTitleById = async (req, res) => {
  try {
    const { id } = req.params;
    const title = await ComplianceFormsTitle.findByPk(id, {
      include: [
        {
          model: ComplianceForms,
          as: "ComplianceForms",
          attributes: ["id", "formName"],
        },
      ],
    });

    if (!title) {
      return res.status(404).json({ error: true, message: "Title not found" });
    }

    const [treeTitle] = await attachSubformTreeToTitles([title]);
    return res.status(200).json({ error: false, data: treeTitle });
  } catch (error) {
    console.error("Get title error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// CREATE new title
export const createTitle = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: true, message: "Title is required" });
    }

    const newTitle = await ComplianceFormsTitle.create({
      title: title.trim(),
    });

    await recordActivity(
      req,
      "create",
      buildCreateDescription("compliance title", newTitle.title || newTitle.id),
      {
        entity: "compliance_title",
        complianceTitleId: newTitle.id,
      }
    );

    return res.status(201).json({ error: false, data: newTitle, message: "Title created successfully" });
  } catch (error) {
    console.error("Create title error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// UPDATE title
export const updateTitle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const existingTitle = await ComplianceFormsTitle.findByPk(id);
    if (!existingTitle) {
      return res.status(404).json({ error: true, message: "Title not found" });
    }

    if (title !== undefined && (title === "" || title === null)) {
      return res.status(400).json({ error: true, message: "Title cannot be empty" });
    }

    const beforeTitle = existingTitle.title;

    await existingTitle.update({
      title: title !== undefined ? title.trim() : existingTitle.title,
    });

    if (beforeTitle !== existingTitle.title) {
      const changeDetails = [{ field: "title", before: beforeTitle, after: existingTitle.title }];
      await recordActivity(
        req,
        "update",
        buildUpdateDescription("compliance title", changeDetails, { target: existingTitle.title }),
        {
          entity: "compliance_title",
          complianceTitleId: existingTitle.id,
          changes: changeDetails,
        }
      );
    }

    return res.status(200).json({ error: false, data: existingTitle, message: "Title updated successfully" });
  } catch (error) {
    console.error("Update title error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// DELETE title (cascades to forms)
export const deleteTitle = async (req, res) => {
  try {
    const { id } = req.params;

    const title = await ComplianceFormsTitle.findByPk(id);
    if (!title) {
      return res.status(404).json({ error: true, message: "Title not found" });
    }

    const titleName = title.title;
    await title.destroy();

    await recordActivity(
      req,
      "delete",
      buildDeleteDescription("compliance title", titleName || id),
      {
        entity: "compliance_title",
        complianceTitleId: Number(id),
      }
    );

    return res.status(200).json({ error: false, message: "Title deleted successfully" });
  } catch (error) {
    console.error("Delete title error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
