import { PERMISSIONS } from "../constants/permissions.js";

const normalizeRoleName = (requester) => {
  return String(requester?.role?.name || requester?.roleName || "")
    .trim()
    .toLowerCase();
};

export const isSuperAdmin = (requester) => {
  const roleName = normalizeRoleName(requester);
  return roleName === "super admin" || roleName === "superadmin" || roleName.includes("super");
};

export const hasPermissionForUser = (requester, permissionName) => {
  if (!requester || !permissionName) return false;

  const directPermissions = Array.isArray(requester.permissions)
    ? requester.permissions
    : [];

  if (directPermissions.includes(permissionName)) {
    return true;
  }

  const rolePermissions = requester.role?.Permissions?.map((permission) => permission.name) || [];
  return rolePermissions.includes(permissionName);
};

export const canManageActivityLogs = (requester) => {
  return isSuperAdmin(requester) || hasPermissionForUser(requester, PERMISSIONS.AUDIT_LOGS_MANAGE);
};

export const canViewActivityLogs = (requester) => {
  return isSuperAdmin(requester) || hasPermissionForUser(requester, PERMISSIONS.AUDIT_LOGS_VIEW);
};

export const getUserAccessScope = (requester) => {
  if (!requester) return null;

  if (isSuperAdmin(requester)) {
    return null;
  }

  const departmentId = requester.DepartmentId ?? requester.departmentId ?? null;
  if (departmentId !== null && departmentId !== undefined && departmentId !== "") {
    return { DepartmentId: departmentId };
  }

  return { id: requester.id };
};
