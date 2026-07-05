import Workgroup from "../models/WorkgroupModel.js";

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