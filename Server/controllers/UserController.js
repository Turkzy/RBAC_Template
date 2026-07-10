import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import Role from "../models/RoleModel.js";
import Permission from "../models/PermissionModel.js";
import Workgroup from "../models/WorkgroupModel.js";
import Units from "../models/UnitsModel.js";
import Department from "../models/DepartmentModel.js";
import { saveUploadedFile, deleteUploadedFile } from "../services/fileService.js";
import { setAuthCookie, clearAuthCookie } from "../utils/cookieHelper.js";
import { recordActivity } from "../services/activityService.js";
import {
  buildCreateDescription,
  buildUpdateDescription,
  buildDeleteDescription,
  buildActivateDescription,
  buildDeactivateDescription,
} from "../utils/activityLogMessage.js";
import { canAssignRole } from "../utils/roleHierarchy.js";
import { getUserAccessScope } from "../utils/accessControl.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { createCsrfToken } from "../utils/csrf.js";
import { generateTwoFactorCode, storeTwoFactorCode, verifyTwoFactorCode } from "../utils/twoFactor.js";
import { createTrustedDeviceToken, verifyTrustedDeviceToken } from "../utils/trustDevice.js";
import { sendEmail } from "../config/mail.js";

const JWT_SECRET = process.env.JWT_SECRET;

// ─────────────────────────────────────────
// HELPER — fetch user with role + permissions
// ─────────────────────────────────────────
const getUserWithPermissions = async (userId) => {
  return User.findByPk(userId, {
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Role,
        as: "role",
        include: [{ model: Permission, as: "Permissions", attributes: ["id", "name", "label"] }],
      },
      { model: Workgroup, as: "workgroup" },
      { model: Units, as: "units" },
      { model: Department, as: "department" },
    ],
  });
};

// ─────────────────────────────────────────
// FORMAT user for API response
// - permissions[]: plain keys (e.g. "users.view") so frontend hasPermission() works
// - permissionDetails[]: { name, label } pairs for UI display (e.g. ViewProfilePage)
// ─────────────────────────────────────────
const formatUser = (user) => ({
  id: user.id,
  firstName: user.firstName,
  middleName: user.middleName,
  lastName: user.lastName,
  fullName: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" "),
  email: user.email,
  username: user.username,
  imageUrl: user.imageUrl,
  roleId: user.roleId,
  role: user.role?.name || null,
  permissions: user.role?.Permissions?.map((p) => p.name) || [],
  permissionDetails: user.role?.Permissions?.map((p) => ({ name: p.name, label: p.label })) || [],
  workgroupId: user.workgroupId,
  workgroup: user.workgroup?.workgroupName || null,
  unitsId: user.unitsId,
  units: user.units?.UnitName || null,
  position: user.position || null,
  address: user.address || null,
  birthdate: user.birthdate || null,
  DepartmentId: user.DepartmentId || null,
  department: user.department?.departmentName || null,
  status: user.status,
  lastLogin: user.lastLogin,
  twoFactorEnabled: !!user.twoFactorEnabled,
});

