import NotificationRule from "../models/NotificationrulesModel.js";
import { ensureDefaultNotificationRules, invalidateNotificationRuleCache } from "../services/notificationRuleService.js";
import { recordActivity } from "../services/activityService.js";
import { buildUpdateDescription } from "../utils/activityLogMessage.js";

// GET all rules (seeds the defaults on first call so this never returns empty)
export const getAllNotificationRules = async (req, res) => {
  try {
    await ensureDefaultNotificationRules();

    const rules = await NotificationRule.findAll({ order: [["id", "ASC"]] });
    return res.status(200).json({ error: false, data: rules });
  } catch (error) {
    console.error("Get notification rules error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// PATCH a single rule's toggles
export const updateNotificationRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { inApp, email, emailTemplate } = req.body;

    const rule = await NotificationRule.findByPk(id);
    if (!rule) {
      return res.status(404).json({ error: true, message: "Notification rule not found" });
    }

    const before = rule.toJSON();

    await rule.update({
      inApp: typeof inApp === "boolean" ? inApp : rule.inApp,
      email: typeof email === "boolean" ? email : rule.email,
      emailTemplate: emailTemplate !== undefined ? emailTemplate : rule.emailTemplate,
    });

    invalidateNotificationRuleCache();

    const changeDetails = ["inApp", "email", "emailTemplate"]
      .filter((field) => before[field] !== rule[field])
      .map((field) => ({ field, before: before[field], after: rule[field] }));

    if (changeDetails.length) {
      await recordActivity(
        req,
        "update",
        buildUpdateDescription("notification rule", changeDetails, { target: rule.title }),
        {
          entity: "notification_rule",
          notificationRuleId: rule.id,
          changes: changeDetails,
        }
      );
    }

    return res.status(200).json({ error: false, data: rule, message: "Notification rule updated successfully" });
  } catch (error) {
    console.error("Update notification rule error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};