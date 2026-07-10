export const PERMISSIONS = {
  // ACCOUNTS
  ACCOUNTS_MANAGE: "accounts.manage",
  ACCOUNTS_CREATE: "accounts.create",
  ACCOUNTS_UPDATE: "accounts.update",
  ACCOUNTS_DELETE: "accounts.delete",

  // NOTIFICATIONS
  NOTIFICATIONS_VIEW: "notifications.view",

  // DOCUMENT MANAGEMENT
  DOCUMENTS_MANAGE: "documents.manage",

  // AUDIT LOGS
  AUDIT_LOGS_VIEW: "audit_logs.view",
  AUDIT_LOGS_MANAGE: "audit_logs.manage",

  // ROLES
  ROLES_MANAGE: "roles.manage",
  ROLES_CREATE: "roles.create",
  ROLES_UPDATE: "roles.update",
  ROLES_DELETE: "roles.delete",

  // PERMISSIONS
  PERMISSIONS_MANAGE: "permissions.manage",
  PERMISSIONS_CREATE: "permissions.create",
  PERMISSIONS_UPDATE: "permissions.update",
  PERMISSIONS_DELETE: "permissions.delete",
  PERMISSIONS_ASSIGN: "permissions.assign",

  // SYSTEM SETTINGS
  SYSTEM_SETTINGS_MANAGE: "system_settings.manage",
};

export const hasPermission = (permissionName) => {
  try {
    const raw = sessionStorage.getItem("user");
    if (!raw) return false;
    const user = JSON.parse(raw);
    if (!Array.isArray(user.permissions)) return false;
    return user.permissions.includes(permissionName);
  } catch {
    return false;
  }
};
