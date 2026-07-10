import Department from "../models/DepartmentModel.js";

// ─────────────────────────────────────────
// GET ALL DEPARTMENTS
// ─────────────────────────────────────────
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      order: [["departmentName", "ASC"]],
    });
    return res.status(200).json({ error: false, departments });
  } catch (error) {
    console.error("Get all departments error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
