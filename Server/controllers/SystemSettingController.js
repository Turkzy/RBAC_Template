import SystemSetting from "../models/SystemSettingModel.js";
import { recordActivity } from "../services/activityService.js";
import {
  buildCreateDescription,
  buildUpdateDescription,
} from "../utils/activityLogMessage.js";

export const getSystemSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await SystemSetting.findOne({ where: { key } });
    return res.status(200).json({ error: false, setting: setting ? { key: setting.key, value: setting.value } : null });
  } catch (error) {
    console.error("Get system setting error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export const upsertSystemSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ error: true, message: "Setting key is required" });
    }

    const [setting, created] = await SystemSetting.findOrCreate({
      where: { key },
      defaults: { value: value ?? null },
    });

    const previousValue = setting.value;
    setting.value = value ?? null;
    await setting.save();

    if (created) {
      await recordActivity(
        req,
        "create",
        buildCreateDescription("system setting", key),
        {
          entity: "system_setting",
          settingKey: key,
          value: setting.value,
        }
      );
    } else if (previousValue !== setting.value) {
      const changeDetails = [{ field: "value", before: previousValue, after: setting.value }];
      await recordActivity(
        req,
        "update",
        buildUpdateDescription("system setting", changeDetails, { target: key }),
        {
          entity: "system_setting",
          settingKey: key,
          changes: changeDetails,
        }
      );
    }

    return res.status(200).json({ error: false, setting: { key: setting.key, value: setting.value } });
  } catch (error) {
    console.error("Upsert system setting error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
