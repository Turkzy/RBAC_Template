import { Op } from "sequelize";
import Compliance from "../models/ComplianceModel.js";
import SystemSetting from "../models/SystemSettingModel.js";
import User from "../models/UserModel.js";
import Workgroup from "../models/WorkgroupModel.js";
import Department from "../models/DepartmentModel.js";
import Units from "../models/UnitsModel.js";
import { sendEmail } from "../config/mail.js";
import { escapeHtml } from "../services/mailService.js";
import { isChannelEnabled } from "../services/notificationRuleService.js";

export const DEFAULT_REMINDER_THRESHOLDS = [14, 7, 3];
export const REMINDER_STAGES = [
  { name: "14d", label: "2 weeks", days: 14 },
  { name: "7d", label: "1 week", days: 7 },
  { name: "3d", label: "3 days", days: 3 },
];

const parseAssignmentIds = (value) => {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value.map((item) => Number(item)).filter((item) => !Number.isNaN(item));
  if (typeof value === "number") return [value];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((item) => Number(item)).filter((item) => !Number.isNaN(item));
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

const normalizeReminderStages = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
};

const parseThresholdValue = (value) => {
  if (value === null || value === undefined) return null;

  const raw = String(value).trim().toLowerCase();
  if (!raw) return null;

  const weekMatch = raw.match(/^([0-9]+(?:\.[0-9]+)?)\s*(w|week|weeks)$/);
  if (weekMatch) {
    const number = Number(weekMatch[1]);
    return Number.isFinite(number) && number > 0 ? number * 7 : null;
  }

  const dayMatch = raw.match(/^([0-9]+(?:\.[0-9]+)?)\s*(d|day|days)$/);
  if (dayMatch) {
    const number = Number(dayMatch[1]);
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  const numericValue = Number(raw);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
};

const normalizeReminderThresholds = (thresholds) => {
  if (!thresholds) return DEFAULT_REMINDER_THRESHOLDS;

  const normalizeArray = (items) =>
    items
      .map((item) => parseThresholdValue(item))
      .filter((value) => value !== null)
      .map((value) => Math.round(value));

  if (Array.isArray(thresholds)) {
    const normalized = normalizeArray(thresholds);
    return normalized.length ? normalized : DEFAULT_REMINDER_THRESHOLDS;
  }

  if (typeof thresholds === "number") {
    return Number.isNaN(thresholds) || thresholds <= 0 ? DEFAULT_REMINDER_THRESHOLDS : [Math.round(thresholds)];
  }

  if (typeof thresholds === "string") {
    const trimmed = thresholds.trim();
    if (!trimmed) return DEFAULT_REMINDER_THRESHOLDS;

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        const normalized = normalizeArray(parsed);
        return normalized.length ? normalized : DEFAULT_REMINDER_THRESHOLDS;
      }
      if (typeof parsed === "number" && !Number.isNaN(parsed) && parsed > 0) {
        return [Math.round(parsed)];
      }
    } catch {
      // fall through to comma-separated parsing below
    }

    const normalized = trimmed
      .split(",")
      .map((value) => parseThresholdValue(value))
      .filter((value) => value !== null)
      .map((value) => Math.round(value));

    return normalized.length ? normalized : DEFAULT_REMINDER_THRESHOLDS;
  }

  return DEFAULT_REMINDER_THRESHOLDS;
};

