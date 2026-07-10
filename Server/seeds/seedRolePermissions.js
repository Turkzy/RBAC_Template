// seeds/seedRolePermissions.js
import { Role, Permission, RolePermission } from "../models/index.js";
import { PERMISSIONS } from "../constants/permissions.js";

const ROLE_PERMISSION_MAP = {
  "Super Admin": Object.values(PERMISSIONS),
  "Admin": [
    PERMISSIONS.ACCOUNTS_MANAGE,
    PERMISSIONS.ACCOUNTS_CREATE,
    PERMISSIONS.ACCOUNTS_UPDATE,
    PERMISSIONS.ACCOUNTS_DELETE,

    PERMISSIONS.ROLES_MANAGE,
    PERMISSIONS.ROLES_CREATE,
    PERMISSIONS.ROLES_UPDATE,
    PERMISSIONS.ROLES_DELETE,

    PERMISSIONS.PERMISSIONS_MANAGE,
    PERMISSIONS.PERMISSIONS_ASSIGN,

    PERMISSIONS.AUDIT_LOGS_VIEW,
    PERMISSIONS.AUDIT_LOGS_MANAGE,
    PERMISSIONS.SYSTEM_SETTINGS_MANAGE,
  ],
  "User": [
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
};

export const seedRolePermissions = async () => {
  console.log("🚀 Starting role-permission seeding...");

  for (const [roleName, permissionNames] of Object.entries(ROLE_PERMISSION_MAP)) {
    const role = await Role.findOne({ where: { name: roleName } });

    if (!role) {
      console.warn(`⚠️  Role not found, skipping: ${roleName}`);
      continue;
    }

    for (const permName of permissionNames) {
      const permission = await Permission.findOne({ where: { name: permName } });

      if (!permission) {
        console.warn(`⚠️  Permission not found, skipping: ${permName}`);
        continue;
      }

      const [, created] = await RolePermission.findOrCreate({
        where: { roleId: role.id, permissionId: permission.id },
      });

      console.log(
        created
          ? `✅ Linked: ${roleName} -> ${permName}`
          : `↪️  Already linked: ${roleName} -> ${permName}`
      );
    }
  }

  console.log("✅ Role-permissions seeded successfully");
};

// ==================== RUN SEED ====================
if (import.meta.url === `file://${process.argv[1]}` ||
    process.argv[1]?.includes('seedRolePermissions')) {

  seedRolePermissions()
    .then(() => {
      console.log("✅ Done seeding role-permissions.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Seed error:", err);
      process.exit(1);
    });
}