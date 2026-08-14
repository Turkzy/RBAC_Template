import Compliance from "../models/ComplianceModel.js";
import User from "../models/UserModel.js";
import Role from "../models/RoleModel.js";
import Permission from "../models/PermissionModel.js";
import Workgroup from "../models/WorkgroupModel.js";
import Department from "../models/DepartmentModel.js";
import Units from "../models/UnitsModel.js";
import ComplianceNotificationRead from "../models/ComplianceNotificationReadModel.js";
import { Op, literal } from "sequelize";
import { PERMISSIONS } from "../constants/permissions.js";
import { recordActivity } from "../services/activityService.js";
import { sendComplianceDeadlineReminders } from "../services/complianceReminderService.js";
import { saveUploadedFile, deleteUploadedFile, getStoredComplianceFileNames } from "../services/fileService.js";
import { sendEmail } from "../config/mail.js";
import { escapeHtml } from "../services/mailService.js";
import { broadcastComplianceNotificationChange, registerComplianceNotificationStream } from "../services/complianceNotificationStream.js";
import { isChannelEnabled } from "../services/notificationRuleService.js";
import path from "path";
import fs from "fs";

const buildFileUrl = (req, filename, subfolder = "userimages") => {
  if (!filename) return null;

  const protocol = req.protocol || "http";
  const host = req.get("host");

  if (!host) return `/${subfolder}/${filename}`;
  return `${protocol}://${host}/${subfolder}/${filename}`;
};

const parseAssignmentArray = (value) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => Number(item)).filter((item) => !Number.isNaN(item));
  }

  if (typeof value === "number") {
    return [value];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => Number(item)).filter((item) => !Number.isNaN(item));
      }
      if (parsed !== null && parsed !== undefined) {
        const singleValue = Number(parsed);
        return Number.isNaN(singleValue) ? [] : [singleValue];
      }
    } catch {
      return value
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => !Number.isNaN(item));
    }
  }

  return [];
};

const buildSnapshotForItem = async (rawItem) => {
  if (!rawItem) return rawItem;
  const json = rawItem.toJSON ? rawItem.toJSON() : rawItem;

  const userIds = parseAssignmentArray(json.assignedToUserIds).length
    ? parseAssignmentArray(json.assignedToUserIds)
    : parseAssignmentArray(json.assignedToUserId);
  const workgroupIds = parseAssignmentArray(json.assignedToWorkgroupIds).length
    ? parseAssignmentArray(json.assignedToWorkgroupIds)
    : parseAssignmentArray(json.assignedToWorkgroupId);
  const departmentIds = parseAssignmentArray(json.assignedToDepartmentIds).length
    ? parseAssignmentArray(json.assignedToDepartmentIds)
    : parseAssignmentArray(json.assignedToDepartmentId);
  const unitIds = parseAssignmentArray(json.assignedToUnitsIds).length
    ? parseAssignmentArray(json.assignedToUnitsIds)
    : parseAssignmentArray(json.assignedToUnitsId);

  const [usersList, workgroupsList, departmentsList, unitsList, creatorUser] = await Promise.all([
    userIds.length
      ? User.findAll({ where: { id: [...new Set(userIds)] }, attributes: ["id", "firstName", "middleName", "lastName", "username", "email"] })
      : Promise.resolve([]),
    workgroupIds.length
      ? Workgroup.findAll({ where: { id: [...new Set(workgroupIds)] }, attributes: ["id", "workgroupName"] })
      : Promise.resolve([]),
    departmentIds.length
      ? Department.findAll({ where: { id: [...new Set(departmentIds)] }, attributes: ["id", "departmentName"] })
      : Promise.resolve([]),
    unitIds.length
      ? Units.findAll({ where: { id: [...new Set(unitIds)] }, attributes: ["id", "UnitName"] })
      : Promise.resolve([]),
    json.createdBy ? User.findByPk(Number(json.createdBy), { attributes: ["id", "firstName", "middleName", "lastName", "username", "email"] }) : Promise.resolve(null),
  ]);

  const users = (usersList || []).map((u) => (u.toJSON ? u.toJSON() : u));
  const workgroups = (workgroupsList || []).map((w) => (w.toJSON ? w.toJSON() : w));
  const departments = (departmentsList || []).map((d) => (d.toJSON ? d.toJSON() : d));
  const units = (unitsList || []).map((u) => (u.toJSON ? u.toJSON() : u));

  const assignedToUsers = users.map((u) => {
    const fullName = [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ").trim();
    return { id: u.id, firstName: u.firstName || "", middleName: u.middleName || "", lastName: u.lastName || "", username: u.username || "", email: u.email || "", fullName: fullName || u.username || u.email || `User ${u.id}` };
  });

  const assignedToWorkgroups = workgroups.map((w) => ({ id: w.id, workgroupName: w.workgroupName || w.name || `Workgroup ${w.id}` }));
  const assignedToDepartments = departments.map((d) => ({ id: d.id, departmentName: d.departmentName || d.name || `Department ${d.id}` }));
  const assignedToUnits = units.map((u) => ({ id: u.id, UnitName: u.UnitName || u.name || `Unit ${u.id}` }));

  const snapshot = { ...json };
  if (assignedToUsers.length) snapshot.assignedToUsers = assignedToUsers;
  if (assignedToWorkgroups.length) snapshot.assignedToWorkgroups = assignedToWorkgroups;
  if (assignedToDepartments.length) snapshot.assignedToDepartments = assignedToDepartments;
  if (assignedToUnits.length) snapshot.assignedToUnits = assignedToUnits;

  if (json.assignedToUserIds && !snapshot.assignedToUserIds) snapshot.assignedToUserIds = json.assignedToUserIds;
  if (json.assignedToWorkgroupIds && !snapshot.assignedToWorkgroupIds) snapshot.assignedToWorkgroupIds = json.assignedToWorkgroupIds;

  // creator / assignedBy
  if (creatorUser) {
    const cu = creatorUser.toJSON ? creatorUser.toJSON() : creatorUser;
    const fullName = [cu.firstName, cu.middleName, cu.lastName].filter(Boolean).join(" ").trim();
    snapshot.creator = { id: cu.id, firstName: cu.firstName || "", middleName: cu.middleName || "", lastName: cu.lastName || "", username: cu.username || "", email: cu.email || "", fullName: fullName || cu.username || cu.email };
    snapshot.createdByName = snapshot.creator.fullName;
    snapshot.createdByUsername = cu.username || null;
    snapshot.createdByEmail = cu.email || null;
  }

  return snapshot;
};

const COMPLIANCE_STATUS_MAP = {
  compliant: "Compliant",
  "under evaluation": "Under Evaluation",
  "no submission": "No Submission",
  "non-compliant": "Non-Compliant",
  "non compliant": "Non-Compliant",
  "not applicable": "Not Applicable",
  pending: "No Submission",
  "in progress": "Under Evaluation",
  completed: "Compliant",
};

const normalizeComplianceStatus = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return COMPLIANCE_STATUS_MAP[normalized] || "No Submission";
};

const SUBMISSION_STATUS_MAP = {
  "pending review": "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
};

const normalizeSubmissionStatus = (value, fallback = null) => {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  return SUBMISSION_STATUS_MAP[normalized] || fallback;
};

const normalizeSubmissionClosedFlag = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on", "closed"].includes(normalized)) return true;
  if (["0", "false", "no", "off", "open"].includes(normalized)) return false;
  return fallback;
};

const isPrivilegedRoleName = (roleName) => {
  const normalized = String(roleName || "").trim().toLowerCase();
  return normalized === "admin" || normalized === "super admin" || normalized.includes("super");
};

const getDisplayName = (user, fallback = "User") => {
  if (!user) return fallback;
  const fullName = [user.firstName, user.middleName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (fullName) return fullName;
  return user.username || user.email || fallback;
};

const collectRecipientUserIds = (item) => {
  const ids = new Set();

  const addCandidate = (value) => {
    if (value === null || value === undefined || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        const normalized = Number(entry);
        if (!Number.isNaN(normalized) && normalized > 0) ids.add(normalized);
      });
      return;
    }

    const normalized = Number(value);
    if (!Number.isNaN(normalized) && normalized > 0) ids.add(normalized);
  };

  addCandidate(item?.assignedToUserId);
  addCandidate(item?.assignedToUserIds);
  addCandidate(item?.createdBy);

  return [...ids];
};

