// seeds/seedRolePermissions.js
import { Role, Permission, RolePermission } from "../models/index.js";
import { PERMISSIONS } from "../constants/permissions.js";

const ROLE_PERMISSION_MAP = {
  "Super Admin": Object.values(PERMISSIONS),
  "Admin": [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.ROLES_MANAGE,
  ],
  "User": [
    PERMISSIONS.USERS_VIEW,
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