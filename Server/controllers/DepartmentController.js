import Department from "../models/DepartmentModel.js";
import Workgroup from "../models/WorkgroupModel.js";
import { recordActivity } from "../services/activityService.js";
import {
  buildCreateDescription,
  buildDeleteDescription,
  buildUpdateDescription,
} from "../utils/activityLogMessage.js";
import { normalizeIdList } from "../utils/organizationRelationHelpers.js";

// ─────────────────────────────────────────
// GET ALL DEPARTMENTS
// ─────────────────────────────────────────
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      include: [
        { model: Workgroup, as: "workgroup", attributes: ["id", "workgroupName"] },
        { model: Workgroup, as: "workgroups", attributes: ["id", "workgroupName"] },
      ],
      order: [["departmentName", "ASC"]],
    });
    return res.status(200).json({ error: false, departments });
  } catch (error) {
    console.error("Get all departments error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// CREATE DEPARTMENT
// ─────────────────────────────────────────
export const createDepartment = async (req, res) => {
  try {
    const { departmentName, workgroupId, workgroupIds } = req.body;
    const assignedWorkgroupIds = normalizeIdList(workgroupIds ?? workgroupId);

    if (!departmentName || String(departmentName).trim() === "") {
      return res.status(400).json({ error: true, message: "Department name is required." });
    }

    for (const id of assignedWorkgroupIds) {
      const workgroup = await Workgroup.findByPk(id);
      if (!workgroup) {
        return res.status(404).json({ error: true, message: `Workgroup ${id} not found.` });
      }
    }

    const department = await Department.create({
      departmentName: String(departmentName).trim(),
      workgroupId: assignedWorkgroupIds[0] ?? null,
    });

    if (assignedWorkgroupIds.length > 0) {
      await department.setWorkgroups(assignedWorkgroupIds);
    } else {
      await department.setWorkgroups([]);
    }

    const savedDepartment = await Department.findByPk(department.id, {
      include: [{ model: Workgroup, as: "workgroup", attributes: ["id", "workgroupName"] }, { model: Workgroup, as: "workgroups", attributes: ["id", "workgroupName"] }],
    });

    await recordActivity(
      req,
      "create",
      buildCreateDescription("department", savedDepartment?.departmentName || department.id),
      {
        entity: "department",
        departmentId: department.id,
        workgroupIds: assignedWorkgroupIds,
      }
    );

    return res.status(201).json({ error: false, department: savedDepartment, message: "Department created successfully." });
  } catch (error) {
    console.error("Create department error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// UPDATE DEPARTMENT
// ─────────────────────────────────────────
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { departmentName, workgroupId, workgroupIds } = req.body;
    const assignedWorkgroupIds = normalizeIdList(workgroupIds ?? workgroupId);

    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ error: true, message: "Department not found." });
    }

    const beforeName = department.departmentName;
    const beforeWorkgroupIds = (await department.getWorkgroups({ attributes: ["id"] })).map((workgroup) => workgroup.id);

    if (!departmentName || String(departmentName).trim() === "") {
      return res.status(400).json({ error: true, message: "Department name is required." });
    }

    for (const workgroupIdValue of assignedWorkgroupIds) {
      const workgroup = await Workgroup.findByPk(workgroupIdValue);
      if (!workgroup) {
        return res.status(404).json({ error: true, message: `Workgroup ${workgroupIdValue} not found.` });
      }
    }

    department.departmentName = String(departmentName).trim();
    department.workgroupId = assignedWorkgroupIds[0] ?? null;
    await department.save();

    if (assignedWorkgroupIds.length > 0) {
      await department.setWorkgroups(assignedWorkgroupIds);
    } else {
      await department.setWorkgroups([]);
    }

    const updatedDepartment = await Department.findByPk(department.id, {
      include: [{ model: Workgroup, as: "workgroup", attributes: ["id", "workgroupName"] }, { model: Workgroup, as: "workgroups", attributes: ["id", "workgroupName"] }],
    });

    const changeDetails = [];
    if (beforeName !== updatedDepartment.departmentName) {
      changeDetails.push({
        field: "departmentName",
        before: beforeName,
        after: updatedDepartment.departmentName,
      });
    }

    const beforeSerialized = JSON.stringify(beforeWorkgroupIds.slice().sort((a, b) => a - b));
    const afterSerialized = JSON.stringify(assignedWorkgroupIds.slice().sort((a, b) => a - b));
    if (beforeSerialized !== afterSerialized) {
      changeDetails.push({
        field: "workgroups",
        before: beforeWorkgroupIds,
        after: assignedWorkgroupIds,
      });
    }

    if (changeDetails.length > 0) {
      await recordActivity(
        req,
        "update",
        buildUpdateDescription("department", changeDetails, { target: updatedDepartment.departmentName }),
        {
          entity: "department",
          departmentId: updatedDepartment.id,
          changes: changeDetails,
        }
      );
    }

    return res.status(200).json({ error: false, department: updatedDepartment, message: "Department updated successfully." });
  } catch (error) {
    console.error("Update department error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// DELETE DEPARTMENT
// ─────────────────────────────────────────
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);

    if (!department) {
      return res.status(404).json({ error: true, message: "Department not found." });
    }

    const departmentName = department.departmentName;
    await department.destroy();

    await recordActivity(
      req,
      "delete",
      buildDeleteDescription("department", departmentName || id),
      {
        entity: "department",
        departmentId: Number(id),
      }
    );

    return res.status(200).json({ error: false, message: "Department deleted successfully." });
  } catch (error) {
    console.error("Delete department error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
