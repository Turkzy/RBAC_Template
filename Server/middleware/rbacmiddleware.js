import { User, Role, Permission } from "../models/index.js";

export const requirePermission = (permissionName) => {
    return async (req, res, next) => {
        if (!req.user?.id) {
            return res.status(401).json({ error: true, message: "Unauthorized" });
        }

        try {
            const user = await User.findByPk(req.user.id, {
                include: [{
                    model: Role,
                    as: "role",
                    include: [{ model: Permission, as: "Permissions" }]
                }]
            });

            const permissions = user?.role?.Permissions?.map(p => p.name) || [];

            if (!permissions.includes(permissionName)) {
                return res.status(403).json({ error: true, message: "Forbidden" });
            }
            next();
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: true, message: "Server error" });
        }
    };
};