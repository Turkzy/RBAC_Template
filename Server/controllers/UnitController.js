import Units from "../models/UnitsModel.js";

// ─────────────────────────────────────────
// GET ALL UNITS
// ─────────────────────────────────────────
export const getAllUnits = async (req, res) => {
  try {
    const units = await Units.findAll({
      order: [["UnitName", "ASC"]],
    });
    return res.status(200).json({ error: false, units });
  } catch (error) {
    console.error("Get all units error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};