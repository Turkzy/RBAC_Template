import { Role, Permission, RolePermission, User } from "../models/index.js";
import { recordActivity } from "../services/activityService.js";
import {
  buildCreateDescription,
  buildUpdateDescription,
  buildDeleteDescription,
  buildAssignDescription,
  buildRemoveDescription,
} from "../utils/activityLogMessage.js";

//---------------ASSIGNING PERMISSIONS FOR ROLES PER UNITS---------------

// GET ALL ROLE-PERMISSION ASSIGNMENTS
export const getAllRolePermissions = async (req, res) => {
  try {
    // Test basic query first
    const rolePermissions = await RolePermission.findAll();
    console.log("Basic RolePermissions:", JSON.stringify(rolePermissions, null, 2));

    // Full query with includes
    const fullRolePermissions = await RolePermission.findAll({
      include: [
        { model: Role, attributes: ["id", "name"], as: "Role" },
        { model: Permission, attributes: ["id", "name"], as: "Permission" },
      ],
    });
    console.log("Full RolePermissions:", JSON.stringify(fullRolePermissions, null, 2));

    return res.status(200).json({ error: false, rolePermissions: fullRolePermissions });
  } catch (error) {
    console.error("Get all role-permissions error:", error.message, error.stack);
    return res.status(500).json({ error: true, message: error.message || "Internal Server Error" });
  }
};

// ASSIGN PERMISSION(S) TO ROLE
export const assignPermissionToRole = async (req, res) => {
  try {
    const { roleId, permissionId, permissionIds } = req.body;

    // Ensure roleId is provided
    if (!roleId) {
      return res.status(400).json({ error: true, message: "roleId is required" });
    }

    // Handle both single permissionId and permissionIds array
    const permissionsToAssign = permissionIds
      ? permissionIds
      : permissionId
        ? [permissionId]
        : [];

    if (permissionsToAssign.length === 0) {
      return res.status(400).json({ error: true, message: "At least one permissionId is required" });
    }

    // Validate role
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ error: true, message: "Invalid roleId" });
    }

    // Validate permissions
    const validPermissions = await Permission.findAll({
      where: { id: permissionsToAssign },
    });
    if (validPermissions.length !== permissionsToAssign.length) {
      return res.status(400).json({ error: true, message: "One or more permissionIds are invalid" });
    }

    // Check for existing assignments
    const existingAssignments = await RolePermission.findAll({
      where: {
        roleId,
        permissionId: permissionsToAssign,
      },
    });

    const existingPermissionIds = existingAssignments.map((assignment) => assignment.permissionId);
    const newPermissions = permissionsToAssign.filter(
      (id) => !existingPermissionIds.includes(id)
    );

    if (newPermissions.length === 0) {
      return res.status(400).json({ error: true, message: "All permissions are already assigned to role" });
    }

    const newPermissionNames = validPermissions
      .filter((perm) => newPermissions.includes(perm.id))
      .map((perm) => perm.name);

    // Create new assignments in a transaction
    await RolePermission.sequelize.transaction(async (t) => {
      await RolePermission.bulkCreate(
        newPermissions.map((permissionId) => ({
          roleId,
          permissionId,
        })),
        { transaction: t }
      );
    });

    await recordActivity(
      req,
      "assign",
      buildAssignDescription(
        "permissions",
        newPermissionNames.join(", "),
        "role",
        role.name
      ),
      {
        roleId: role.id,
        permissionIds: newPermissions,
        changes: [
          {
            field: "permissions",
            before: "-",
            after: newPermissionNames.join(", ") || "-",
          },
        ],
      }
    );

    return res.status(201).json({ error: false, message: "Permissions assigned to role successfully" });
  } catch (error) {
    console.error("Assign permission to role error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// REMOVE PERMISSION FROM ROLE (Admin-only)
export const removePermissionFromRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;
    if (!roleId || !permissionId) {
      return res.status(400).json({ error: true, message: "roleId and permissionId are required" });
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ error: true, message: "Invalid roleId" });
    }

    const permission = await Permission.findByPk(permissionId);
    if (!permission) {
      return res.status(400).json({ error: true, message: "Invalid permissionId" });
    }

    const existingAssignment = await RolePermission.findOne({
      where: { roleId, permissionId },
    });
    if (!existingAssignment) {
      return res.status(400).json({ error: true, message: "Permission not assigned to role" });
    }

    await RolePermission.destroy({ where: { roleId, permissionId } });

    await recordActivity(
      req,
      "remove",
      buildRemoveDescription(
        "permission",
        permission.name,
        "role",
        role.name
      ),
      {
        roleId: role.id,
        permissionId: permission.id,
        changes: [
          {
            field: "permissions",
            before: permission.name,
            after: "-",
          },
        ],
      }
    );

    return res.status(200).json({ error: false, message: "Permission removed from role successfully" });
  } catch (error) {
    console.error("Remove permission from role error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};




//---------------ROLES PER UNITS---------------

// CREATE ROLE (Admin-only)
export const createRole = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: true, message: "Role name is required" });
    }

    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ error: true, message: "Role already exists" });
    }

    const role = await Role.create({ name });
    await recordActivity(
      req,
      "create",
      buildCreateDescription("role", role.name),
      { roleId: role.id }
    );
    return res.status(201).json({ error: false, role, message: "Role created successfully" });
  } catch (error) {
    console.error("Create role error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// GET ALL ROLES
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [{ model: Permission, attributes: ["id", "name", "label"], as: "Permissions" }],
    });
    return res.status(200).json({ error: false, roles });
  } catch (error) {
    console.error("Get all roles error:", error.message, error.stack);
    return res.status(500).json({ error: true, message: error.message || "Internal Server Error" });
  }
};

