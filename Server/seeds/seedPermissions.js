import { Permission } from "../models/index.js";
import { PERMISSIONS } from "../constants/permissions.js";

const PERMISSION_SEED = [
  { name: PERMISSIONS.USERS_VIEW, label: "View Accounts" },
  { name: PERMISSIONS.USERS_CREATE, label: "Create Accounts" },
  { name: PERMISSIONS.USERS_UPDATE, label: "Update Accounts" },
  { name: PERMISSIONS.USERS_DELETE, label: "Delete Accounts" },
  { name: PERMISSIONS.ROLES_MANAGE, label: "Manage Roles" },
  { name: PERMISSIONS.PERMISSIONS_MANAGE, label: "Manage Permissions" },
  { name: PERMISSIONS.DOCUMENTS_VIEW, label: "View Documents" },
  { name: PERMISSIONS.AUDIT_LOGS_VIEW, label: "View Audit Logs" },
];

export const seedPermissions = async () => {
  for (const perm of PERMISSION_SEED) {
    const [row, created] = await Permission.findOrCreate({
      where: { name: perm.name },
      defaults: { label: perm.label },
    });
    console.log(created ? `✅ Created: ${row.name}` : `↪️  Already exists: ${row.name}`);
  }
};

// ==================== RUN SEED ====================
if (import.meta.url === `file://${process.argv[1]}` || 
    process.argv[1]?.includes('seedPermissions')) {
    
    console.log("🚀 Starting permission seeding...");
    
    seedPermissions()
        .then(() => {
            console.log("✅ Done seeding permissions.");
            process.exit(0);
        })
        .catch((err) => {
            console.error("❌ Seed error:", err);
            process.exit(1);
        });
}