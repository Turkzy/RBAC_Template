import NotificationRule from "../models/NotificationrulesModel.js";

// The 3 real, currently-implemented notification events in this app.
// Keys here MUST match what ComplianceController.js / complianceReminderService.js
// pass into isChannelEnabled(...).
export const DEFAULT_NOTIFICATION_RULES = [
  {
    id: "compliance_submission_received",
    title: "Document submission received",
    description: "Notify the creator when a proponent submits document(s) for their compliance item.",
    inApp: true,
    email: true,
    emailTemplate: "plain_transaction_message",
  },
  {
    id: "compliance_review_decision",
    title: "Submission reviewed (approved/rejected)",
    description: "Notify the submitter when a reviewer approves or rejects their submission.",
    inApp: true,
    email: true,
    emailTemplate: "plain_transaction_message",
  },
  {
    id: "compliance_deadline_reminder",
    title: "Compliance deadline reminder",
    description: "Send/show reminders as a compliance deadline approaches (14/7/3 days out).",
    inApp: true,
    email: true,
    emailTemplate: "plain_transaction_message",
  },
];

// Makes sure the 3 rows above always exist so the admin page and the
// controllers never have to deal with a "missing row" case. Safe to call
// on every server boot.
export const ensureDefaultNotificationRules = async () => {
  for (const rule of DEFAULT_NOTIFICATION_RULES) {
    await NotificationRule.findOrCreate({
      where: { id: rule.id },
      defaults: rule,
    });
  }
};

// --- small in-memory cache so hot paths (email sends, list endpoint) -------
// don't hit the DB on every single call. Cleared automatically after
// CACHE_TTL_MS, and manually whenever a rule is updated via the API.
const CACHE_TTL_MS = 30 * 1000;
let cache = null; // Map<id, {inApp, email}>
let cacheLoadedAt = 0;

const loadCache = async () => {
  const rows = await NotificationRule.findAll({
    attributes: ["id", "inApp", "email"],
  });
  cache = new Map(rows.map((row) => [row.id, { inApp: row.inApp, email: row.email }]));
  cacheLoadedAt = Date.now();
  return cache;
};

export const invalidateNotificationRuleCache = () => {
  cache = null;
  cacheLoadedAt = 0;
};

const getCache = async () => {
  if (!cache || Date.now() - cacheLoadedAt > CACHE_TTL_MS) {
    await loadCache();
  }
  return cache;
};

/**
 * The actual gate. Call this immediately before doing the side effect
 * (sending an email, or including an item in the in-app notification list).
 *
 * Fails OPEN (returns true) if the rule doesn't exist yet, so a missing row
 * never silently swallows a real notification.
 */
export const isChannelEnabled = async (ruleId, channel) => {
  if (channel !== "inApp" && channel !== "email") {
    throw new Error(`Unknown notification channel: ${channel}`);
  }
  const map = await getCache();
  const rule = map.get(ruleId);
  if (!rule) return true;
  return channel === "inApp" ? rule.inApp : rule.email;
};