// ─────────────────────────────────────────
// CREATE NEW ACCOUNT (Self-registration)
// ─────────────────────────────────────────
export const createAccount = async (req, res) => {
  try {
    const { email, password, username, roleId, firstName, middleName, lastName, workgroupId, unitsId, position, address, birthdate, DepartmentId } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: true, message: "Email, username and password are required" });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({ error: true, message: "First name and last name are required" });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: true, message: "Invalid email format" });
    }

    const isEmailTaken = await User.findOne({ where: { email } });
    const isUsernameTaken = await User.findOne({ where: { username } });
    if (isEmailTaken || isUsernameTaken) {
      console.warn(`Account creation conflict for email=${email} username=${username}`);
      try {
        await recordActivity(req, "create_conflict", "Account creation conflict detected", {
          email,
          username,
        });
      } catch (e) {
        console.error("Failed to record create_conflict activity:", e?.message || e);
      }
      return res.status(409).json({ error: true, message: "Account creation failed due to conflict" });
    }

    // ✅ Admin (AccountPage "Add User") can pass a roleId directly.
    // Falls back to the default "User" role for plain self-registration.
    let assignedRole;
    if (roleId) {
      assignedRole = await Role.findByPk(roleId);
      if (!assignedRole) {
        return res.status(400).json({ error: true, message: "Selected role does not exist" });
      }
    } else {
      assignedRole = await Role.findOne({ where: { name: "User" } });
      if (!assignedRole) {
        return res.status(500).json({ error: true, message: "Default role not found. Please run seedRoles.js first." });
      }
    }

    if (workgroupId) {
      const workgroupExists = await Workgroup.findByPk(workgroupId);
      if (!workgroupExists) {
        return res.status(400).json({ error: true, message: "Selected workgroup does not exist" });
      }
    }

    if (unitsId) {
      const unitExists = await Units.findByPk(unitsId);
      if (!unitExists) {
        return res.status(400).json({ error: true, message: "Selected unit does not exist" });
      }
    }

    if (DepartmentId) {
      const departmentExists = await Department.findByPk(DepartmentId);
      if (!departmentExists) {
        return res.status(400).json({ error: true, message: "Selected department does not exist" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      middleName: middleName || null,
      lastName,
      email,
      password: hashedPassword,
      username,
      roleId: assignedRole.id,
      workgroupId: workgroupId || null,
      unitsId: unitsId || null,
      position: position || null,
      address: address || null,
      birthdate: birthdate || null,
      DepartmentId: DepartmentId || null,
    });

    await recordActivity(req, "create", buildCreateDescription("user", newUser.email || `${newUser.firstName} ${newUser.lastName}`), {
      entity: "user",
      createdUserId: newUser.id,
      createdUserEmail: newUser.email,
      createdUserName: `${newUser.firstName} ${newUser.lastName}`,
    });

    // When an account is created by an authenticated admin (via AccountPage),
    // do NOT set the auth cookie — that would log the requester in as the
    // newly-created user. Only return the created user's data.
    const fullUser = await getUserWithPermissions(newUser.id);

    return res.status(201).json({
      error: false,
      user: formatUser(fullUser),
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Create account error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password, code } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: true, message: "Email and password are required" });
    }

    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: "role" }],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      try {
        await recordActivity(req, "login_failed", "Failed login attempt", {
          emailAttempted: email,
          ip: req.ip,
          userAgent: req.get("user-agent") || null,
        });
      } catch (logErr) {
        console.error("Failed to record login_failed activity:", logErr?.message || logErr);
      }
      return res.status(400).json({ error: true, message: "Invalid email or password" });
    }

    if (user.status !== "Active") {
      try {
        await recordActivity(req, "login_blocked", "Login attempt to deactivated account", {
          userId: user.id,
          email: user.email,
          ip: req.ip,
          userAgent: req.get("user-agent") || null,
        });
      } catch (logErr) {
        console.error("Failed to record login_blocked activity:", logErr?.message || logErr);
      }
      return res.status(403).json({ error: true, message: "This account has been deactivated. Please contact your administrator." });
    }

    // Skip 2FA if a valid trusted device cookie is present
    if (user.twoFactorEnabled && !code) {
      const trustedDeviceToken = req.cookies?.trustedDevice;
      if (trustedDeviceToken) {
        const trustedDevice = verifyTrustedDeviceToken(trustedDeviceToken);
        if (trustedDevice && trustedDevice.userId === user.id) {
          const accessToken = jwt.sign(
            { userId: user.id, email: user.email, username: user.username, roleId: user.roleId },
            JWT_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRATION || "24h" }
          );

          setAuthCookie(res, accessToken);
          const csrfToken = createCsrfToken();
          res.cookie("csrfToken", csrfToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000,
          });

          await user.update({ lastLogin: new Date() });
          await recordActivity(req, "login", "User logged in via trusted device", {
            entity: "user",
            userId: user.id,
            userEmail: user.email,
          });

          const fullUser = await getUserWithPermissions(user.id);
          return res.status(200).json({ error: false, user: formatUser(fullUser), csrfToken, message: "Login successful" });
        }
      }

      const twoFactorCode = generateTwoFactorCode();
      storeTwoFactorCode(user.id, twoFactorCode);
      void sendEmail(
        user.email,
        "Your NDC CMS verification code",
        `<p>Your verification code is <strong>${twoFactorCode}</strong>. It expires in 10 minutes.</p>`
      ).catch((e) => console.error("Failed to send 2FA email:", e?.message || e));

      return res.status(200).json({ error: false, requiresTwoFactor: true, message: "A verification code has been sent to your email." });
    }

    // If code provided, validate
    if (user.twoFactorEnabled && code) {
      if (!verifyTwoFactorCode(user.id, code)) {
        try {
          await recordActivity(req, "two_factor_failed", "Failed two-factor verification", { userId: user.id, ip: req.ip });
        } catch (e) {
          console.error("Failed to record two_factor_failed activity:", e?.message || e);
        }
        return res.status(401).json({ error: true, message: "Invalid or expired verification code" });
      }
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, username: user.username, roleId: user.roleId },
      JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRATION || "24h" }
    );

    setAuthCookie(res, accessToken);
    const csrfToken = createCsrfToken();
    res.cookie("csrfToken", csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // ✅ Record last login timestamp
    await user.update({ lastLogin: new Date() });

    await recordActivity(req, "login", "User logged in", {
      entity: "user",
      userId: user.id,
      userEmail: user.email,
    });

    // ✅ Return full user with permissions so frontend can gate UI
    const fullUser = await getUserWithPermissions(user.id);

    return res.status(200).json({
      error: false,
      user: formatUser(fullUser),
      csrfToken,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const setTwoFactor = async (req, res) => {
  try {
    const { enabled } = req.body;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: true, message: "Unauthorized" });
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: true, message: "User not found" });
    user.twoFactorEnabled = !!enabled;
    await user.save();

    if (!enabled) {
      res.clearCookie("trustedDevice", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      });
    }

    return res.status(200).json({ error: false, user: formatUser(await getUserWithPermissions(userId)), message: `Two-factor ${enabled ? 'enabled' : 'disabled'}` });
  } catch (error) {
    console.error("Set two-factor error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// GET ALL USERS
// ─────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const requester = await User.findByPk(req.user?.userId, {
      include: [
        {
          model: Role,
          as: "role",
          include: [{ model: Permission, as: "Permissions", attributes: ["id", "name"] }],
        },
      ],
    });

    if (!requester?.role) {
      return res.status(403).json({ error: true, message: "Forbidden: No role assigned" });
    }

    // If the requester's role includes the accounts.manage permission, treat
    // them like a supervisor for listing purposes (no department/self restriction).
    const rolePermNames = requester.role?.Permissions?.map((p) => p.name) || [];
    const allowFullAccess = rolePermNames.includes(PERMISSIONS.ACCOUNTS_MANAGE);

    const scope = allowFullAccess ? null : getUserAccessScope(requester);
    const where = scope && scope.DepartmentId !== undefined ? { DepartmentId: scope.DepartmentId } : {};

    const users = await User.findAll({
      where,
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Role,
          as: "role",
          include: [{ model: Permission, as: "Permissions", attributes: ["id", "name", "label"] }],
        },
        { model: Workgroup, as: "workgroup" },
        { model: Units, as: "units" },
        { model: Department, as: "department" },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ error: false, users: users.map(formatUser) });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// UPDATE USER
