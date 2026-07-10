import express from "express";
import { createRole, updateRole, deleteRole, assignPermissionToRole, removePermissionFromRole, getAllRolePermissions, getAllRoles, createPermission, updatePermission, deletePermission, getAllPermissions, checkUserPermission, assignRoleToUser } from "../controllers/RbacController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { requirePermission, requirePermissionOrSuperAdmin, requirePermissionOrSuperAdminMultiple } from "../middleware/rbacmiddleware.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

// Read operations - allow ROLES_MANAGE OR PERMISSIONS_MANAGE OR ACCOUNTS_MANAGE
const readAccessMiddleware = requirePermissionOrSuperAdminMultiple([PERMISSIONS.ROLES_MANAGE, PERMISSIONS.PERMISSIONS_MANAGE, PERMISSIONS.ACCOUNTS_MANAGE]);

// Role management operations
router.post("/role-permission/assign", authMiddleware, requirePermissionOrSuperAdmin(PERMISSIONS.PERMISSIONS_ASSIGN), assignPermissionToRole);
router.delete("/role-permission/remove", authMiddleware, requirePermissionOrSuperAdmin(PERMISSIONS.PERMISSIONS_ASSIGN), removePermissionFromRole);
router.get("/role-permissions", authMiddleware, readAccessMiddleware, getAllRolePermissions);

router.post("/roles", authMiddleware, requirePermission(PERMISSIONS.ROLES_MANAGE), createRole);
router.get("/get-roles", authMiddleware, readAccessMiddleware, getAllRoles);
router.put("/roles/:id", authMiddleware, requirePermission(PERMISSIONS.ROLES_MANAGE), updateRole);
router.delete("/roles/:id", authMiddleware, requirePermission(PERMISSIONS.ROLES_MANAGE), deleteRole);

// Permission management operations
router.post('/permissions', authMiddleware, requirePermission(PERMISSIONS.PERMISSIONS_MANAGE), createPermission);
router.get("/get-permissions", authMiddleware, readAccessMiddleware, getAllPermissions);
router.put("/permissions/:id", authMiddleware, requirePermission(PERMISSIONS.PERMISSIONS_MANAGE), updatePermission);
router.delete("/permissions/:id", authMiddleware, requirePermission(PERMISSIONS.PERMISSIONS_MANAGE), deletePermission);

router.post("/check-permission", authMiddleware, checkUserPermission);

router.post("/assign-role", authMiddleware, requirePermission(PERMISSIONS.ROLES_MANAGE), assignRoleToUser);

export default router;