// UPDATE ROLE (rename)
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ error: true, message: "Role name is required" });
    }

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: true, message: "Role not found" });
    }

    const existing = await Role.findOne({ where: { name } });
    if (existing && existing.id !== Number(id)) {
      return res.status(400).json({ error: true, message: "Role name already in use" });
    }

    const beforeName = role.name;
    await role.update({ name });
    const changeDetails = [];
    if (beforeName !== name) {
      changeDetails.push({ field: "name", before: beforeName, after: name });
    }
    if (changeDetails.length > 0) {
      await recordActivity(
        req,
        "update",
        buildUpdateDescription("role", changeDetails, { target: role.name }),
        { roleId: role.id, changes: changeDetails }
      );
    }
    return res.status(200).json({ error: false, role, message: "Role updated successfully" });
  } catch (error) {
    console.error("Update role error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// DELETE ROLE
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: true, message: "Role not found" });
    }
    const deleted = await Role.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: true, message: "Role not found" });
    }
    await recordActivity(
      req,
      "delete",
      buildDeleteDescription("role", role.name),
      { roleId: role.id }
    );
    return res.status(200).json({ error: false, message: "Role deleted successfully" });
  } catch (error) {
    console.error("Delete role error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ASSIGN ROLE TO USER (Super Admin)
export const assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json({ error: true, message: "userId and roleId are required" });
    }

    const user = await User.findByPk(userId, {
      include: [{ model: Role, as: "role" }],
    });
    const role = await Role.findByPk(roleId);

    if (!user) return res.status(404).json({ error: true, message: "User not found" });
    if (!role) return res.status(404).json({ error: true, message: "Role not found" });

    const previousRoleName = user.role?.name || null;
    const newRoleName = role.name;

    await user.update({ roleId });

    // Record the role assignment in activity logs
    const changeDetails = [
      {
        field: "role",
        before: previousRoleName,
        after: newRoleName,
      },
    ];

    await recordActivity(
      req,
      "update",
      buildUpdateDescription("user", changeDetails, {
        target: user.email || user.username || user.id,
      }),
      {
        entity: "user",
        updatedUserId: user.id,
        updaterId: req.user?.userId,
        changes: changeDetails,
      }
    );

    return res.status(200).json({ 
      error: false, 
      message: "Role assigned to user successfully" 
    });
  } catch (error) {
    console.error("Assign role error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};


//---------------PERMISSIONS---------------

// CREATE PERMISSION 
export const createPermission = async (req, res) => {
  try {
    const { name, label } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: true, message: "Permission name is required" });
    }
    if (!label || !label.trim()) {
      return res.status(400).json({ error: true, message: "Permission label is required" });
    }

    const existingPermission = await Permission.findOne({ where: { name } });
    if (existingPermission) {
      return res.status(400).json({ error: true, message: "Permission already exists" });
    }

    const permission = await Permission.create({ name, label });
    await recordActivity(
      req,
      "create",
      buildCreateDescription("permission", permission.label || permission.name),
      { permissionId: permission.id }
    );
    return res.status(201).json({ error: false, permission, message: "Permission created successfully" });
  } catch (error) {
    console.error("Create permission error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// GET ALL PERMISSIONS 
export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      order: [["name", "ASC"]],
    });
    return res.status(200).json({ error: false, permissions });
  } catch (error) {
    console.error("Get all permissions error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// UPDATE PERMISSION
export const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, label } = req.body || {};

    const permission = await Permission.findByPk(id);
    if (!permission) {
      return res.status(404).json({ error: true, message: "Permission not found" });
    }

    const updateData = {};
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ error: true, message: "Permission name is required" });
      }
      const existing = await Permission.findOne({ where: { name } });
      if (existing && existing.id !== Number(id)) {
        return res.status(400).json({ error: true, message: "Permission name already in use" });
      }
      updateData.name = name;
    }
    if (label !== undefined) {
      if (!label.trim()) {
        return res.status(400).json({ error: true, message: "Permission label is required" });
      }
      updateData.label = label;
    }

    const changedFields = Object.entries(updateData).map(([field, after]) => ({
      field,
      before: permission[field],
      after,
    })).filter((change) => change.before !== change.after);

    await permission.update(updateData);

    if (changedFields.length > 0) {
      await recordActivity(
        req,
        "update",
        buildUpdateDescription("permission", changedFields, { target: permission.label || permission.name }),
        { permissionId: permission.id, changes: changedFields }
      );
    }

    return res.status(200).json({ error: false, permission, message: "Permission updated successfully" });
  } catch (error) {
    console.error("Update permission error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// DELETE PERMISSION
export const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await Permission.findByPk(id);
    if (!permission) {
      return res.status(404).json({ error: true, message: "Permission not found" });
    }
    const deleted = await Permission.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: true, message: "Permission not found" });
    }
    await recordActivity(
      req,
      "delete",
      buildDeleteDescription("permission", permission.label || permission.name),
      { permissionId: permission.id }
    );
    return res.status(200).json({ error: false, message: "Permission deleted successfully" });
  } catch (error) {
    console.error("Delete permission error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};





// CHECK USER PERMISSION
export const checkUserPermission = async (req, res) => {
  try {
    const { userId, permissionName } = req.body;
    if (!userId || !permissionName) {
      return res.status(400).json({ error: true, message: "userId and permissionName are required" });
    }

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: "role",
          include: [{ model: Permission, as: "Permissions", attributes: ["id", "name"] }],
        },
      ],
    });
    if (!user) {
      return res.status(400).json({ error: true, message: "User not found" });
    }

    const hasPermission = user.role.Permissions.some((perm) => perm.name === permissionName);
    return res.status(200).json({
      error: false,
      hasPermission,
      message: hasPermission ? "User has permission" : "User does not have permission",
    });
  } catch (error) {
    console.error("Check user permission error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};