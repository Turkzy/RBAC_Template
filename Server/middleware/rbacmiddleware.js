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

// Allow Super Admin or specific permission (for read operations)
export const requirePermissionOrSuperAdmin = (permissionName) => {
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

            // Allow Super Admin to bypass permission check for read operations
            const roleName = (user.role.name || "").toString().trim().toLowerCase();
            const isSuperAdmin = roleName === "super admin" || roleName.includes("super");
            
            if (isSuperAdmin) {
                return next();
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

// Allow Super Admin or any of multiple permissions (useful for operations that multiple roles can do)
export const requirePermissionOrSuperAdminMultiple = (permissionNames) => {
    const names = Array.isArray(permissionNames) ? permissionNames : [permissionNames];
    
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

            // Check role name for Super Admin (case-insensitive)
            const roleName = (user.role.name || "").toString().trim().toLowerCase();
            const isSuperAdmin = roleName === "super admin" || roleName === "superadmin";
            
            if (isSuperAdmin) {
                return next();
            }

            // Check if user has any of the required permissions
            const permissions = user.role.Permissions?.map(p => p.name) || [];
            const hasPermission = names.some(permName => permissions.includes(permName));

            if (!hasPermission) {
                console.log(`[RBAC] Access denied - User: ${user.username} (${user.role.name}), Required: ${names.join(", ")}, Has: ${permissions.join(", ") || "none"}`);
                return res.status(403).json({ error: true, message: "Forbidden: Insufficient permissions" });
            }

            next();
        } catch (err) {
            console.error("RBAC Middleware error:", err);
            res.status(500).json({ error: true, message: "Server error" });
        }
    };
};