// ─────────────────────────────────────────
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    // express-fileupload does not set req.body when a multipart request has
    // no non-file fields (e.g. avatar-only uploads from ViewProfilePage),
    // so it can come through as undefined — default it to {} before destructuring.
    const {
      email,
      password,
      currentPassword,
      username,
      roleId,
      status,
      firstName,
      middleName,
      lastName,
      workgroupId,
      unitsId,
      position,
      address,
      birthdate,
      DepartmentId,
    } = req.body || {};

    const currentUser = await User.findByPk(id, {
      include: [
        { model: Role, as: "role" },
        { model: Workgroup, as: "workgroup" },
        { model: Units, as: "units" },
        { model: Department, as: "department" },
      ],
    });
    if (!currentUser) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const updateData = {};

    if (email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: true, message: "Invalid email format" });
      }
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail && existingEmail.id !== Number(id)) {
        console.warn(`Update conflict: email ${email} already in use (target=${id})`);
        try {
          await recordActivity(req, "update_conflict", "Email conflict on update", {
            updaterId: req.user?.userId,
            targetUserId: id,
            field: "email",
            value: email,
          });
        } catch (e) {
          console.error("Failed to record update_conflict activity:", e?.message || e);
        }
        return res.status(409).json({ error: true, message: "Update failed due to conflict" });
      }
      updateData.email = email;
    }

    if (password) {
      const currentUserId = Number(req.user?.userId);
      const targetUserId = Number(id);

      if (typeof password !== "string" || password.trim() === "") {
        return res.status(400).json({ error: true, message: "Password cannot be empty." });
      }

      if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(password)) {
        return res.status(400).json({ error: true, message: "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character." });
      }

      if (currentUserId === targetUserId) {
        if (!currentPassword) {
          return res.status(400).json({ error: true, message: "Current password is required to change password." });
        }

        const isMatch = await bcrypt.compare(currentPassword, currentUser.password);
        if (!isMatch) {
          return res.status(400).json({ error: true, message: "Current password is incorrect." });
        }
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername && existingUsername.id !== Number(id)) {
        console.warn(`Update conflict: username ${username} already in use (target=${id})`);
        try {
          await recordActivity(req, "update_conflict", "Username conflict on update", {
            updaterId: req.user?.userId,
            targetUserId: id,
            field: "username",
            value: username,
          });
        } catch (e) {
          console.error("Failed to record update_conflict activity:", e?.message || e);
        }
        return res.status(409).json({ error: true, message: "Update failed due to conflict" });
      }
      updateData.username = username;
    }

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    // Middle name is optional — allow explicitly clearing it by sending an
    // empty string, but ignore when omitted.
    if (middleName !== undefined) updateData.middleName = middleName || null;
    if (position !== undefined) updateData.position = position || null;
    if (address !== undefined) updateData.address = address || null;
    if (birthdate !== undefined) updateData.birthdate = birthdate || null;

    // ✅ Role reassignment (used by the Edit User modal)
    let newRole = null;
    let newWorkgroup = null;
    let newUnit = null;
    let newDepartment = null;

    if (workgroupId !== undefined) {
      if (workgroupId) {
        newWorkgroup = await Workgroup.findByPk(workgroupId);
        if (!newWorkgroup) {
          return res.status(400).json({ error: true, message: "Selected workgroup does not exist" });
        }
      }
      updateData.workgroupId = workgroupId || null;
    }

    if (unitsId !== undefined) {
      if (unitsId) {
        newUnit = await Units.findByPk(unitsId);
        if (!newUnit) {
          return res.status(400).json({ error: true, message: "Selected unit does not exist" });
        }
      }
      updateData.unitsId = unitsId || null;
    }

    if (DepartmentId !== undefined) {
      if (DepartmentId) {
        newDepartment = await Department.findByPk(DepartmentId);
        if (!newDepartment) {
          return res.status(400).json({ error: true, message: "Selected department does not exist" });
        }
      }
      updateData.DepartmentId = DepartmentId || null;
    }

    if (roleId !== undefined) {
      newRole = await Role.findByPk(roleId);
      if (!newRole) {
        return res.status(400).json({ error: true, message: "Selected role does not exist" });
      }

      const requester = await User.findByPk(req.user?.userId, {
        include: [{ model: Role, as: "role" }],
      });

      if (!requester?.role) {
        return res.status(403).json({ error: true, message: "Forbidden: No role assigned" });
      }

      const isSelfTarget = Number(id) === Number(req.user?.userId);
      const requesterRoleName = requester.role?.name;
      const targetRoleName = newRole.name;

      if (isSelfTarget) {
        return res.status(403).json({ error: true, message: "You cannot change your own role" });
      }

      if (!canAssignRole(requesterRoleName, targetRoleName)) {
        return res.status(403).json({ error: true, message: "You are not authorized to assign this role" });
      }

      updateData.roleId = roleId;
    }

    // ✅ Status toggle (used by Deactivate/Activate)
    if (status !== undefined) {
      if (!["Active", "Inactive"].includes(status)) {
        return res.status(400).json({ error: true, message: "Invalid status value" });
      }
      updateData.status = status;
    }

    if (req.body.removeImage || req.body.removeImage === "true") {
      if (currentUser.imageUrl) {
        deleteUploadedFile(currentUser.imageUrl);
      }
      updateData.imageUrl = null;
    }

    if (req.files && req.files.image) {
      try {
        const uploadedFilename = await saveUploadedFile(req.files.image);
        if (currentUser.imageUrl) {
          deleteUploadedFile(currentUser.imageUrl);
        }
        updateData.imageUrl = uploadedFilename;
      } catch (fileError) {
        return res.status(400).json({ error: true, message: fileError.message });
      }
    }

    const [updated] = await User.update(updateData, { where: { id } });
    if (!updated) {
      return res.status(404).json({ error: true, message: "User not found or not updated" });
    }

    const updatedUser = await getUserWithPermissions(id);

    // Build detailed change list (exclude password) and only keep fields that actually changed.
    const changeDetails = Object.entries(updateData)
      .filter(([field]) => field !== "password")
      .map(([field, afterValue]) => {
        let beforeValue = currentUser[field];
        let afterDisplay = afterValue;
        let label = field;

        if (field === "roleId") {
          beforeValue = currentUser.role?.name ?? currentUser.roleId;
          afterDisplay = newRole ? newRole.name : afterValue;
          label = "role";
        }
        if (field === "workgroupId") {
          beforeValue = currentUser.workgroup?.workgroupName ?? currentUser.workgroupId;
          afterDisplay = newWorkgroup ? newWorkgroup.workgroupName : afterValue;
          label = "workgroup";
        }
        if (field === "unitsId") {
          beforeValue = currentUser.units?.UnitName ?? currentUser.unitsId;
          afterDisplay = newUnit ? newUnit.UnitName : afterValue;
          label = "units";
        }
        if (field === "DepartmentId") {
          beforeValue = currentUser.department?.departmentName ?? currentUser.DepartmentId;
          afterDisplay = newDepartment ? newDepartment.departmentName : afterValue;
          label = "department";
        }

        return {
          field: label,
          before: beforeValue === undefined ? null : beforeValue,
          after: afterDisplay === undefined ? null : afterDisplay,
        };
      })
      .filter((change) => change.before !== change.after);

    if (changeDetails.length > 0) {
      const statusChange = changeDetails.find((change) => change.field === "status");
      if (statusChange && changeDetails.length === 1) {
        const action = statusChange.after === "Active" ? "activate" : "deactivate";
        const description = statusChange.after === "Active"
          ? buildActivateDescription("user", updatedUser.email || updatedUser.username || updatedUser.id)
          : buildDeactivateDescription("user", updatedUser.email || updatedUser.username || updatedUser.id);

        await recordActivity(req, action, description, {
          entity: "user",
          updatedUserId: updatedUser.id,
          updaterId: req.user?.userId,
          status: statusChange.after,
        });
      } else {
        const updateDescription = buildUpdateDescription("user", changeDetails, {
          target: updatedUser.email || updatedUser.username || updatedUser.id,
        });

        await recordActivity(req, "update", updateDescription, {
          entity: "user",
          updatedUserId: updatedUser.id,
          updaterId: req.user?.userId,
          changes: changeDetails,
        });
      }
    }

    return res.status(200).json({
      error: false,
      message: "User updated successfully",
      user: formatUser(updatedUser),
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// DELETE USER
// ─────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = await User.findByPk(id);
    if (!currentUser) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const deleted = await User.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const userDisplay = currentUser.email || `${currentUser.firstName} ${currentUser.lastName}`;

    await recordActivity(req, "delete", buildDeleteDescription("user", userDisplay), {
      entity: "user",
      deletedUserId: id,
      deletedUserEmail: currentUser.email,
      deleterId: req.user?.userId,
    });

    return res.status(200).json({ error: false, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// VERIFY AUTH
// ─────────────────────────────────────────
export const verifyAuth = async (req, res) => {
  try {
    // ✅ Now returns permissions[] so frontend stays in sync after refresh
    const fullUser = await getUserWithPermissions(req.user.userId);

    if (!fullUser) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    if (fullUser.status !== "Active") {
      clearAuthCookie(res);
      return res.status(403).json({ error: true, message: "This account has been deactivated. Please contact your administrator." });
    }

    return res.status(200).json({
      error: false,
      user: formatUser(fullUser),
      message: "Authentication verified",
    });
  } catch (error) {
    console.error("Verify auth error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    clearAuthCookie(res);

    await recordActivity(req, "logout", "User logged out", {
      entity: "user",
      userId: req.user?.userId ?? null,
      userEmail: req.user?.email ?? null,
    });

    return res.status(200).json({ error: false, message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const trustDevice = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: true, message: "Unauthorized" });
    const token = createTrustedDeviceToken(userId, 30);
    res.cookie("trustedDevice", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ error: false, message: "Trusted device set" });
  } catch (error) {
    console.error("Set trusted device error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};