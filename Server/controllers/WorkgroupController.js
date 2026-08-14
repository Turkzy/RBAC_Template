import Workgroup from "../models/WorkgroupModel.js";
import { recordActivity } from "../services/activityService.js";
import {
  buildCreateDescription,
  buildDeleteDescription,
  buildUpdateDescription,
} from "../utils/activityLogMessage.js";

// ─────────────────────────────────────────
// GET ALL WORKGROUPS
// ─────────────────────────────────────────
export const getAllWorkgroups = async (req, res) => {
  try {
    const workgroups = await Workgroup.findAll({
      order: [["workgroupName", "ASC"]],
    });
    return res.status(200).json({ error: false, workgroups });
  } catch (error) {
    console.error("Get all workgroups error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// CREATE WORKGROUP
// ─────────────────────────────────────────
export const createWorkgroup = async (req, res) => {
  try {
    const { workgroupName } = req.body;

    if (!workgroupName || String(workgroupName).trim() === "") {
      return res.status(400).json({ error: true, message: "Workgroup name is required." });
    }

    const workgroup = await Workgroup.create({ workgroupName: String(workgroupName).trim() });

    await recordActivity(
      req,
      "create",
      buildCreateDescription("workgroup", workgroup.workgroupName || workgroup.id),
      {
        entity: "workgroup",
        workgroupId: workgroup.id,
      }
    );

    return res.status(201).json({ error: false, workgroup, message: "Workgroup created successfully." });
  } catch (error) {
    console.error("Create workgroup error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// UPDATE WORKGROUP
// ─────────────────────────────────────────
export const updateWorkgroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { workgroupName } = req.body;

    const workgroup = await Workgroup.findByPk(id);
    if (!workgroup) {
      return res.status(404).json({ error: true, message: "Workgroup not found." });
    }

    if (!workgroupName || String(workgroupName).trim() === "") {
      return res.status(400).json({ error: true, message: "Workgroup name is required." });
    }

    const beforeName = workgroup.workgroupName;
    workgroup.workgroupName = String(workgroupName).trim();
    await workgroup.save();

    if (beforeName !== workgroup.workgroupName) {
      const changeDetails = [{ field: "workgroupName", before: beforeName, after: workgroup.workgroupName }];
      await recordActivity(
        req,
        "update",
        buildUpdateDescription("workgroup", changeDetails, { target: workgroup.workgroupName }),
        {
          entity: "workgroup",
          workgroupId: workgroup.id,
          changes: changeDetails,
        }
      );
    }

    return res.status(200).json({ error: false, workgroup, message: "Workgroup updated successfully." });
  } catch (error) {
    console.error("Update workgroup error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// DELETE WORKGROUP
// ─────────────────────────────────────────
export const deleteWorkgroup = async (req, res) => {
  try {
    const { id } = req.params;
    const workgroup = await Workgroup.findByPk(id);

    if (!workgroup) {
      return res.status(404).json({ error: true, message: "Workgroup not found." });
    }

    const workgroupName = workgroup.workgroupName;
    await workgroup.destroy();

    await recordActivity(
      req,
      "delete",
      buildDeleteDescription("workgroup", workgroupName || id),
      {
        entity: "workgroup",
        workgroupId: Number(id),
      }
    );

    return res.status(200).json({ error: false, message: "Workgroup deleted successfully." });
  } catch (error) {
    console.error("Delete workgroup error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};