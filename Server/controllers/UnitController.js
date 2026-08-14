import Units from "../models/UnitsModel.js";
import Department from "../models/DepartmentModel.js";
import { recordActivity } from "../services/activityService.js";
import {
  buildCreateDescription,
  buildDeleteDescription,
  buildUpdateDescription,
} from "../utils/activityLogMessage.js";
import { normalizeIdList } from "../utils/organizationRelationHelpers.js";

// ─────────────────────────────────────────
// GET ALL UNITS
// ─────────────────────────────────────────
export const getAllUnits = async (req, res) => {
  try {
    const units = await Units.findAll({
      include: [
        { model: Department, as: "department", attributes: ["id", "departmentName"] },
        { model: Department, as: "assignedDepartments", attributes: ["id", "departmentName"] },
      ],
      order: [["UnitName", "ASC"]],
    });
    return res.status(200).json({ error: false, units });
  } catch (error) {
    console.error("Get all units error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// CREATE UNIT
// ─────────────────────────────────────────
export const createUnit = async (req, res) => {
  try {
    const { UnitName, departmentId, departmentIds } = req.body;
    const assignedDepartmentIds = normalizeIdList(departmentIds ?? departmentId);

    if (!UnitName || String(UnitName).trim() === "") {
      return res.status(400).json({ error: true, message: "Unit name is required." });
    }

    for (const id of assignedDepartmentIds) {
      const department = await Department.findByPk(id);
      if (!department) {
        return res.status(404).json({ error: true, message: `Department ${id} not found.` });
      }
    }

    const unit = await Units.create({
      UnitName: String(UnitName).trim(),
      departmentId: assignedDepartmentIds[0] ?? null,
    });

    if (assignedDepartmentIds.length > 0) {
      await unit.setAssignedDepartments(assignedDepartmentIds);
    } else {
      await unit.setAssignedDepartments([]);
    }

    const savedUnit = await Units.findByPk(unit.id, {
      include: [{ model: Department, as: "department", attributes: ["id", "departmentName"] }, { model: Department, as: "assignedDepartments", attributes: ["id", "departmentName"] }],
    });

    await recordActivity(
      req,
      "create",
      buildCreateDescription("unit", savedUnit?.UnitName || unit.id),
      {
        entity: "unit",
        unitId: unit.id,
        departmentIds: assignedDepartmentIds,
      }
    );

    return res.status(201).json({ error: false, unit: savedUnit, message: "Unit created successfully." });
  } catch (error) {
    console.error("Create unit error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// UPDATE UNIT
// ─────────────────────────────────────────
export const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { UnitName, departmentId, departmentIds } = req.body;
    const assignedDepartmentIds = normalizeIdList(departmentIds ?? departmentId);

    const unit = await Units.findByPk(id);
    if (!unit) {
      return res.status(404).json({ error: true, message: "Unit not found." });
    }

    const beforeName = unit.UnitName;
    const beforeDepartmentIds = (await unit.getAssignedDepartments({ attributes: ["id"] })).map((department) => department.id);

    if (!UnitName || String(UnitName).trim() === "") {
      return res.status(400).json({ error: true, message: "Unit name is required." });
    }

    for (const departmentIdValue of assignedDepartmentIds) {
      const department = await Department.findByPk(departmentIdValue);
      if (!department) {
        return res.status(404).json({ error: true, message: `Department ${departmentIdValue} not found.` });
      }
    }

    unit.UnitName = String(UnitName).trim();
    unit.departmentId = assignedDepartmentIds[0] ?? null;
    await unit.save();

    if (assignedDepartmentIds.length > 0) {
      await unit.setAssignedDepartments(assignedDepartmentIds);
    } else {
      await unit.setAssignedDepartments([]);
    }

    const updatedUnit = await Units.findByPk(unit.id, {
      include: [{ model: Department, as: "department", attributes: ["id", "departmentName"] }, { model: Department, as: "assignedDepartments", attributes: ["id", "departmentName"] }],
    });

    const changeDetails = [];
    if (beforeName !== updatedUnit.UnitName) {
      changeDetails.push({
        field: "UnitName",
        before: beforeName,
        after: updatedUnit.UnitName,
      });
    }

    const beforeSerialized = JSON.stringify(beforeDepartmentIds.slice().sort((a, b) => a - b));
    const afterSerialized = JSON.stringify(assignedDepartmentIds.slice().sort((a, b) => a - b));
    if (beforeSerialized !== afterSerialized) {
      changeDetails.push({
        field: "departments",
        before: beforeDepartmentIds,
        after: assignedDepartmentIds,
      });
    }

    if (changeDetails.length > 0) {
      await recordActivity(
        req,
        "update",
        buildUpdateDescription("unit", changeDetails, { target: updatedUnit.UnitName }),
        {
          entity: "unit",
          unitId: updatedUnit.id,
          changes: changeDetails,
        }
      );
    }

    return res.status(200).json({ error: false, unit: updatedUnit, message: "Unit updated successfully." });
  } catch (error) {
    console.error("Update unit error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// DELETE UNIT
// ─────────────────────────────────────────
export const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await Units.findByPk(id);

    if (!unit) {
      return res.status(404).json({ error: true, message: "Unit not found." });
    }

    const unitName = unit.UnitName;
    await unit.destroy();

    await recordActivity(
      req,
      "delete",
      buildDeleteDescription("unit", unitName || id),
      {
        entity: "unit",
        unitId: Number(id),
      }
    );

    return res.status(200).json({ error: false, message: "Unit deleted successfully." });
  } catch (error) {
    console.error("Delete unit error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};