const upsertDeletedComplianceRecordRows = async (item, { currentUserId, recordKind = "calendar-delete" }) => {
  const recipientIds = collectRecipientUserIds(item);
  if (!recipientIds.length) return 0;

  const snapshotBase = item?.toJSON ? item.toJSON() : item;
  const now = new Date();
  // build enriched snapshot (resolve assigned names) when creating deleted notification rows
  const enrichedSnapshot = await buildSnapshotForItem(item).catch(() => (item.toJSON ? item.toJSON() : item));
  const rows = recipientIds.map((userId) => ({
    complianceId: item.id,
    userId,
    readAt: null,
    isDeleted: true,
    isPermanentlyDeleted: false,
    deletedAt: now,
    snapshot: JSON.stringify({
      ...enrichedSnapshot,
      deletedFrom: recordKind,
      deletedByUserId: currentUserId,
      deletedVia: "calendar",
    }),
  }));

  if (!rows.length) return 0;

  await ComplianceNotificationRead.bulkCreate(rows, {
    updateOnDuplicate: ["readAt", "isDeleted", "deletedAt", "updatedAt", "snapshot", "isPermanentlyDeleted"],
  });

  return rows.length;
};

const buildSubmissionNoticeHtml = ({ creatorName, submitterName, title, submittedAt, isResubmission = false }) => {
  const safeCreatorName = escapeHtml(creatorName || "there");
  const safeSubmitterName = escapeHtml(submitterName || "A user");
  const safeTitle = escapeHtml(title || "Compliance item");
  const safeSubmittedAt = escapeHtml(submittedAt || "just now");
  const safeActionText = isResubmission ? "submitted updated document(s)" : "submitted document(s)";

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:640px;margin:0 auto;padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">
      <h2 style="margin:0 0 12px;color:#0f766e;">Compliance Submission Received</h2>
      <p style="margin:0 0 10px;">Hello ${safeCreatorName},</p>
      <p style="margin:0 0 10px;">${safeSubmitterName} ${safeActionText} for your compliance item:</p>
      <p style="margin:0 0 10px;"><strong>${safeTitle}</strong></p>
      <p style="margin:0 0 18px;color:#475569;">Submitted at: ${safeSubmittedAt}</p>
      <p style="margin:0;">Please review the uploaded submission in the Document Management page.</p>
    </div>
  `;
};

const buildReviewDecisionHtml = ({ submitterName, reviewerName, title, decision, remarks }) => {
  const safeSubmitterName = escapeHtml(submitterName || "there");
  const safeReviewerName = escapeHtml(reviewerName || "Reviewer");
  const safeTitle = escapeHtml(title || "Compliance item");
  const safeDecision = escapeHtml(decision || "Updated");
  const safeRemarks = escapeHtml(remarks || "-");

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:640px;margin:0 auto;padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">
      <h2 style="margin:0 0 12px;color:#0f766e;">Submission Review Update</h2>
      <p style="margin:0 0 10px;">Hello ${safeSubmitterName},</p>
      <p style="margin:0 0 10px;">Your submitted document(s) have been reviewed by ${safeReviewerName}.</p>
      <p style="margin:0 0 10px;"><strong>${safeTitle}</strong></p>
      <p style="margin:0 0 10px;">Decision: <strong>${safeDecision}</strong></p>
      <p style="margin:0 0 18px;">Reviewer remarks: ${safeRemarks}</p>
      <p style="margin:0;">Please check Submitted Documents for details.</p>
    </div>
  `;
};

const extractUploadFiles = (req) => {
  const incoming = req?.files;
  if (!incoming) return [];

  const candidates = [incoming.files, incoming.file, incoming.attachments]
    .filter(Boolean)
    .flatMap((entry) => (Array.isArray(entry) ? entry : [entry]))
    .filter((entry) => entry && typeof entry === "object" && entry.name);

  return candidates;
};

const uploadComplianceFiles = async (req) => {
  const files = extractUploadFiles(req);
  if (!files.length) {
    return { fileUrls: [], originalFilenames: [] };
  }

  const uploaded = await Promise.all(
    files.map(async (file) => {
      const storedName = await saveUploadedFile(file, "compliances");
      return {
        fileUrl: buildFileUrl(req, storedName, "compliances"),
        originalFilename: file.name,
      };
    })
  );

  return {
    fileUrls: uploaded.map((entry) => entry.fileUrl).filter(Boolean),
    originalFilenames: uploaded.map((entry) => entry.originalFilename).filter(Boolean),
  };
};

const getAssignmentScope = async (req) => {
  const userId = Number(req.user?.userId ?? req.user?.id ?? 0);
  if (!userId) {
    return { userId: null, workgroupId: null, departmentId: null, unitsId: null, canViewAll: false };
  }

  const currentUser = await User.findByPk(userId, {
    attributes: ["id", "workgroupId", "DepartmentId", "unitsId"],
    include: [{
      model: Role,
      as: "role",
      attributes: ["name"],
      include: [{ model: Permission, as: "Permissions", attributes: ["name"] }],
    }],
  });

  const roleName = String(currentUser?.role?.name || "").trim().toLowerCase();
  const isSuperAdmin = roleName === "super admin" || roleName.includes("super");
  const rolePermissions = Array.isArray(currentUser?.role?.Permissions)
    ? currentUser.role.Permissions.map((permission) => permission?.name).filter(Boolean)
    : [];
  const hasCalendarViewAllPermission = rolePermissions.includes(PERMISSIONS.CALENDAR_VIEW_ALL);
  const canViewAll = isSuperAdmin || hasCalendarViewAllPermission;

  return {
    userId: currentUser?.id ?? null,
    workgroupId: currentUser?.workgroupId ?? null,
    departmentId: currentUser?.DepartmentId ?? null,
    unitsId: currentUser?.unitsId ?? null,
    canViewAll,
  };
};

const buildUnreadNotificationWhere = (scope, from) => {
  const assignmentWhere = scope.canViewAll
    ? null
    : {
        [Op.or]: [
          ...(scope.userId ? [{ assignedToUserId: scope.userId }, literal(`JSON_CONTAINS(assignedToUserIds, '${scope.userId}', '$')`)] : []),
          ...(scope.workgroupId ? [{ assignedToWorkgroupId: scope.workgroupId }, literal(`JSON_CONTAINS(assignedToWorkgroupIds, '${scope.workgroupId}', '$')`)] : []),
          ...(scope.departmentId ? [{ assignedToDepartmentId: scope.departmentId }, literal(`JSON_CONTAINS(assignedToDepartmentIds, '${scope.departmentId}', '$')`)] : []),
          ...(scope.unitsId ? [{ assignedToUnitsId: scope.unitsId }, literal(`JSON_CONTAINS(assignedToUnitsIds, '${scope.unitsId}', '$')`)] : []),
          ...(scope.userId ? [{ createdBy: scope.userId }] : []),
        ],
      };

  const unreadBaseDate = from ? new Date(from) : new Date();
  const unreadWindowStart = new Date(
    unreadBaseDate.getFullYear(),
    unreadBaseDate.getMonth(),
    unreadBaseDate.getDate(),
    0,
    0,
    0,
    0,
  );
  const unreadWindowEnd = new Date(unreadWindowStart);
  unreadWindowEnd.setDate(unreadWindowEnd.getDate() + 3);
  unreadWindowEnd.setHours(23, 59, 59, 999);

  const deadlineSoonCondition = {
    [Op.and]: [
      {
        endDate: {
          [Op.gte]: unreadWindowStart,
          [Op.lte]: unreadWindowEnd,
        },
      },
      {
        [Op.or]: [
          { isSubmissionClosed: false },
          { submissionStatus: null },
          { submissionStatus: { [Op.ne]: "Approved" } },
        ],
      },
    ],
  };

  if (scope.canViewAll) {
    return {
      [Op.or]: [
        {
          [Op.and]: [
            { submissionStatus: "Pending Review" },
            { fileUrls: { [Op.ne]: null } },
          ],
        },
        deadlineSoonCondition,
      ],
    };
  }

  if (!scope.userId) {
    return { id: null };
  }

  return {
    [Op.or]: [
      {
        [Op.and]: [
          { createdBy: scope.userId },
          { submissionStatus: "Pending Review" },
          { fileUrls: { [Op.ne]: null } },
        ],
      },
      {
        [Op.and]: [
          { submittedBy: scope.userId },
          { submissionStatus: { [Op.in]: ["Approved", "Rejected"] } },
        ],
      },
      {
        [Op.and]: [assignmentWhere, deadlineSoonCondition],
      },
    ],
  };
};