export const getReminderStageName = (deadline, now = new Date(), thresholds = DEFAULT_REMINDER_THRESHOLDS) => {
  if (!deadline) return null;

  const deadlineDate = new Date(deadline);
  const nowDate = new Date(now);
  const diffMs = deadlineDate.getTime() - nowDate.getTime();

  if (diffMs <= 0) return null;

  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  // Use whole days based on the ceiling of remaining time.
  // This makes thresholds like 14d include any remaining time over 13 days.
  const roundedDiffDays = Math.max(1, Math.ceil(diffDays));
  const normalizedThresholds = normalizeReminderThresholds(thresholds)
    .sort((a, b) => a - b);

  if (!normalizedThresholds.length) return null;

  // Find the closest threshold to the remaining days
  let closestThreshold = null;
  let smallestDiff = Infinity;

  for (const threshold of normalizedThresholds) {
    const diff = Math.abs(roundedDiffDays - threshold);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestThreshold = threshold;
    }
  }

  // Only return a stage if the remaining days is within 1 day of a configured threshold
  // This allows for timezone variations and date boundary issues
  if (closestThreshold !== null && smallestDiff <= 1) {
    return `${closestThreshold}d`;
  }

  // If we reach here, the deadline is outside the configured thresholds.
  return null;
};

const buildReminderLabel = (stage, thresholds = DEFAULT_REMINDER_THRESHOLDS) => {
  // Prefer deriving the label directly from the stage (e.g. '7d' -> 7 days)
  if (typeof stage === "string" && stage.endsWith("d")) {
    const days = Number(stage.slice(0, -1));
    if (Number.isFinite(days) && days > 0) {
      if (days === 1) return "1 day";
      if (days === 7) return "1 week";
      if (days === 14) return "2 weeks";
      if (days % 7 === 0) return `${days / 7} weeks`;
      return `${days} days`;
    }
  }

  // Fallback: map common stage names to thresholds based on configured thresholds
  const normalizedThresholds = normalizeReminderThresholds(thresholds).sort((a, b) => a - b);
  const asc = normalizedThresholds;
  const smallest = asc[0] ?? 3;
  const middle = asc[1] ?? 7;
  const largest = asc[asc.length - 1] ?? 14;
  const defaultStageThresholds = {
    "14d": largest,
    "7d": middle,
    "3d": smallest,
  };
  const fallbackDays = defaultStageThresholds[stage] ?? null;
  if (!fallbackDays) return stage;
  if (fallbackDays === 1) return "1 day";
  if (fallbackDays === 7) return "1 week";
  if (fallbackDays === 14) return "2 weeks";
  if (fallbackDays % 7 === 0) return `${fallbackDays / 7} weeks`;
  return `${fallbackDays} days`;
};

const getReminderThresholdLabels = (thresholds = DEFAULT_REMINDER_THRESHOLDS) => {
  const normalized = normalizeReminderThresholds(thresholds).sort((a, b) => a - b);
  return normalized.map((threshold) => {
    if (threshold === 1) return "1 day";
    if (threshold === 7) return "1 week";
    if (threshold === 14) return "2 weeks";
    if (threshold % 7 === 0) return `${threshold / 7} weeks`;
    return `${threshold} days`;
  });
};

const getReminderThresholds = async () => {
  try {
    const setting = await SystemSetting.findOne({ where: { key: "compliance_reminder_thresholds" } });
    if (!setting?.value) return DEFAULT_REMINDER_THRESHOLDS;

    const rawValue = String(setting.value).trim();

    if (!rawValue) return DEFAULT_REMINDER_THRESHOLDS;

    const normalizedThresholds = normalizeReminderThresholds(rawValue);
    if (normalizedThresholds.length) {
      return normalizedThresholds;
    }
  } catch (error) {
    console.warn("Failed to load compliance reminder thresholds:", error.message);
  }

  return DEFAULT_REMINDER_THRESHOLDS;
};

const getReminderTestTime = async () => {
  try {
    const setting = await SystemSetting.findOne({ where: { key: "compliance_reminder_test_time" } });
    if (!setting?.value) return "0800";

    const parsed = Number(setting.value);
    return Number.isNaN(parsed) ? "0800" : parsed;
  } catch (error) {
    console.warn("Failed to load compliance reminder test time:", error.message);
  }

  return "0800";
};

const getReminderEnabled = async () => {
  try {
    const setting = await SystemSetting.findOne({ where: { key: "compliance_reminder_enabled" } });
    if (!setting?.value) return true;

    if (typeof setting.value === "string") {
      return !["false", "0", "off", "no"].includes(setting.value.toLowerCase());
    }

    return Boolean(setting.value);
  } catch (error) {
    console.warn("Failed to load compliance reminder enabled flag:", error.message);
  }

  return true;
};

