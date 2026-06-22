import User from "./UserModel.js";
import Role from "./RoleModel.js";
import Permission from "./PermissionModel.js";
import RolePermission from "./RolePermissionModel.js";
import database from "../config/database.js";

User.belongsTo(Role, { foreignKey: "roleId", as: "role" });
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: "roleId", otherKey: "permissionId", as: "Permissions"});
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: "permissionId", otherKey: "roleId", as: "Roles"});
Role.hasMany(RolePermission, { foreignKey: "roleId" });
Permission.hasMany(RolePermission, { foreignKey: "permissionId" });
RolePermission.belongsTo(Role, { foreignKey: "roleId", as: "Role" });
RolePermission.belongsTo(Permission, { foreignKey: "permissionId", as: "Permission" });

database.sync();

export { User, Role, Permission, RolePermission };