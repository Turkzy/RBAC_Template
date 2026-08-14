import express from "express";
import { createRole, updateRole, deleteRole, assignPermissionToRole, removePermissionFromRole, getAllRolePermissions, getAllRoles, createPermission, updatePermission, deletePermission, getAllPermissions, checkUserPermission, assignRoleToUser } from "../controllers/RbacController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { requirePermission, requirePermissionOrSuperAdmin, requirePermissionOrSuperAdminMultiple } from "../middleware/rbacmiddleware.js";
import { apiLimiter, accountManagementLimiter } from "../middleware/rateLimiter.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

// Read operations - allow ROLES_MANAGE OR PERMISSIONS_MANAGE OR ACCOUNTS_MANAGE
const readAccessMiddleware = requirePermissionOrSuperAdminMultiple([PERMISSIONS.ROLES_MANAGE, PERMISSIONS.PERMISSIONS_MANAGE, PERMISSIONS.ACCOUNTS_MANAGE]);

// Role management operations
router.post("/role-permission/assign", authMiddleware, requirePermissionOrSuperAdmin(PERMISSIONS.PERMISSIONS_ASSIGN), accountManagementLimiter, assignPermissionToRole);
router.delete("/role-permission/remove", authMiddleware, requirePermissionOrSuperAdmin(PERMISSIONS.PERMISSIONS_ASSIGN), accountManagementLimiter, removePermissionFromRole);
router.get("/role-permissions", authMiddleware, readAccessMiddleware, apiLimiter, getAllRolePermissions);

router.post("/roles", authMiddleware, requirePermission(PERMISSIONS.ROLES_MANAGE), accountManagementLimiter, createRole);
router.get("/get-roles", authMiddleware, readAccessMiddleware, apiLimiter, getAllRoles);
router.put("/roles/:id", authMiddleware, requirePermission(PERMISSIONS.ROLES_MANAGE), accountManagementLimiter, updateRole);
router.delete("/roles/:id", authMiddleware, requirePermission(PERMISSIONS.ROLES_MANAGE), accountManagementLimiter, deleteRole);

// Permission management operations
router.post('/permissions', authMiddleware, requirePermission(PERMISSIONS.PERMISSIONS_MANAGE), accountManagementLimiter, createPermission);
router.get("/get-permissions", authMiddleware, readAccessMiddleware, apiLimiter, getAllPermissions);
router.put("/permissions/:id", authMiddleware, requirePermission(PERMISSIONS.PERMISSIONS_MANAGE), accountManagementLimiter, updatePermission);
router.delete("/permissions/:id", authMiddleware, requirePermission(PERMISSIONS.PERMISSIONS_MANAGE), accountManagementLimiter, deletePermission);

router.post("/check-permission", authMiddleware, apiLimiter, checkUserPermission);

router.post("/assign-role", authMiddleware, requirePermission(PERMISSIONS.ROLES_MANAGE), accountManagementLimiter, assignRoleToUser);

export default router;