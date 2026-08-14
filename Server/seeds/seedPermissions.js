import { Permission } from "../models/index.js";
import { PERMISSIONS } from "../constants/permissions.js";

const PERMISSION_SEED = [
  // Account Management Permissions
  { name: PERMISSIONS.ACCOUNTS_MANAGE, label: "Manage Accounts" },
  { name: PERMISSIONS.ACCOUNTS_CREATE, label: "Create Accounts" },
  { name: PERMISSIONS.ACCOUNTS_UPDATE, label: "Update Accounts" },
  { name: PERMISSIONS.ACCOUNTS_DELETE, label: "Delete Accounts" },

  // Role Management Permissions
  { name: PERMISSIONS.ROLES_MANAGE, label: "Manage Roles" },
  { name: PERMISSIONS.ROLES_CREATE, label: "Create Roles" },
  { name: PERMISSIONS.ROLES_UPDATE, label: "Update Roles" },
  { name: PERMISSIONS.ROLES_DELETE, label: "Delete Roles" },

  // Permission Management Permissions
  { name: PERMISSIONS.PERMISSIONS_MANAGE, label: "Manage Permissions" },
  { name: PERMISSIONS.PERMISSIONS_CREATE, label: "Create Permissions" },
  { name: PERMISSIONS.PERMISSIONS_UPDATE, label: "Update Permissions" },
  { name: PERMISSIONS.PERMISSIONS_DELETE, label: "Delete Permissions" },
  { name: PERMISSIONS.PERMISSIONS_ASSIGN, label: "Assign Permissions" },

  // Audit & System Permissions
  { name: PERMISSIONS.CALENDAR_VIEW_ALL, label: "View All Calendar Deadlines" },
  { name: PERMISSIONS.AUDIT_LOGS_VIEW, label: "View Audit Logs" },
  { name: PERMISSIONS.AUDIT_LOGS_MANAGE, label: "Manage Audit Logs" },
  { name: PERMISSIONS.DOCUMENTS_MANAGE, label: "Manage Documents" },
  { name: PERMISSIONS.SYSTEM_SETTINGS_MANAGE, label: "Manage System Settings" },
  { name: PERMISSIONS.NOTIFICATIONS_VIEW, label: "View Notifications" },
  { name: PERMISSIONS.NOTIFICATIONS_RULES_MANAGE, label: "Manage Notification Rules" },
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