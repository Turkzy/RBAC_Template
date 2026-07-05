import ActivityLog from "../models/ActivityLogModel.js";
import UAParser from "ua-parser-js";

export const recordActivity = async (req, action, description = "", metadata = {}) => {
  try {
    const userId = req.user?.userId ?? metadata?.userId ?? null;

    // Prefer X-Forwarded-For (could be comma-separated list) then req.ip
    const ipHeader = req.headers?.["x-forwarded-for"] || req.ip || null;
    const ip = ipHeader ? String(ipHeader).split(",")[0].trim() : null;

    const userAgent = req.get?.("User-Agent") || req.headers?.["user-agent"] || null;

    // Parse user agent for browser/device/platform info and merge into metadata
    let parsedMetadata = {};
    try {
      const baseMeta = typeof metadata === "object" && metadata !== null ? metadata : {};
      const parser = new UAParser(userAgent || "");
      const result = parser.getResult();
      parsedMetadata = {
        ...baseMeta,
        device: result.device?.type || baseMeta.device || "Desktop",
        browser: result.browser?.name || baseMeta.browser || null,
        platform: result.os?.name || baseMeta.platform || null,
      };
    } catch (e) {
      parsedMetadata = metadata;
    }

    await ActivityLog.create({
      userId,
      action,
      description,
      metadata: parsedMetadata,
      ip,
      userAgent,
    });
  } catch (err) {
    console.error("Failed to record activity", err);
  }
};