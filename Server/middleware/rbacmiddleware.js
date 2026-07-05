import { User, Role, Permission } from "../models/index.js";

export const requirePermission = (permissionName) => {
    return async (req, res, next) => {
        if (!req.user?.userId) {
            return res.status(401).json({ error: true, message: "Unauthorized" });
        }

        try {
            const user = await User.findByPk(req.user.userId, {
                include: [{
                    model: Role,
                    as: "role",
                    include: [{ model: Permission, as: "Permissions" }]
                }]
            });

            if (!user?.role) {
                return res.status(403).json({ error: true, message: "No role assigned" });
            }

            const permissions = user.role.Permissions?.map(p => p.name) || [];

            if (!permissions.includes(permissionName)) {
                return res.status(403).json({ error: true, message: "Forbidden: Insufficient permissions" });
            }

            next();
        } catch (err) {
            console.error("RBAC Middleware error:", err);
            res.status(500).json({ error: true, message: "Server error" });
        }
    };
};

export const requirePermissionOrSelf = (permissionName) => {
    return async (req, res, next) => {
        if (!req.user?.userId) {
            return res.status(401).json({ error: true, message: "Unauthorized" });
        }

        const targetId = Number(req.params.id);
        const currentUserId = Number(req.user.userId);
        if (targetId === currentUserId) {
            return next();
        }

        try {
            const user = await User.findByPk(currentUserId, {
                include: [{
                    model: Role,
                    as: "role",
                    include: [{ model: Permission, as: "Permissions" }]
                }]
            });

            if (!user?.role) {
                return res.status(403).json({ error: true, message: "No role assigned" });
            }

            const permissions = user.role.Permissions?.map(p => p.name) || [];

            if (!permissions.includes(permissionName)) {
                return res.status(403).json({ error: true, message: "Forbidden: Insufficient permissions" });
            }

            next();
        } catch (err) {
            console.error("RBAC Middleware error:", err);
            res.status(500).json({ error: true, message: "Server error" });
        }
    };
};