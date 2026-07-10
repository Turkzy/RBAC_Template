import User from "./UserModel.js";
import Role from "./RoleModel.js";
import Permission from "./PermissionModel.js";
import RolePermission from "./RolePermissionModel.js";
import Workgroup from "./WorkgroupModel.js";
import Units from "./UnitsModel.js";
import Department from "./DepartmentModel.js";
import ActivityLog from "./ActivityLogModel.js";
import Compliance from "./ComplianceModel.js";
import database from "../config/database.js";
import PasswordReset from "./PasswordResetModel.js";


User.belongsTo(Role, { foreignKey: "roleId", as: "role" });
Role.hasMany(User, { foreignKey: "roleId", as: "users" });

// PasswordReset relations
PasswordReset.belongsTo(User, { foreignKey: "userId" });
User.hasMany(PasswordReset, { foreignKey: "userId", onDelete: "CASCADE" });

User.belongsTo(Workgroup, { foreignKey: "workgroupId", as: "workgroup" });
Workgroup.hasMany(User, { foreignKey: "workgroupId", as: "users" });

User.belongsTo(Units, { foreignKey: "unitsId", as: "units" });
Units.hasMany(User, { foreignKey: "unitsId", as: "users" });

User.belongsTo(Department, { foreignKey: "DepartmentId", as: "department" });
Department.hasMany(User, { foreignKey: "DepartmentId", as: "users" });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: "roleId", otherKey: "permissionId", as: "Permissions"});
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: "permissionId", otherKey: "roleId", as: "Roles"});
Role.hasMany(RolePermission, { foreignKey: "roleId" });
Permission.hasMany(RolePermission, { foreignKey: "permissionId" });
RolePermission.belongsTo(Role, { foreignKey: "roleId", as: "Role" });
RolePermission.belongsTo(Permission, { foreignKey: "permissionId", as: "Permission" });

// ActivityLog relations
ActivityLog.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(ActivityLog, { foreignKey: "userId", as: "activityLogs" });

export { User, Role, Permission, RolePermission, Workgroup, Units, Department, ActivityLog, Compliance, PasswordReset };