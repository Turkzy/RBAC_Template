import { ActivityLog, User, Role, Permission } from "../models/index.js";
import { Op } from "sequelize";
import { canManageActivityLogs, canViewActivityLogs, getUserAccessScope } from "../utils/accessControl.js";

export const listActivityLogs = async (req, res) => {
  try {
    const requester = await User.findByPk(req.user?.userId, {
      include: [{
        model: Role,
        as: "role",
        include: [{ model: Permission, as: "Permissions" }],
      }],
    });

    if (!requester?.role) {
      return res.status(403).json({ error: true, message: "Forbidden: No role assigned" });
    }

    if (!canViewActivityLogs(requester)) {
      return res.status(403).json({ error: true, message: "Forbidden: Insufficient permissions" });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 25);
    const offset = (page - 1) * limit;

    const where = {};
    const scope = getUserAccessScope(requester);
    if (scope && scope.DepartmentId !== undefined) {
      where.userId = { [Op.in]: [] };
    }
    if (req.query.userId) where.userId = req.query.userId;
    if (req.query.action) where.action = req.query.action;
    // text search on description (e.g., q=Deactivated)
    if (req.query.q) {
      where.description = { [Op.like]: `%${req.query.q}%` };
    }
    if (req.query.from || req.query.to) {
      where.createdAt = {};
      if (req.query.from) where.createdAt[Op.gte] = new Date(req.query.from);
      if (req.query.to) where.createdAt[Op.lte] = new Date(req.query.to);
    }

    if (scope && scope.DepartmentId !== undefined) {
      const scopedUsers = await User.findAll({
        where: { DepartmentId: scope.DepartmentId },
        attributes: ["id"],
      });
      where.userId = { [Op.in]: scopedUsers.map((user) => user.id) };
    }

    const { rows, count } = await ActivityLog.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      include: [{ model: User, as: "user", attributes: ["id", "firstName", "lastName", "email"] }],
    });

    return res.status(200).json({ error: false, rows, count, page, limit });
  } catch (err) {
    console.error("List activity logs error:", err);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const getActivityLog = async (req, res) => {
  try {
    const requester = await User.findByPk(req.user?.userId, {
      include: [{
        model: Role,
        as: "role",
        include: [{ model: Permission, as: "Permissions" }],
      }],
    });

    if (!requester?.role) {
      return res.status(403).json({ error: true, message: "Forbidden: No role assigned" });
    }

    if (!canViewActivityLogs(requester)) {
      return res.status(403).json({ error: true, message: "Forbidden: Insufficient permissions" });
    }

    const { id } = req.params;
    const log = await ActivityLog.findByPk(id, {
      include: [{ model: User, as: "user", attributes: ["id", "firstName", "lastName", "email"] }],
    });
    if (!log) return res.status(404).json({ error: true, message: "Activity log not found" });

    const scope = getUserAccessScope(requester);
    if (scope && scope.DepartmentId !== undefined) {
      const scopedUsers = await User.findAll({
        where: { DepartmentId: scope.DepartmentId },
        attributes: ["id"],
      });
      const scopedUserIds = scopedUsers.map((user) => user.id);
      if (!scopedUserIds.includes(log.userId)) {
        return res.status(403).json({ error: true, message: "Forbidden: Access denied" });
      }
    }

    return res.status(200).json({ error: false, log });
  } catch (err) {
    console.error("Get activity log error:", err);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const cleanupActivityLogs = async (req, res) => {
  try {
    const requester = await User.findByPk(req.user?.userId, {
      include: [{
        model: Role,
        as: "role",
        include: [{ model: Permission, as: "Permissions" }],
      }],
    });

    if (!requester?.role) {
      return res.status(403).json({ error: true, message: "Forbidden: No role assigned" });
    }

    if (!canManageActivityLogs(requester)) {
      return res.status(403).json({ error: true, message: "Forbidden: Insufficient permissions" });
    }

    const { months } = req.body;

    if (!months || months < 1) {
      return res.status(400).json({ error: true, message: "Valid months value is required" });
    }

    // Calculate cutoff date: current date minus the specified months
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    // Delete logs older than the cutoff date
    const deletedCount = await ActivityLog.destroy({
      where: {
        createdAt: { [Op.lt]: cutoffDate }
      }
    });

    return res.status(200).json({
      error: false,
      message: `Deleted ${deletedCount} logs older than ${months} month${months !== 1 ? 's' : ''}`,
      deletedCount
    });
  } catch (err) {
    console.error("Cleanup activity logs error:", err);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