const getRecipientEmailsForItem = async (item) => {
  const recipients = new Map();

  const addRecipient = (user) => {
    if (!user?.email) return;
    const email = String(user.email).trim().toLowerCase();
    if (!email || recipients.has(email)) return;
    recipients.set(email, user);
  };

  const userIds = parseAssignmentIds(item.assignedToUserIds || item.assignedToUserId);
  if (userIds.length) {
    const users = await User.findAll({
      where: { id: userIds, status: "Active" },
      attributes: ["id", "firstName", "middleName", "lastName", "username", "email"],
    });
    users.forEach(addRecipient);
  }

  const workgroupIds = parseAssignmentIds(item.assignedToWorkgroupIds || item.assignedToWorkgroupId);
  if (workgroupIds.length) {
    const users = await User.findAll({
      where: { workgroupId: { [Op.in]: workgroupIds }, status: "Active" },
      attributes: ["id", "firstName", "middleName", "lastName", "username", "email"],
    });
    users.forEach(addRecipient);
  }

  const departmentIds = parseAssignmentIds(item.assignedToDepartmentIds || item.assignedToDepartmentId);
  if (departmentIds.length) {
    const users = await User.findAll({
      where: { DepartmentId: { [Op.in]: departmentIds }, status: "Active" },
      attributes: ["id", "firstName", "middleName", "lastName", "username", "email"],
    });
    users.forEach(addRecipient);
  }

  const unitIds = parseAssignmentIds(item.assignedToUnitsIds || item.assignedToUnitsId);
  if (unitIds.length) {
    const users = await User.findAll({
      where: { unitsId: { [Op.in]: unitIds }, status: "Active" },
      attributes: ["id", "firstName", "middleName", "lastName", "username", "email"],
    });
    users.forEach(addRecipient);
  }

  // Fallback to the item's creator if no assignees were found
  if (recipients.size === 0) {
    try {
      const creatorId = item.createdBy;
      if (creatorId && !Number.isNaN(Number(creatorId))) {
        const creatorUser = await User.findOne({
          where: { id: Number(creatorId), status: "Active" },
          attributes: ["id", "firstName", "middleName", "lastName", "username", "email"],
        });
        if (creatorUser) addRecipient(creatorUser);
      }
    } catch (err) {
      console.warn("Failed to resolve creator as recipient:", err && err.message);
    }
  }

  return [...recipients.values()];
};

