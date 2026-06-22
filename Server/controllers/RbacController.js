import { Role, Permission, RolePermission, User } from "../models/index.js";

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
        include: [{ model: Permission, attributes: ["id", "name"], as: "Permissions" }],
      });
      return res.status(200).json({ error: false, roles });
    } catch (error) {
      console.error("Get all roles error:", error.message, error.stack);
      return res.status(500).json({ error: true, message: error.message || "Internal Server Error" });
    }
  };


//---------------PERMISSIONS---------------

// CREATE PERMISSION 
export const createPermission = async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: true, message: "Permission name is required" });
      }
  
      const existingPermission = await Permission.findOne({ where: { name } });
      if (existingPermission) {
        return res.status(400).json({ error: true, message: "Permission already exists" });
      }
  
      const permission = await Permission.create({ name });
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