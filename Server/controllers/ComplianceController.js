import Compliance from "../models/ComplianceModel.js";
import { Op } from "sequelize";

export const listComplianceItems = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = {};

    if (from && to) {
      where[Op.and] = [
        { startDate: { [Op.lte]: new Date(to) } },
        { endDate: { [Op.gte]: new Date(from) } },
      ];
    } else if (from) {
      where.endDate = { [Op.gte]: new Date(from) };
    } else if (to) {
      where.startDate = { [Op.lte]: new Date(to) };
    }

    const items = await Compliance.findAll({
      where,
      order: [["startDate", "ASC"]],
    });

    return res.status(200).json({ error: false, items, count: items.length });
  } catch (error) {
    console.error("List compliance items error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const createComplianceItem = async (req, res) => {
  try {
    const {
      title,
      description,
      complianceType,
      assigned,
      status,
      startDate,
      endDate,
    } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        error: true,
        message: "Title, start date, and end date are required",
      });
    }

    const item = await Compliance.create({
      title,
      description: description || "",
      complianceType: complianceType || "Audit",
      assigned: assigned || "",
      status: status || "Pending",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdBy: req.user?.userId || null,
    });

    return res.status(201).json({ error: false, item });
  } catch (error) {
    console.error("Create compliance item error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const updateComplianceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Compliance.findByPk(id);

    if (!item) {
      return res.status(404).json({ error: true, message: "Compliance item not found" });
    }

    const {
      title,
      description,
      complianceType,
      assigned,
      status,
      startDate,
      endDate,
    } = req.body;

    await item.update({
      title: title ?? item.title,
      description: description ?? item.description,
      complianceType: complianceType ?? item.complianceType,
      assigned: assigned ?? item.assigned,
      status: status ?? item.status,
      startDate: startDate ? new Date(startDate) : item.startDate,
      endDate: endDate ? new Date(endDate) : item.endDate,
    });

    return res.status(200).json({ error: false, item });
  } catch (error) {
    console.error("Update compliance item error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const deleteComplianceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Compliance.findByPk(id);

    if (!item) {
      return res.status(404).json({ error: true, message: "Compliance item not found" });
    }

    await item.destroy();

    return res.status(200).json({ error: false, message: "Compliance item deleted" });
  } catch (error) {
    console.error("Delete compliance item error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
