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
import SystemSetting from "./SystemSettingModel.js";
import ComplianceFormsTitle from "./ComplianceFormsTitle.js";
import ComplianceForms from "./ComplianceForms.js";
import ComplianceSubForms from "./ComplianceSubForms.js";
import DepartmentWorkgroup from "./DepartmentWorkgroup.js";
import DepartmentUnit from "./DepartmentUnit.js";
import ComplianceNotificationRead from "./ComplianceNotificationReadModel.js";


User.belongsTo(Role, { foreignKey: "roleId", as: "role" });
Role.hasMany(User, { foreignKey: "roleId", as: "users" });

// PasswordReset relations
PasswordReset.belongsTo(User, { foreignKey: "userId" });
User.hasMany(PasswordReset, { foreignKey: "userId", onDelete: "CASCADE" });

// Hierarchy relations: Workgroup -> Department -> Units -> User
Workgroup.hasMany(Department, { foreignKey: "workgroupId", as: "departments" });
Department.belongsTo(Workgroup, { foreignKey: "workgroupId", as: "workgroup" });
Department.belongsToMany(Workgroup, { through: DepartmentWorkgroup, foreignKey: "departmentId", otherKey: "workgroupId", as: "workgroups" });
Workgroup.belongsToMany(Department, { through: DepartmentWorkgroup, foreignKey: "workgroupId", otherKey: "departmentId", as: "assignedDepartments" });

Department.hasMany(Units, { foreignKey: "departmentId", as: "units" });
Units.belongsTo(Department, { foreignKey: "departmentId", as: "department" });
Units.belongsToMany(Department, { through: DepartmentUnit, foreignKey: "unitId", otherKey: "departmentId", as: "assignedDepartments" });
Department.belongsToMany(Units, { through: DepartmentUnit, foreignKey: "departmentId", otherKey: "unitId", as: "assignedUnits" });

Workgroup.hasMany(User, { foreignKey: "workgroupId", as: "users" });
User.belongsTo(Workgroup, { foreignKey: "workgroupId", as: "workgroup" });

Units.hasMany(User, { foreignKey: "unitsId", as: "users" });
User.belongsTo(Units, { foreignKey: "unitsId", as: "units" });

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

// Compliance relations
Compliance.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Compliance.belongsTo(User, { foreignKey: "assignedToUserId", as: "assignedUser" });
Compliance.belongsTo(User, { foreignKey: "submittedBy", as: "submitter" });
Compliance.belongsTo(User, { foreignKey: "reviewedBy", as: "reviewer" });
Compliance.belongsTo(Workgroup, { foreignKey: "assignedToWorkgroupId", as: "assignedWorkgroup" });
Compliance.belongsTo(Department, { foreignKey: "assignedToDepartmentId", as: "assignedDepartment" });
Compliance.belongsTo(Units, { foreignKey: "assignedToUnitsId", as: "assignedUnit" });
Compliance.hasMany(ComplianceNotificationRead, { foreignKey: "complianceId", as: "notificationReads" });
ComplianceNotificationRead.belongsTo(Compliance, { foreignKey: "complianceId", as: "compliance" });
User.hasMany(ComplianceNotificationRead, { foreignKey: "userId", as: "complianceNotificationReads" });
ComplianceNotificationRead.belongsTo(User, { foreignKey: "userId", as: "user" });

// Compliance Forms relations
ComplianceFormsTitle.hasMany(ComplianceForms, { 
  foreignKey: "ComplianceFormsTitleId", 
  as: "ComplianceForms"
});
ComplianceForms.belongsTo(ComplianceFormsTitle, { 
  foreignKey: "ComplianceFormsTitleId",
  as: "ComplianceFormsTitle"
});

ComplianceForms.hasMany(ComplianceSubForms, {
  foreignKey: "ComplianceFormsId",
  as: "ComplianceSubForms",
});
ComplianceSubForms.belongsTo(ComplianceForms, {
  foreignKey: "ComplianceFormsId",
  as: "ComplianceForm",
});

ComplianceSubForms.hasMany(ComplianceSubForms, {
  foreignKey: "ParentSubFormId",
  as: "ChildSubForms",
  onDelete: "CASCADE",
});
ComplianceSubForms.belongsTo(ComplianceSubForms, {
  foreignKey: "ParentSubFormId",
  as: "ParentSubForm",
});

export { User, Role, Permission, RolePermission, Workgroup, Units, Department, ActivityLog, Compliance, ComplianceNotificationRead, PasswordReset, SystemSetting, ComplianceFormsTitle, ComplianceForms, ComplianceSubForms };