export const buildComplianceReminderHtml = ({ recipientName, title, deadline, reminderLabel, description, complianceId, frontendUrl }) => {
  const safeName = escapeHtml(recipientName || "there");
  const safeTitle = escapeHtml(title || "Compliance item");
  const safeDeadline = escapeHtml(deadline || "the deadline");
  const safeReminderLabel = escapeHtml(reminderLabel || "the upcoming deadline");
  const safeDescription = escapeHtml(description || "Please review this item as soon as possible.");
  
  const baseUrl = frontendUrl ? frontendUrl.replace(/\/$/, "") : "http://fms.ndc.gov.ph";
  const complianceLink = `${baseUrl}/dashboard/compliance/${complianceId}`;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Compliance Deadline Reminder</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #14532d 100%);
            padding: 20px;
            min-height: 100vh;
          }

          .wrapper {
            max-width: 640px;
            margin: 0 auto;
          }

          .container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
            overflow: hidden;
          }

          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }

          .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }

          .content {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.8;
            word-break: break-word;
            overflow-wrap: break-word;
          }

          .greeting {
            font-size: 16px;
            margin-bottom: 18px;
            word-break: break-word;
            overflow-wrap: break-word;
          }

          .greeting strong {
            font-weight: 600;
            word-break: break-word;
            overflow-wrap: break-word;
          }

          .status-pill {
            display: inline-block;
            margin: 8px 0 20px;
            padding: 8px 14px;
            border-radius: 999px;
            background-color: #ecfdf5;
            color: #065f46;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.02em;
          }

          .schedule-list {
            margin: 16px 0 0;
            padding-left: 18px;
            color: #065f46;
          }

          .schedule-list li {
            margin-bottom: 8px;
          }

          .info-box {
            background-color: #ecfdf5;
            border-left: 4px solid #10b981;
            padding: 16px 18px;
            margin: 24px 0;
            border-radius: 6px;
            font-size: 14px;
            color: #065f46;
            word-break: break-word;
            overflow-wrap: break-word;
            line-height: 1.6;
          }

          .highlight {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px 18px;
            margin: 24px 0;
            border-radius: 6px;
            font-size: 14px;
            color: #92400e;
            word-break: break-word;
            overflow-wrap: break-word;
            line-height: 1.6;
          }

          .cta-section {
            text-align: center;
            margin: 28px 0 10px;
          }

          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            transition: transform 0.2s, box-shadow 0.2s;
          }

          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
          }

          .footer {
            background-color: #f8f9fa;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
          }

          .footer p {
            font-size: 12px;
            color: #666;
            margin: 5px 0;
          }

          .divider {
            height: 1px;
            background-color: #e0e0e0;
            margin: 20px 0;
          }

          @media (max-width: 600px) {
            .header h1 {
              font-size: 22px;
            }

            .content {
              padding: 25px 20px;
            }

            .info-box {
              font-size: 13px;
              padding: 12px 14px;
            }

            .greeting {
              font-size: 15px;
            }

            .cta-button {
              font-size: 14px;
              padding: 12px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>⏰ Compliance Deadline Reminder</h1>
            </div>
            <div class="content">
              <p class="greeting">Hello <strong>${safeName}</strong>,</p>
              <div class="status-pill">Upcoming action required</div>
              <p>The compliance item <strong>${safeTitle}</strong> is due on <strong>${safeDeadline}</strong>.</p>
              <p>This is a reminder that the deadline is coming up in <strong>${safeReminderLabel}</strong>.</p>

              <div class="info-box">
                <strong>Reminder details:</strong><br/>
                <strong style="display: inline-block; min-width: 90px;">Item:</strong> ${safeTitle}<br/>
                <strong style="display: inline-block; min-width: 90px;">Due date:</strong> ${safeDeadline}<br/>
                <strong style="display: inline-block; min-width: 90px;">Reminder:</strong> ${safeReminderLabel}
              </div>

              <div class="highlight">
                <strong>Note:</strong> ${safeDescription}
              </div>

              <div class="cta-section">
                <a href="${escapeHtml(complianceLink)}" class="cta-button" style="display: inline-block;">Review this Compliance before the deadline</a>
              </div>

              <div class="divider"></div>
              <p>Please review the item and take any required action before the deadline.</p>
              <p style="margin-top: 16px;">Best regards,<br/><strong>The NDC CMS Team</strong></p>
            </div>
            <div class="footer">
              <p><strong>NDC CMS</strong></p>
              <div class="divider"></div>
              <p>This is an automated reminder email. Please do not reply to this message.</p>
              <p style="margin-top: 15px; color: #999;">© 2026 NDC CMS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const sendComplianceDeadlineReminders = async (now = new Date(), options = {}) => {
  try {
    const where = {
      endDate: { [Op.gte]: new Date(now) },
      status: { [Op.ne]: "Completed" },
    };

    if (options.itemId) {
      where.id = options.itemId;
    }

    const items = await Compliance.findAll({
      where,
      attributes: [
        "id",
        "title",
        "status",
        "endDate",
        "createdBy",
        "assignedToUserId",
        "assignedToWorkgroupId",
        "assignedToDepartmentId",
        "assignedToUnitsId",
        "assignedToUserIds",
        "assignedToWorkgroupIds",
        "assignedToDepartmentIds",
        "assignedToUnitsIds",
        "reminderStagesSent",
      ],
    });

    const thresholds = await getReminderThresholds();
    const testTime = await getReminderTestTime();
    const remindersEnabled = await getReminderEnabled();

    if (!remindersEnabled) {
      return;
    }

    const reminderEmailEnabled = await isChannelEnabled("compliance_deadline_reminder", "email");

    for (const item of items) {
      const stage = getReminderStageName(item.endDate, now, thresholds);
      // Debugging: log threshold and remaining days when enabled
      try {
        if (process.env.COMPLIANCE_REMINDER_DEBUG) {
          const deadlineDate = item.endDate ? new Date(item.endDate) : null;
          const diffMs = deadlineDate ? (deadlineDate.getTime() - new Date(now).getTime()) : null;
          const diffDays = diffMs !== null ? diffMs / (1000 * 60 * 60 * 24) : null;
          const roundedDiffDays = diffDays !== null ? Math.floor(diffDays) : null;
          const normalized = normalizeReminderThresholds(thresholds).sort((a, b) => a - b);
          console.log(`[Reminder DEBUG] item=${item.id} endDate=${deadlineDate?.toISOString() || 'n/a'} roundedDays=${roundedDiffDays} thresholds=${JSON.stringify(normalized)} stage=${stage}`);
        }
      } catch (err) {
        // ignore debug logging errors
      }
      if (!stage) continue;

      if (testTime !== null) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const targetMinute = testTime % 100;
        const targetHour = Math.floor(testTime / 100);
        if (currentHour !== targetHour || currentMinute !== targetMinute) {
          continue;
        }
      }
      if (!stage) continue;

      const sentStages = normalizeReminderStages(item.reminderStagesSent);
      if (sentStages.includes(stage)) continue;

      const recipients = await getRecipientEmailsForItem(item);
      if (!recipients.length) continue;

      const deadlineLabel = item.endDate ? new Date(item.endDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "the deadline";
      const reminderLabel = buildReminderLabel(stage, thresholds);

      if (reminderEmailEnabled) {
        const frontendUrl = process.env.FRONTEND_URL || "http://fms.ndc.gov.ph";
        for (const recipient of recipients) {
          const recipientName = [recipient.firstName, recipient.middleName, recipient.lastName].filter(Boolean).join(" ") || recipient.username || recipient.email;
          const safeEmail = escapeHtml(recipient.email);
          const htmlContent = buildComplianceReminderHtml({
            recipientName,
            title: item.title,
            deadline: deadlineLabel,
            reminderLabel,
            description: item.description,
            complianceId: item.id,
            frontendUrl,
          });
          const personalHtml = htmlContent.replace("Compliance deadline reminder", `Compliance deadline reminder for ${escapeHtml(recipientName)}`);
          console.log(`[Reminder] Sending reminder for compliance item ${item.id} to ${recipient.email} (stage ${stage})`);
          await sendEmail(
            recipient.email,
            `Compliance deadline reminder: ${item.title || "Upcoming deadline"}`,
            personalHtml.replace("${safeEmail}", safeEmail)
          );
        }
      } else {
        console.log(`[Reminder] Email disabled via notification rule; skipping send for compliance item ${item.id} (stage ${stage})`);
      }

      const updatedStages = Array.from(new Set([...sentStages, stage]));
      await item.update({ reminderStagesSent: JSON.stringify(updatedStages) });
    }
  } catch (error) {
    console.error("Compliance reminder processing failed:", error);
  }
};

export const startComplianceReminderScheduler = () => {
  sendComplianceDeadlineReminders().catch((error) => {
    console.error("Initial compliance reminder scan failed:", error);
  });

  const intervalMs = Number(process.env.COMPLIANCE_REMINDER_INTERVAL_MS || 60 * 1000);
  setInterval(() => {
    sendComplianceDeadlineReminders().catch((error) => {
      console.error("Compliance reminder scan failed:", error);
    });
  }, intervalMs);
};