// Same classification logic the Header popover uses on the frontend
// (getNotificationMeta in Header.jsx), mirrored here so we can check each
// item's category against the NotificationRule.inApp toggle before it's
// ever sent to the client.
const getNotificationCategory = (json, scope) => {
  const status = String(json?.submissionStatus || "").trim();

  const isCreatorAlert =
    scope.userId &&
    Number(json?.createdBy) === Number(scope.userId) &&
    status === "Pending Review" &&
    Boolean(json?.fileUrls);

  if (isCreatorAlert) return "compliance_submission_received";

  const isSubmitterDecisionAlert =
    scope.userId &&
    Number(json?.submittedBy) === Number(scope.userId) &&
    (status === "Approved" || status === "Rejected");

  if (isSubmitterDecisionAlert) return "compliance_review_decision";

  return "compliance_deadline_reminder";
};

export const listComplianceItems = async (req, res) => {
  try {
    const { from, to, unread, includeDeleted } = req.query;
    const includeUnread = String(unread || "").toLowerCase() === "true";
    const includeDeletedItems = String(includeDeleted || "").toLowerCase() === "true";
    const scope = await getAssignmentScope(req);
    const dateWhere = {};

    if (!includeUnread) {
      if (from && to) {
        dateWhere[Op.and] = [
          { startDate: { [Op.lte]: new Date(to) } },
          { endDate: { [Op.gte]: new Date(from) } },
        ];
      } else if (from) {
        dateWhere.endDate = { [Op.gte]: new Date(from) };
      } else if (to) {
        dateWhere.startDate = { [Op.lte]: new Date(to) };
      }
    }

    const assignmentWhere = scope.canViewAll
      ? null
      : {
          [Op.or]: [
            ...(scope.userId ? [{ assignedToUserId: scope.userId }, literal(`JSON_CONTAINS(assignedToUserIds, '${scope.userId}', '$')`)] : []),
            ...(scope.workgroupId ? [{ assignedToWorkgroupId: scope.workgroupId }, literal(`JSON_CONTAINS(assignedToWorkgroupIds, '${scope.workgroupId}', '$')`)] : []),
            ...(scope.departmentId ? [{ assignedToDepartmentId: scope.departmentId }, literal(`JSON_CONTAINS(assignedToDepartmentIds, '${scope.departmentId}', '$')`)] : []),
            ...(scope.unitsId ? [{ assignedToUnitsId: scope.unitsId }, literal(`JSON_CONTAINS(assignedToUnitsIds, '${scope.unitsId}', '$')`)] : []),
            ...(scope.userId ? [{ createdBy: scope.userId }] : []),
          ],
        };

    const notificationWhere = includeUnread ? buildUnreadNotificationWhere(scope, from) : null;

    let where = includeUnread
      ? notificationWhere
      : scope.canViewAll
        ? dateWhere
        : Object.keys(dateWhere).length
          ? { [Op.and]: [dateWhere, assignmentWhere] }
          : assignmentWhere;

    if (!includeDeletedItems && !includeUnread) {
      if (Object.keys(where || {}).length) {
        where = { [Op.and]: [where, { isDeleted: false }] };
      } else {
        where = { isDeleted: false };
      }
    }

    const items = await Compliance.findAll({
      where,
      order: [["startDate", "ASC"]],
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "middleName", "lastName", "username", "email"],
        },
        {
          model: User,
          as: "assignedUser",
          attributes: ["id", "firstName", "middleName", "lastName", "username", "email"],
        },
        {
          model: User,
          as: "submitter",
          attributes: ["id", "firstName", "middleName", "lastName", "username", "email"],
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "firstName", "middleName", "lastName", "username", "email"],
        },
        {
          model: Workgroup,
          as: "assignedWorkgroup",
          attributes: ["id", "workgroupName"],
        },
        {
          model: Department,
          as: "assignedDepartment",
          attributes: ["id", "departmentName"],
        },
        {
          model: Units,
          as: "assignedUnit",
          attributes: ["id", "UnitName"],
        },
      ],
    });

    const assignedUserIds = new Set();
    const assignedWorkgroupIds = new Set();
    const assignedDepartmentIds = new Set();
    const assignedUnitsIds = new Set();

    const itemsData = items.map((item) => {
      const json = item.toJSON();
      const userIds = parseAssignmentArray(json.assignedToUserIds).length
        ? parseAssignmentArray(json.assignedToUserIds)
        : parseAssignmentArray(json.assignedToUserId);
      const workgroupIds = parseAssignmentArray(json.assignedToWorkgroupIds).length
        ? parseAssignmentArray(json.assignedToWorkgroupIds)
        : parseAssignmentArray(json.assignedToWorkgroupId);
      const departmentIds = parseAssignmentArray(json.assignedToDepartmentIds).length
        ? parseAssignmentArray(json.assignedToDepartmentIds)
        : parseAssignmentArray(json.assignedToDepartmentId);
      const unitIds = parseAssignmentArray(json.assignedToUnitsIds).length
        ? parseAssignmentArray(json.assignedToUnitsIds)
        : parseAssignmentArray(json.assignedToUnitsId);

      userIds.forEach((id) => assignedUserIds.add(id));
      workgroupIds.forEach((id) => assignedWorkgroupIds.add(id));
      departmentIds.forEach((id) => assignedDepartmentIds.add(id));
      unitIds.forEach((id) => assignedUnitsIds.add(id));

      return json;
    });

    const [assignedUsers, assignedWorkgroups, assignedDepartments, assignedUnits] = await Promise.all([
      assignedUserIds.size
        ? User.findAll({
            where: { id: [...assignedUserIds] },
            attributes: ["id", "firstName", "middleName", "lastName", "username", "email"],
          })
        : Promise.resolve([]),
      assignedWorkgroupIds.size
        ? Workgroup.findAll({
            where: { id: [...assignedWorkgroupIds] },
            attributes: ["id", "workgroupName"],
          })
        : Promise.resolve([]),
      assignedDepartmentIds.size
        ? Department.findAll({
            where: { id: [...assignedDepartmentIds] },
            attributes: ["id", "departmentName"],
          })
        : Promise.resolve([]),
      assignedUnitsIds.size
        ? Units.findAll({
            where: { id: [...assignedUnitsIds] },
            attributes: ["id", "UnitName"],
          })
        : Promise.resolve([]),
    ]);

    const assignedUserMap = new Map(assignedUsers.map((user) => [user.id, user.toJSON ? user.toJSON() : user]));
    const assignedWorkgroupMap = new Map(assignedWorkgroups.map((workgroup) => [workgroup.id, workgroup.toJSON ? workgroup.toJSON() : workgroup]));
    const assignedDepartmentMap = new Map(assignedDepartments.map((department) => [department.id, department.toJSON ? department.toJSON() : department]));
    const assignedUnitsMap = new Map(assignedUnits.map((unit) => [unit.id, unit.toJSON ? unit.toJSON() : unit]));

    const notificationStateByComplianceId = new Map();
    if (scope.userId && itemsData.length) {
      const notificationStates = await ComplianceNotificationRead.findAll({
        where: {
          userId: scope.userId,
          complianceId: itemsData.map((entry) => entry.id),
        },
        attributes: ["complianceId", "readAt", "isDeleted", "isPermanentlyDeleted", "deletedAt", "snapshot"],
      });

      notificationStates.forEach((state) => {
        notificationStateByComplianceId.set(state.complianceId, state);
      });
    }

    const enrichedItems = itemsData.map((json) => {
      const userIds = parseAssignmentArray(json.assignedToUserIds).length
        ? parseAssignmentArray(json.assignedToUserIds)
        : parseAssignmentArray(json.assignedToUserId);
      const workgroupIds = parseAssignmentArray(json.assignedToWorkgroupIds).length
        ? parseAssignmentArray(json.assignedToWorkgroupIds)
        : parseAssignmentArray(json.assignedToWorkgroupId);
      const departmentIds = parseAssignmentArray(json.assignedToDepartmentIds).length
        ? parseAssignmentArray(json.assignedToDepartmentIds)
        : parseAssignmentArray(json.assignedToDepartmentId);
      const unitIds = parseAssignmentArray(json.assignedToUnitsIds).length
        ? parseAssignmentArray(json.assignedToUnitsIds)
        : parseAssignmentArray(json.assignedToUnitsId);

      const notificationState = notificationStateByComplianceId.get(json.id);
      const isRead = Boolean(notificationState?.readAt) || Boolean(notificationState?.isDeleted);
      const isDeletedNotification = Boolean(notificationState?.isDeleted);
      const isPermanentlyDeletedNotification = Boolean(notificationState?.isPermanentlyDeleted);

      // If a snapshot was stored when the notification was created/updated,
      // prefer the snapshot fields for display so details remain available
      // even if the original compliance row is later soft-deleted or modified.
      let merged = { ...json };
      try {
        let parsed = null;
        if (notificationState?.snapshot) {
          parsed = JSON.parse(notificationState.snapshot);
          merged = { ...merged, ...parsed };
        }
        // Ensure the live isDeleted flag is preserved (or true if either indicates deleted)
        merged.isDeleted = Boolean(json.isDeleted) || Boolean(parsed?.isDeleted);
      } catch (e) {
        // ignore parse errors and fall back to live json
        merged.isDeleted = Boolean(json.isDeleted);
      }

      return {
        ...merged,
        read: isRead,
        notificationDeleted: isDeletedNotification,
        notificationPermanentlyDeleted: isPermanentlyDeletedNotification,
        notificationCategory: getNotificationCategory(merged, scope),
        assignedUsers: userIds.map((id) => assignedUserMap.get(id)).filter(Boolean),
        assignedWorkgroups: workgroupIds.map((id) => assignedWorkgroupMap.get(id)).filter(Boolean),
        assignedDepartments: departmentIds.map((id) => assignedDepartmentMap.get(id)).filter(Boolean),
        assignedUnits: unitIds.map((id) => assignedUnitsMap.get(id)).filter(Boolean),
      };
    });

    let responseItems = enrichedItems.filter((entry) => !entry.notificationPermanentlyDeleted);
    if (includeUnread) {
      responseItems = responseItems.filter((entry) => !entry.read && !entry.notificationDeleted);
    }

    if (includeUnread && responseItems.length) {
      const categories = [...new Set(responseItems.map((entry) => entry.notificationCategory))];
      const enabledFlags = await Promise.all(
        categories.map((category) => isChannelEnabled(category, "inApp"))
      );
      const enabledByCategory = new Map(categories.map((category, i) => [category, enabledFlags[i]]));
      responseItems = responseItems.filter((entry) => enabledByCategory.get(entry.notificationCategory) !== false);
    }

    return res.status(200).json({ error: false, items: responseItems, count: responseItems.length });
  } catch (error) {
    console.error("List compliance items error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const getComplianceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Compliance.findByPk(id);

    if (!item) {
      return res.status(404).json({ error: true, message: "Compliance item not found" });
    }

    const scope = await getAssignmentScope(req);
    if (!itemMatchesScope(item, scope)) {
      return res.status(403).json({ error: true, message: "Unauthorized" });
    }

    return res.status(200).json({ error: false, item: item.toJSON() });
  } catch (error) {
    console.error("Get compliance item error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const itemMatchesScope = (item, scope) => {
  const userIds = parseAssignmentArray(item.assignedToUserIds);
  const workgroupIds = parseAssignmentArray(item.assignedToWorkgroupIds);
  const departmentIds = parseAssignmentArray(item.assignedToDepartmentIds);
  const unitIds = parseAssignmentArray(item.assignedToUnitsIds);

  return (
    (scope.userId && (item.assignedToUserId === scope.userId || userIds.includes(scope.userId) || item.createdBy === scope.userId)) ||
    (scope.workgroupId && (item.assignedToWorkgroupId === scope.workgroupId || workgroupIds.includes(scope.workgroupId))) ||
    (scope.departmentId && (item.assignedToDepartmentId === scope.departmentId || departmentIds.includes(scope.departmentId))) ||
    (scope.unitsId && (item.assignedToUnitsId === scope.unitsId || unitIds.includes(scope.unitsId)))
  );
};

export const markComplianceItemRead = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Compliance.findByPk(id);

    if (!item) {
      return res.status(404).json({ error: true, message: "Compliance item not found" });
    }

    const scope = await getAssignmentScope(req);
    if (!itemMatchesScope(item, scope)) {
      return res.status(403).json({ error: true, message: "Unauthorized" });
    }

    if (!scope.userId) {
      return res.status(400).json({ error: true, message: "User context is required" });
    }

    // enrich snapshot when marking read to preserve readable labels
    const enriched = await buildSnapshotForItem(item).catch(() => (item.toJSON ? item.toJSON() : item));
    await ComplianceNotificationRead.upsert({
      complianceId: item.id,
      userId: scope.userId,
      readAt: new Date(),
      isDeleted: false,
      deletedAt: null,
      snapshot: JSON.stringify(enriched),
    });

    broadcastComplianceNotificationChange({
      action: "mark-read",
      complianceId: item.id,
      actorUserId: scope.userId,
    });

    broadcastComplianceNotificationChange({
      action: "mark-read",
      complianceId: item.id,
      actorUserId: scope.userId,
    });

    return res.status(200).json({ error: false, item, read: true });
  } catch (error) {
    console.error("Mark compliance item read error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const markAllComplianceItemsRead = async (req, res) => {
  try {
    const scope = await getAssignmentScope(req);

    if (!scope.userId) {
      return res.status(200).json({ error: false, updatedCount: 0 });
    }

    const where = buildUnreadNotificationWhere(scope, req.query?.from);
    const items = await Compliance.findAll({ where });
    const complianceIds = items.map((item) => item.id);

    if (!complianceIds.length) {
      return res.status(200).json({ error: false, updatedCount: 0 });
    }

    const now = new Date();
    // build enriched snapshots in parallel for items
    const snapshots = await Promise.all(
      items.map((it) => buildSnapshotForItem(it).catch(() => (it.toJSON ? it.toJSON() : it)))
    );

    await ComplianceNotificationRead.bulkCreate(
      complianceIds.map((complianceId, idx) => {
        const found = items.find((it) => it.id === complianceId);
        const snap = snapshots[idx] || (found ? (found.toJSON ? found.toJSON() : found) : null);
        return {
          complianceId,
          userId: scope.userId,
          readAt: now,
          isDeleted: false,
          deletedAt: null,
          snapshot: snap ? JSON.stringify(snap) : null,
        };
      }),
      {
        updateOnDuplicate: ["readAt", "isDeleted", "deletedAt", "updatedAt", "snapshot"],
      },
    );

    broadcastComplianceNotificationChange({
      action: "mark-all-read",
      actorUserId: scope.userId,
    });

    broadcastComplianceNotificationChange({
      action: "mark-all-read",
      actorUserId: scope.userId,
    });

    return res.status(200).json({ error: false, updatedCount: complianceIds.length });
  } catch (error) {
    console.error("Mark all compliance items read error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const deleteComplianceNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Compliance.findByPk(id);

    if (!item) {
      return res.status(404).json({ error: true, message: "Compliance item not found" });
    }

    const scope = await getAssignmentScope(req);
    if (!itemMatchesScope(item, scope)) {
      return res.status(403).json({ error: true, message: "Unauthorized" });
    }

    if (!scope.userId) {
      return res.status(400).json({ error: true, message: "User context is required" });
    }

    const enrichedSnap = await buildSnapshotForItem(item).catch(() => (item.toJSON ? item.toJSON() : item));
    await ComplianceNotificationRead.upsert({
      complianceId: item.id,
      userId: scope.userId,
      readAt: new Date(),
      isDeleted: true,
      deletedAt: new Date(),
      snapshot: JSON.stringify({
        ...enrichedSnap,
        deletedFrom: "notification-delete",
        deletedByUserId: scope.userId,
        deletedVia: "notification",
      }),
    });

    broadcastComplianceNotificationChange({
      action: "delete-notification",
      complianceId: item.id,
      actorUserId: scope.userId,
    });

    broadcastComplianceNotificationChange({
      action: "delete-notification",
      complianceId: item.id,
      actorUserId: scope.userId,
    });

    return res.status(200).json({ error: false, deleted: true });
  } catch (error) {
    console.error("Delete compliance notification error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};


export const deleteComplianceNotificationPermanent = async (req, res) => {
  try {
    const { id } = req.params;
    const scope = await getAssignmentScope(req);

    if (!scope.userId) {
      return res.status(400).json({ error: true, message: "User context is required" });
    }

    const targetUserId = Number(req.body?.userId ?? req.query?.userId ?? scope.userId);

    const transaction = await Compliance.sequelize.transaction();

    try {
      const complianceItem = await Compliance.findByPk(id, { transaction });
      const storedFileNames = getStoredComplianceFileNames(complianceItem?.toJSON ? complianceItem.toJSON() : complianceItem);

      await ComplianceNotificationRead.destroy({
        where: { complianceId: id },
        transaction,
      });

      await Compliance.destroy({
        where: { id },
        transaction,
      });

      storedFileNames.forEach((fileName) => {
        deleteUploadedFile(fileName, "compliances");
      });

      await transaction.commit();

      broadcastComplianceNotificationChange({
        action: "delete-notification-permanent",
        complianceId: Number(id),
        actorUserId: scope.userId,
        targetUserId,
      });

      return res.status(200).json({ error: false, deleted: true, deletedCount: 1 });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Delete compliance notification permanent error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const listNotificationRecords = async (req, res) => {
  try {
    const scope = await getAssignmentScope(req);

    const where = { isDeleted: true };
    if (req.query.userId) {
      where.userId = Number(req.query.userId);
    }

    const rows = await ComplianceNotificationRead.findAll({
      where,
      attributes: ["id", "complianceId", "userId", "readAt", "isDeleted", "deletedAt", "snapshot"],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "middleName", "lastName", "username", "email"],
        },
      ],
      order: [["deletedAt", "DESC"], ["readAt", "DESC"]],
    });

    const calendarDeleteRecords = rows.filter((row) => {
      const payload = row?.toJSON ? row.toJSON() : row;
      let snapshot = null;
      try {
        snapshot = payload?.snapshot ? JSON.parse(payload.snapshot) : null;
      } catch {
        snapshot = null;
      }

      return snapshot?.deletedVia === "calendar" || snapshot?.deletedFrom === "calendar-delete" || snapshot?.deletedFrom === "calendar";
    });

    const groupedMap = new Map();
    calendarDeleteRecords.forEach((row) => {
      const payload = row?.toJSON ? row.toJSON() : row;
      const complianceId = Number(payload.complianceId);
      if (!Number.isFinite(complianceId)) return;

      const existing = groupedMap.get(complianceId) || {
        complianceId,
        deletedAt: payload.deletedAt || null,
        snapshot: payload.snapshot || null,
        recipientCount: 0,
        recipientUsers: [],
        recipientUserIds: [],
        isDeleted: true,
      };

      if (payload.deletedAt && (!existing.deletedAt || new Date(payload.deletedAt) > new Date(existing.deletedAt))) {
        existing.deletedAt = payload.deletedAt;
      }

      if (payload.snapshot && !existing.snapshot) {
        existing.snapshot = payload.snapshot;
      }

      if (payload.userId) {
        const numericUserId = Number(payload.userId);
        if (!existing.recipientUserIds.includes(numericUserId)) {
          existing.recipientUserIds.push(numericUserId);
          existing.recipientCount += 1;
        }
      }

      if (payload.user?.id) {
        const userId = Number(payload.user.id);
        const alreadyAdded = existing.recipientUsers.some((entry) => Number(entry.id) === userId);
        if (!alreadyAdded) {
          existing.recipientUsers.push({
            id: userId,
            firstName: payload.user.firstName || "",
            middleName: payload.user.middleName || "",
            lastName: payload.user.lastName || "",
            username: payload.user.username || "",
            email: payload.user.email || "",
          });
        }
      }

      groupedMap.set(complianceId, existing);
    });

    const groupedItems = Array.from(groupedMap.values())
      .sort((a, b) => {
        const aTime = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
        const bTime = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
        return bTime - aTime;
      })
      .map((group) => ({
        ...group,
        recipientSummary: group.recipientUsers.length
          ? `${group.recipientUsers.length} recipient${group.recipientUsers.length > 1 ? "s" : ""}`
          : `${group.recipientCount || 0} recipient${(group.recipientCount || 0) > 1 ? "s" : ""}`,
      }));

    return res.status(200).json({ error: false, items: groupedItems });
  } catch (error) {
    console.error("List notification records error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const restoreComplianceNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const scope = await getAssignmentScope(req);

    if (!scope.userId) {
      return res.status(400).json({ error: true, message: "User context is required" });
    }

    const targetUserId = Number(req.body?.userId ?? req.query?.userId ?? scope.userId);
    if (!targetUserId) {
      return res.status(400).json({ error: true, message: "Target userId is required" });
    }

    if (targetUserId !== scope.userId) {
      const currentUser = await User.findByPk(scope.userId, {
        include: [{ model: Role, as: "role", include: [{ model: Permission, as: "Permissions" }] }],
      });

      const roleName = String(currentUser?.role?.name || "").trim().toLowerCase();
      const isSuperAdmin = roleName === "super admin" || roleName.includes("super");
      const rolePermissions = Array.isArray(currentUser?.role?.Permissions)
        ? currentUser.role.Permissions.map((permission) => permission?.name).filter(Boolean)
        : [];
      const hasRecordsPermission = rolePermissions.includes(PERMISSIONS.RECORDS);

      if (!isSuperAdmin && !hasRecordsPermission) {
        return res.status(403).json({ error: true, message: "Forbidden: Insufficient permissions" });
      }
    }

    const targetRow = await ComplianceNotificationRead.findOne({
      where: { complianceId: id },
      attributes: ["id"],
    });

    if (!targetRow) {
      return res.status(404).json({ error: true, message: "Deleted notification record not found" });
    }

    await Compliance.update(
      { isDeleted: false, deletedAt: null },
      { where: { id } },
    );

    await ComplianceNotificationRead.update(
      { isDeleted: false, deletedAt: null, isPermanentlyDeleted: false },
      { where: { complianceId: id } },
    );

    broadcastComplianceNotificationChange({
      action: "restore-notification",
      complianceId: Number(id),
      actorUserId: scope.userId,
      targetUserId,
    });

    return res.status(200).json({ error: false, restored: true });
  } catch (error) {
    console.error("Restore notification error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const createComplianceItem = async (req, res) => {
  try {
    const currentUserId = Number(req.user?.userId ?? req.user?.id ?? 0) || null;
    const uploadedFiles = await uploadComplianceFiles(req);

    const {
      title,
      complianceType,
      complianceTitleId,
      complianceFormId,
      assignedToUserId,
      assignedToWorkgroupId,
      assignedToDepartmentId,
      assignedToUnitsId,
      assignedToUserIds,
      assignedToWorkgroupIds,
      assignedToDepartmentIds,
      assignedToUnitsIds,
      status,
      colorIndex,
      startDate,
      endDate,
    } = req.body;

    const parsedAssignedToUserIds = assignedToUserIds !== undefined
      ? parseAssignmentArray(assignedToUserIds)
      : parseAssignmentArray(assignedToUserId);
    const parsedAssignedToWorkgroupIds = assignedToWorkgroupIds !== undefined
      ? parseAssignmentArray(assignedToWorkgroupIds)
      : parseAssignmentArray(assignedToWorkgroupId);
    const parsedAssignedToDepartmentIds = assignedToDepartmentIds !== undefined
      ? parseAssignmentArray(assignedToDepartmentIds)
      : parseAssignmentArray(assignedToDepartmentId);
    const parsedAssignedToUnitsIds = assignedToUnitsIds !== undefined
      ? parseAssignmentArray(assignedToUnitsIds)
      : parseAssignmentArray(assignedToUnitsId);

    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        error: true,
        message: "Title, start date, and end date are required",
      });
    }

    const item = await Compliance.create({
      title,
      complianceType: complianceType ? String(complianceType).trim() : "",
      complianceTitleId: complianceTitleId ? Number(complianceTitleId) : null,
      complianceFormId: complianceFormId ? Number(complianceFormId) : null,
      fileUrls: uploadedFiles.fileUrls.length ? uploadedFiles.fileUrls : null,
      originalFilenames: uploadedFiles.originalFilenames.length ? uploadedFiles.originalFilenames : null,
      submissionStatus: uploadedFiles.fileUrls.length ? "Pending Review" : null,
      isSubmissionClosed: false,
      submittedBy: uploadedFiles.fileUrls.length ? currentUserId : null,
      submittedAt: uploadedFiles.fileUrls.length ? new Date() : null,
      assignedToUserId: parsedAssignedToUserIds.length ? Number(parsedAssignedToUserIds[0]) : null,
      assignedToWorkgroupId: parsedAssignedToWorkgroupIds.length ? Number(parsedAssignedToWorkgroupIds[0]) : null,
      assignedToDepartmentId: parsedAssignedToDepartmentIds.length ? Number(parsedAssignedToDepartmentIds[0]) : null,
      assignedToUnitsId: parsedAssignedToUnitsIds.length ? Number(parsedAssignedToUnitsIds[0]) : null,
      assignedToUserIds: parsedAssignedToUserIds.length ? parsedAssignedToUserIds : null,
      assignedToWorkgroupIds: parsedAssignedToWorkgroupIds.length ? parsedAssignedToWorkgroupIds : null,
      assignedToDepartmentIds: parsedAssignedToDepartmentIds.length ? parsedAssignedToDepartmentIds : null,
      assignedToUnitsIds: parsedAssignedToUnitsIds.length ? parsedAssignedToUnitsIds : null,
      status: normalizeComplianceStatus(status),
      colorIndex: colorIndex !== undefined ? Number(colorIndex) : 0,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdBy: currentUserId,
    });

    sendComplianceDeadlineReminders(new Date(), { itemId: item.id }).catch((e) => {
      console.error("Failed to send compliance reminder for newly created item:", e);
    });

    try {
      // Resolve assignment IDs to readable labels for the activity log
      const createdMeta = { entity: "compliance", itemId: item.id, title: item.title };
      if (parsedAssignedToUserIds.length) {
        const users = await User.findAll({ where: { id: parsedAssignedToUserIds }, attributes: ["id", "firstName", "middleName", "lastName", "username", "email"] });
        const userMap = new Map(users.map((u) => [u.id, (u.firstName || u.username || u.email) ? `${[u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ")}` : u.username || u.email]));
        createdMeta.assignedToUsers = parsedAssignedToUserIds.map((id) => userMap.get(Number(id)) || `#${id}`);
      }
      if (parsedAssignedToWorkgroupIds.length) {
        const wgs = await Workgroup.findAll({ where: { id: parsedAssignedToWorkgroupIds }, attributes: ["id", "workgroupName"] });
        const wgMap = new Map(wgs.map((w) => [w.id, w.workgroupName]));
        createdMeta.assignedToWorkgroups = parsedAssignedToWorkgroupIds.map((id) => wgMap.get(Number(id)) || `#${id}`);
      }
      if (parsedAssignedToDepartmentIds.length) {
        const deps = await Department.findAll({ where: { id: parsedAssignedToDepartmentIds }, attributes: ["id", "departmentName"] });
        const dMap = new Map(deps.map((d) => [d.id, d.departmentName]));
        createdMeta.assignedToDepartments = parsedAssignedToDepartmentIds.map((id) => dMap.get(Number(id)) || `#${id}`);
      }
      if (parsedAssignedToUnitsIds.length) {
        const us = await Units.findAll({ where: { id: parsedAssignedToUnitsIds }, attributes: ["id", "UnitName"] });
        const uMap = new Map(us.map((u) => [u.id, u.UnitName]));
        createdMeta.assignedToUnits = parsedAssignedToUnitsIds.map((id) => uMap.get(Number(id)) || `#${id}`);
      }

      await recordActivity(req, "create", `Created compliance item: ${item.title || item.id}`, createdMeta);
    } catch (e) {
      console.error("Failed to record create activity for compliance item:", e);
    }

    broadcastComplianceNotificationChange({
      action: "create-compliance",
      complianceId: item.id,
      actorUserId: currentUserId,
    });

    return res.status(201).json({ error: false, item });
  } catch (error) {
    console.error("Create compliance item error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const updateComplianceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Compliance.findByPk(id);
    const currentUserId = Number(req.user?.userId ?? req.user?.id ?? 0) || null;

    if (!item) {
      return res.status(404).json({ error: true, message: "Compliance item not found" });
    }

    const {
      title,
      complianceType,
      complianceTitleId,
      complianceFormId,
      assigned,
      assignedToUserId,
      assignedToWorkgroupId,
      assignedToDepartmentId,
      assignedToUnitsId,
      assignedToUserIds,
      assignedToWorkgroupIds,
      assignedToDepartmentIds,
      assignedToUnitsIds,
      status,
      submissionStatus,
      isSubmissionClosed,
      reviewerRemarks,
      colorIndex,
      startDate,
      endDate,
    } = req.body;

    const currentUser = currentUserId
      ? await User.findByPk(currentUserId, {
          attributes: ["id"],
          include: [{ model: Role, as: "role", attributes: ["name"] }],
        })
      : null;
    const canReviewSubmission = isPrivilegedRoleName(currentUser?.role?.name);
    const touchesSubmissionReview = submissionStatus !== undefined || reviewerRemarks !== undefined || isSubmissionClosed !== undefined;
    if (touchesSubmissionReview && !canReviewSubmission) {
      return res.status(403).json({ error: true, message: "Unauthorized to review submissions" });
    }

    const uploadedFiles = await uploadComplianceFiles(req);
    if (uploadedFiles.fileUrls.length > 0 && item.isSubmissionClosed) {
      return res.status(400).json({ error: true, message: "Submission is closed for this compliance item" });
    }
    const existingFileUrls = Array.isArray(item.fileUrls) ? item.fileUrls : [];
    const existingOriginalFilenames = Array.isArray(item.originalFilenames) ? item.originalFilenames : [];
    const hasNewFiles = uploadedFiles.fileUrls.length > 0;
    const nextStatus = hasNewFiles
      ? normalizeComplianceStatus("Under Evaluation")
      : status !== undefined
        ? normalizeComplianceStatus(status)
        : item.status;
    const nextSubmissionStatus = hasNewFiles
      ? "Pending Review"
      : submissionStatus !== undefined
        ? normalizeSubmissionStatus(submissionStatus, item.submissionStatus)
        : item.submissionStatus;
    const nextReviewerRemarks = reviewerRemarks !== undefined
      ? (String(reviewerRemarks || "").trim() || null)
      : hasNewFiles
        ? null
        : item.reviewerRemarks;
    const nextReviewedBy = hasNewFiles
      ? null
      : touchesSubmissionReview && canReviewSubmission
        ? currentUserId
        : item.reviewedBy;
    const nextReviewedAt = hasNewFiles
      ? null
      : touchesSubmissionReview && canReviewSubmission
        ? new Date()
        : item.reviewedAt;
    const requestedSubmissionClosed = isSubmissionClosed !== undefined
      ? normalizeSubmissionClosedFlag(isSubmissionClosed, item.isSubmissionClosed)
      : item.isSubmissionClosed;

    // Business rules:
    // - Approved submissions are automatically closed.
    // - Rejected submissions remain open so users can resubmit.
    // - New file upload reopens submission for review.
    let nextIsSubmissionClosed = requestedSubmissionClosed;
    if (hasNewFiles) {
      nextIsSubmissionClosed = false;
    } else if (nextSubmissionStatus === "Approved") {
      nextIsSubmissionClosed = true;
    } else if (nextSubmissionStatus === "Rejected") {
      nextIsSubmissionClosed = false;
    }

    const parsedAssignedToUserIds = assignedToUserIds !== undefined
      ? parseAssignmentArray(assignedToUserIds)
      : assignedToUserId !== undefined
        ? parseAssignmentArray(assignedToUserId)
        : undefined;
    const parsedAssignedToWorkgroupIds = assignedToWorkgroupIds !== undefined
      ? parseAssignmentArray(assignedToWorkgroupIds)
      : assignedToWorkgroupId !== undefined
        ? parseAssignmentArray(assignedToWorkgroupId)
        : undefined;
    const parsedAssignedToDepartmentIds = assignedToDepartmentIds !== undefined
      ? parseAssignmentArray(assignedToDepartmentIds)
      : assignedToDepartmentId !== undefined
        ? parseAssignmentArray(assignedToDepartmentId)
        : undefined;
    const parsedAssignedToUnitsIds = assignedToUnitsIds !== undefined
      ? parseAssignmentArray(assignedToUnitsIds)
      : assignedToUnitsId !== undefined
        ? parseAssignmentArray(assignedToUnitsId)
        : undefined;

    const beforeUpdate = item.toJSON();

    await item.update({
      title: title ?? item.title,
      complianceType: complianceType !== undefined
        ? (String(complianceType).trim() || "")
        : item.complianceType,
      complianceTitleId: complianceTitleId !== undefined
        ? (complianceTitleId ? Number(complianceTitleId) : null)
        : item.complianceTitleId,
      complianceFormId: complianceFormId !== undefined
        ? (complianceFormId ? Number(complianceFormId) : null)
        : item.complianceFormId,
      fileUrls: hasNewFiles ? [...existingFileUrls, ...uploadedFiles.fileUrls] : existingFileUrls,
      originalFilenames: hasNewFiles ? [...existingOriginalFilenames, ...uploadedFiles.originalFilenames] : existingOriginalFilenames,
      submissionStatus: nextSubmissionStatus,
      isSubmissionClosed: nextIsSubmissionClosed,
      reviewerRemarks: nextReviewerRemarks,
      submittedBy: hasNewFiles ? currentUserId : item.submittedBy,
      submittedAt: hasNewFiles ? new Date() : item.submittedAt,
      reviewedBy: nextReviewedBy,
      reviewedAt: nextReviewedAt,
      assignedToUserId: parsedAssignedToUserIds !== undefined
        ? parsedAssignedToUserIds.length
          ? Number(parsedAssignedToUserIds[0])
          : null
        : item.assignedToUserId,
      assignedToWorkgroupId: parsedAssignedToWorkgroupIds !== undefined
        ? parsedAssignedToWorkgroupIds.length
          ? Number(parsedAssignedToWorkgroupIds[0])
          : null
        : item.assignedToWorkgroupId,
      assignedToDepartmentId: parsedAssignedToDepartmentIds !== undefined
        ? parsedAssignedToDepartmentIds.length
          ? Number(parsedAssignedToDepartmentIds[0])
          : null
        : item.assignedToDepartmentId,
      assignedToUnitsId: parsedAssignedToUnitsIds !== undefined
        ? parsedAssignedToUnitsIds.length
          ? Number(parsedAssignedToUnitsIds[0])
          : null
        : item.assignedToUnitsId,
      assignedToUserIds: parsedAssignedToUserIds !== undefined
        ? parsedAssignedToUserIds.length
          ? parsedAssignedToUserIds
          : null
        : item.assignedToUserIds,
      assignedToWorkgroupIds: parsedAssignedToWorkgroupIds !== undefined
        ? parsedAssignedToWorkgroupIds.length
          ? parsedAssignedToWorkgroupIds
          : null
        : item.assignedToWorkgroupIds,
      assignedToDepartmentIds: parsedAssignedToDepartmentIds !== undefined
        ? parsedAssignedToDepartmentIds.length
          ? parsedAssignedToDepartmentIds
          : null
        : item.assignedToDepartmentIds,
      assignedToUnitsIds: parsedAssignedToUnitsIds !== undefined
        ? parsedAssignedToUnitsIds.length
          ? parsedAssignedToUnitsIds
          : null
        : item.assignedToUnitsIds,
      status: nextStatus,
      colorIndex: colorIndex !== undefined ? Number(colorIndex) : item.colorIndex,
      startDate: startDate ? new Date(startDate) : item.startDate,
      endDate: endDate ? new Date(endDate) : item.endDate,
    });

    // Notify creator when a user submits files for this compliance item.
    if (hasNewFiles && item.createdBy && currentUserId && Number(item.createdBy) !== Number(currentUserId)) {
      try {
        const isResubmission = String(beforeUpdate.submissionStatus || "") === "Rejected";
        const [creatorUser, submitterUser] = await Promise.all([
          User.findByPk(item.createdBy, {
            attributes: ["id", "firstName", "middleName", "lastName", "username", "email"],
          }),
          User.findByPk(currentUserId, {
            attributes: ["id", "firstName", "middleName", "lastName", "username", "email"],
          }),
        ]);

        const submissionEmailEnabled = await isChannelEnabled("compliance_submission_received", "email");

        if (submissionEmailEnabled && creatorUser?.email) {
          const creatorName = getDisplayName(creatorUser, "there");
          const submitterName = getDisplayName(submitterUser, "A user");
          const submittedAtText = new Date().toLocaleString();
          const html = buildSubmissionNoticeHtml({
            creatorName,
            submitterName,
            title: item.title,
            submittedAt: submittedAtText,
            isResubmission,
          });

          sendEmail(
            creatorUser.email,
            isResubmission
              ? `Updated submission received: ${item.title || item.id}`
              : `Compliance submission received: ${item.title || item.id}`,
            html,
          ).catch((emailError) => {
            console.error("Failed to send creator submission email:", emailError);
          });
        }
      } catch (emailError) {
        console.error("Failed to send creator submission email:", emailError);
      }
    }

    // Notify submitter when reviewer decision changes to Approved/Rejected.
    const reviewDecisionChanged =
      !hasNewFiles &&
      ["Approved", "Rejected"].includes(nextSubmissionStatus || "") &&
      nextSubmissionStatus !== beforeUpdate.submissionStatus;

    if (reviewDecisionChanged && item.submittedBy) {
      try {
        const [submitterUser, reviewerUser] = await Promise.all([
          User.findByPk(item.submittedBy, {
            attributes: ["id", "firstName", "middleName", "lastName", "username", "email"],
          }),
          currentUserId
            ? User.findByPk(currentUserId, {
                attributes: ["id", "firstName", "middleName", "lastName", "username", "email"],
              })
            : Promise.resolve(null),
        ]);

        const decisionEmailEnabled = await isChannelEnabled("compliance_review_decision", "email");

        if (decisionEmailEnabled && submitterUser?.email) {
          const submitterName = getDisplayName(submitterUser, "there");
          const reviewerName = getDisplayName(reviewerUser, "Reviewer");
          const html = buildReviewDecisionHtml({
            submitterName,
            reviewerName,
            title: item.title,
            decision: nextSubmissionStatus,
            remarks: nextReviewerRemarks || "No remarks provided.",
          });

          sendEmail(
            submitterUser.email,
            `Submission ${nextSubmissionStatus}: ${item.title || item.id}`,
            html,
          ).catch((emailError) => {
            console.error("Failed to send submitter decision email:", emailError);
          });
        }
      } catch (emailError) {
        console.error("Failed to send submitter decision email:", emailError);
      }
    }

    // Build change details by comparing beforeUpdate and updated item
    const afterUpdate = item.toJSON();
    const fieldsToCheck = [
      "title",
      "complianceType",
      "complianceTitleId",
      "complianceFormId",
      "fileUrls",
      "originalFilenames",
      "submissionStatus",
      "isSubmissionClosed",
      "reviewerRemarks",
      "submittedBy",
      "submittedAt",
      "reviewedBy",
      "reviewedAt",
      "status",
      "colorIndex",
      "startDate",
      "endDate",
      "assignedToUserIds",
      "assignedToWorkgroupIds",
      "assignedToDepartmentIds",
      "assignedToUnitsIds",
    ];

    let changeDetails = fieldsToCheck
      .map((field) => {
        const beforeVal = beforeUpdate[field] === undefined ? null : beforeUpdate[field];
        const afterVal = afterUpdate[field] === undefined ? null : afterUpdate[field];
        const beforeNorm = Array.isArray(beforeVal) ? JSON.stringify(beforeVal) : String(beforeVal ?? "");
        const afterNorm = Array.isArray(afterVal) ? JSON.stringify(afterVal) : String(afterVal ?? "");
        if (beforeNorm === afterNorm) return null;
        return { field, before: beforeVal, after: afterVal };
      })
      .filter(Boolean);

    // Replace ID arrays with readable labels for assignments
    try {
      const userIds = new Set();
      const workgroupIds = new Set();
      const departmentIds = new Set();
      const unitIds = new Set();

      const collectIds = (val, set) => {
        if (val === null || val === undefined) return;
        if (Array.isArray(val)) val.forEach((v) => set.add(Number(v)));
        else if (typeof val === "string") {
          try {
            const p = JSON.parse(val);
            if (Array.isArray(p)) p.forEach((v) => set.add(Number(v)));
            else set.add(Number(p));
          } catch {
            val.split(",").map((s) => Number(s)).forEach((n) => { if (!Number.isNaN(n)) set.add(n); });
          }
        } else if (typeof val === "number") set.add(val);
      };

      changeDetails.forEach((c) => {
        if (c.field === "assignedToUserIds") {
          collectIds(c.before, userIds);
          collectIds(c.after, userIds);
        }
        if (c.field === "assignedToWorkgroupIds") {
          collectIds(c.before, workgroupIds);
          collectIds(c.after, workgroupIds);
        }
        if (c.field === "assignedToDepartmentIds") {
          collectIds(c.before, departmentIds);
          collectIds(c.after, departmentIds);
        }
        if (c.field === "assignedToUnitsIds") {
          collectIds(c.before, unitIds);
          collectIds(c.after, unitIds);
        }
      });

      const [usersRows, wgsRows, depsRows, unitsRows] = await Promise.all([
        userIds.size ? User.findAll({ where: { id: [...userIds] }, attributes: ["id", "firstName", "middleName", "lastName", "username", "email"] }) : Promise.resolve([]),
        workgroupIds.size ? Workgroup.findAll({ where: { id: [...workgroupIds] }, attributes: ["id", "workgroupName"] }) : Promise.resolve([]),
        departmentIds.size ? Department.findAll({ where: { id: [...departmentIds] }, attributes: ["id", "departmentName"] }) : Promise.resolve([]),
        unitIds.size ? Units.findAll({ where: { id: [...unitIds] }, attributes: ["id", "UnitName"] }) : Promise.resolve([]),
      ]);

      const userMap = new Map(usersRows.map((u) => [u.id, ([u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ")) || u.username || u.email]));
      const wgMap = new Map(wgsRows.map((w) => [w.id, w.workgroupName]));
      const dMap = new Map(depsRows.map((d) => [d.id, d.departmentName]));
      const uMap = new Map(unitsRows.map((u) => [u.id, u.UnitName]));

      const formatValue = (val, map) => {
        if (val === null || val === undefined) return null;
        if (Array.isArray(val)) return val.map((id) => map.get(Number(id)) || `#${id}`).join(", ");
        if (typeof val === "string") {
          try {
            const p = JSON.parse(val);
            if (Array.isArray(p)) return p.map((id) => map.get(Number(id)) || `#${id}`).join(", ");
            return map.get(Number(p)) || `#${p}`;
          } catch {
            const parts = val.split(",").map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
            if (parts.length) return parts.map((id) => map.get(Number(id)) || `#${id}`).join(", ");
            return val;
          }
        }
        if (typeof val === "number") return map.get(Number(val)) || `#${val}`;
        return val;
      };

      changeDetails = changeDetails.map((c) => {
        if (c.field === "assignedToUserIds") {
          return { ...c, before: formatValue(c.before, userMap), after: formatValue(c.after, userMap) };
        }
        if (c.field === "assignedToWorkgroupIds") {
          return { ...c, before: formatValue(c.before, wgMap), after: formatValue(c.after, wgMap) };
        }
        if (c.field === "assignedToDepartmentIds") {
          return { ...c, before: formatValue(c.before, dMap), after: formatValue(c.after, dMap) };
        }
        if (c.field === "assignedToUnitsIds") {
          return { ...c, before: formatValue(c.before, uMap), after: formatValue(c.after, uMap) };
        }
        return c;
      });

    } catch (e) {
      console.error("Failed to map assignment IDs to labels for activity log:", e);
    }

    sendComplianceDeadlineReminders(new Date(), { itemId: item.id }).catch((e) => {
      console.error("Failed to send compliance reminder for updated item:", e);
    });

    try {
      await recordActivity(req, "update", `Updated compliance item: ${item.id}`, {
        entity: "compliance",
        itemId: item.id,
        title: item.title,
        updatedBy: req.user?.userId ?? req.user?.id ?? null,
        changes: changeDetails,
      });
    } catch (e) {
      console.error("Failed to record update activity for compliance item:", e);
    }

    broadcastComplianceNotificationChange({
      action: "update-compliance",
      complianceId: item.id,
      actorUserId: currentUserId,
    });

    return res.status(200).json({ error: false, item });
  } catch (error) {
    console.error("Update compliance item error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const deleteComplianceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = Number(req.user?.userId ?? req.user?.id ?? 0) || null;
    const item = await Compliance.findByPk(id);

    if (!item) {
      return res.status(404).json({ error: true, message: "Compliance item not found" });
    }

    // Capture deleted item snapshot for audit
    const deletedSnapshot = item.toJSON();

    await item.update({ isDeleted: true, deletedAt: new Date() });
    await upsertDeletedComplianceRecordRows(item, { currentUserId, recordKind: "calendar-delete" });

    try {
      // Exclude file URLs from the delete log
      const keys = Object.keys(deletedSnapshot).filter((k) => k !== "fileUrls" && k !== "fileUrl");
      let changes = keys.map((k) => ({ field: k, before: deletedSnapshot[k], after: null }));

      // Map assignment IDs to readable labels similar to update
      const userIds = new Set();
      const workgroupIds = new Set();
      const departmentIds = new Set();
      const unitIds = new Set();

      const collect = (val, set) => {
        if (val === null || val === undefined) return;
        if (Array.isArray(val)) val.forEach((v) => set.add(Number(v)));
        else if (typeof val === "string") {
          try {
            const p = JSON.parse(val);
            if (Array.isArray(p)) p.forEach((v) => set.add(Number(v)));
            else set.add(Number(p));
          } catch {
            val.split(",").map((s) => Number(s)).forEach((n) => { if (!Number.isNaN(n)) set.add(n); });
          }
        } else if (typeof val === "number") set.add(val);
      };

      changes.forEach((c) => {
        if (c.field === "assignedToUserIds") collect(c.before, userIds);
        if (c.field === "assignedToWorkgroupIds") collect(c.before, workgroupIds);
        if (c.field === "assignedToDepartmentIds") collect(c.before, departmentIds);
        if (c.field === "assignedToUnitsIds") collect(c.before, unitIds);
      });

      const [usersRows, wgsRows, depsRows, unitsRows] = await Promise.all([
        userIds.size ? User.findAll({ where: { id: [...userIds] }, attributes: ["id", "firstName", "middleName", "lastName", "username", "email"] }) : Promise.resolve([]),
        workgroupIds.size ? Workgroup.findAll({ where: { id: [...workgroupIds] }, attributes: ["id", "workgroupName"] }) : Promise.resolve([]),
        departmentIds.size ? Department.findAll({ where: { id: [...departmentIds] }, attributes: ["id", "departmentName"] }) : Promise.resolve([]),
        unitIds.size ? Units.findAll({ where: { id: [...unitIds] }, attributes: ["id", "UnitName"] }) : Promise.resolve([]),
      ]);

      const userMap = new Map(usersRows.map((u) => [u.id, ([u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ")) || u.username || u.email]));
      const wgMap = new Map(wgsRows.map((w) => [w.id, w.workgroupName]));
      const dMap = new Map(depsRows.map((d) => [d.id, d.departmentName]));
      const uMap = new Map(unitsRows.map((u) => [u.id, u.UnitName]));

      const fmt = (val, map) => {
        if (val === null || val === undefined) return null;
        if (Array.isArray(val)) return val.map((id) => map.get(Number(id)) || `#${id}`).join(", ");
        if (typeof val === "string") {
          try {
            const p = JSON.parse(val);
            if (Array.isArray(p)) return p.map((id) => map.get(Number(id)) || `#${id}`).join(", ");
            return map.get(Number(p)) || `#${p}`;
          } catch {
            const parts = val.split(",").map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
            if (parts.length) return parts.map((id) => map.get(Number(id)) || `#${id}`).join(", ");
            return val;
          }
        }
        if (typeof val === "number") return map.get(Number(val)) || `#${val}`;
        return val;
      };

      changes = changes.map((c) => {
        if (c.field === "assignedToUserIds") return { ...c, before: fmt(c.before, userMap), after: null };
        if (c.field === "assignedToWorkgroupIds") return { ...c, before: fmt(c.before, wgMap), after: null };
        if (c.field === "assignedToDepartmentIds") return { ...c, before: fmt(c.before, dMap), after: null };
        if (c.field === "assignedToUnitsIds") return { ...c, before: fmt(c.before, uMap), after: null };
        return c;
      });

      await recordActivity(req, "delete", `Deleted compliance item: ${deletedSnapshot.id}`, {
        entity: "compliance",
        itemId: deletedSnapshot.id,
        title: deletedSnapshot.title,
        changes,
      });
    } catch (e) {
      console.error("Failed to record delete activity for compliance item:", e);
    }

    broadcastComplianceNotificationChange({
      action: "delete-compliance",
      complianceId: deletedSnapshot.id,
      actorUserId: req.user?.userId ?? req.user?.id ?? null,
    });

    return res.status(200).json({ error: false, message: "Compliance item deleted" });
  } catch (error) {
    console.error("Delete compliance item error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const downloadComplianceFile = async (req, res) => {
  try {
    const { id } = req.params;
    const index = Number(req.query.index ?? 0);
    const item = await Compliance.findByPk(id);

    if (!item) {
      return res.status(404).json({ error: true, message: "Compliance item not found" });
    }

    const urlList = item.fileUrls && item.fileUrls.length ? item.fileUrls : item.fileUrl ? [item.fileUrl] : [];
    const nameList = item.originalFilenames && item.originalFilenames.length ? item.originalFilenames : item.originalFilename ? [item.originalFilename] : [];

    const fileIndex = Number.isFinite(index) && index >= 0 && index < urlList.length ? index : 0;
    const fileUrl = urlList[fileIndex];
    const originalFilename = nameList[fileIndex] || `file-${fileIndex + 1}`;

    if (!fileUrl) {
      return res.status(404).json({ error: true, message: "File not found" });
    }

    const urlParts = fileUrl.split('/');
    const storedFilename = urlParts[urlParts.length - 1];
    const filePath = path.join(process.cwd(), 'uploads', 'compliances', storedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: true, message: "File not found on server" });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${originalFilename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error("File stream error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: true, message: "Error downloading file" });
      }
    });
  } catch (error) {
    console.error("Download compliance file error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const streamComplianceNotifications = (req, res) => registerComplianceNotificationStream(req, res);