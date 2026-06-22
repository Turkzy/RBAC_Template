import express from "express";
import { createRole, assignPermissionToRole, removePermissionFromRole, getAllRolePermissions, getAllRoles, createPermission, getAllPermissions, checkUserPermission } from "../controllers/RbacController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { requirePermission } from "../middleware/rbacmiddleware.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

router.post("/role-permission/assign", authMiddleware, requirePermission(PERMISSIONS.ROLES_MANAGE), assignPermissionToRole);
router.delete("/role-permission/remove", authMiddleware, requirePermission(PERMISSIONS.ROLES_MANAGE), removePermissionFromRole);
router.get("/role-permissions", authMiddleware, requirePermission(PERMISSIONS.ROLES_MANAGE), getAllRolePermissions);

router.post("/roles", authMiddleware, requirePermission(PERMISSIONS.ROLES_MANAGE), createRole);
router.get("/get-roles", authMiddleware, requirePermission(PERMISSIONS.ROLES_MANAGE), getAllRoles);

router.post('/permissions', authMiddleware, requirePermission(PERMISSIONS.PERMISSIONS_MANAGE), createPermission);
router.get("/get-permissions", authMiddleware, requirePermission(PERMISSIONS.PERMISSIONS_MANAGE), getAllPermissions);

router.post("/check-permission", authMiddleware, checkUserPermission);

export default router;