

import React, { useState, useEffect } from "react";
import { ShieldCheck, Check, BellRing } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import SweetAlert from "../components/SweetAlert.jsx";
import api, { endpoints } from "../config/api.js";
import { PERMISSIONS } from "../utils/permissions.js";

const SystemSettingsPage = () => {
  const { sessionTimeoutConfig, updateSessionTimeoutConfig, user, hasPermission } = useAuth();

  const [timeout, setTimeoutMinutes] = useState(String(sessionTimeoutConfig?.minutes ?? 30));
  const [enabled, setEnabled] = useState(sessionTimeoutConfig?.enabled ?? true);
  const [thresholdInput, setThresholdInput] = useState("");
  const [thresholdChips, setThresholdChips] = useState(["14d", "7d", "3d"]);
  const [reminderTestTime, setReminderTestTime] = useState("0800");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedReminderSettings, setSavedReminderSettings] = useState(null);

  const addThresholdChip = () => {
    const chips = parseThresholdList(thresholdInput);
    if (!chips.length) return;
    const next = [...new Set([...thresholdChips, ...chips])];
    const sorted = normalizeThresholdChips(next).map(formatThresholdDisplay);
    setThresholdChips(sorted);
    setThresholdInput("");
  };

  const removeThresholdChip = (index) => {
    setThresholdChips((prev) => prev.filter((_, idx) => idx !== index));
  };

  const parseThresholdValue = (value) => {
    if (value === null || value === undefined) return null;
    const raw = String(value).trim().toLowerCase();
    if (!raw) return null;

    const weekMatch = raw.match(/^([0-9]+(?:\.[0-9]+)?)\s*(w|week|weeks)$/);
    if (weekMatch) {
      const number = Number(weekMatch[1]);
      return Number.isFinite(number) && number > 0 ? Math.round(number * 7) : null;
    }

    const dayMatch = raw.match(/^([0-9]+(?:\.[0-9]+)?)\s*(d|day|days)$/);
    if (dayMatch) {
      const number = Number(dayMatch[1]);
      return Number.isFinite(number) && number > 0 ? Math.round(number) : null;
    }

    const numericValue = Number(raw);
    return Number.isFinite(numericValue) && numericValue > 0 ? Math.round(numericValue) : null;
  };

  const formatThresholdDisplay = (days) => {
    if (days % 7 === 0) return `${days / 7}w`;
    return `${days}d`;
  };

  const parseThresholdList = (value) => {
    if (!value) return [];
    return String(value)
      .split(/[\s,]+/)
      .map((item) => parseThresholdValue(item))
      .filter((value) => value !== null)
      .map((value) => formatThresholdDisplay(value));
  };

  const normalizeThresholdChips = (chips) => {
    return [...new Set(chips.map((chip) => parseThresholdValue(chip)).filter((value) => value !== null))].sort((a, b) => a - b);
  };

  const roleName = (user?.role || "").toString().trim().toLowerCase();
  const isSuperAdmin = roleName === "super admin" || roleName.includes("super");
  const canManageSystemSettings = isSuperAdmin || hasPermission(PERMISSIONS.SYSTEM_SETTINGS_MANAGE);

  const savedMinutesStr = String(sessionTimeoutConfig?.minutes ?? 30);
  const initialReminderThresholds = "14,7,3";
  const initialReminderTestTime = "";
  const normalizedThresholds = normalizeThresholdChips(thresholdChips);
  const thresholdsValue = normalizedThresholds.length ? normalizedThresholds.join(",") : initialReminderThresholds;
  const isChanged = timeout !== savedMinutesStr || enabled !== Boolean(sessionTimeoutConfig?.enabled) || thresholdsValue !== (savedReminderSettings?.thresholds ?? initialReminderThresholds) || reminderTestTime !== (savedReminderSettings?.testTime ?? initialReminderTestTime) || reminderEnabled !== (savedReminderSettings?.enabled ?? true);

  const loadReminderSettings = async () => {
    try {
      const [
        thresholdsResponse,
        testTimeResponse,
        enabledResponse,
        timeoutMinutesResponse,
        timeoutEnabledResponse,
      ] = await Promise.all([
        api.get(endpoints.systemSettings.get("compliance_reminder_thresholds")),
        api.get(endpoints.systemSettings.get("compliance_reminder_test_time")),
        api.get(endpoints.systemSettings.get("compliance_reminder_enabled")),
        api.get(endpoints.systemSettings.get("session_timeout_minutes")),
        api.get(endpoints.systemSettings.get("session_timeout_enabled")),
      ]);

      const thresholdsValue = thresholdsResponse?.data?.setting?.value;
      if (thresholdsValue) {
        setThresholdChips(parseThresholdList(thresholdsValue));
      } else {
        setThresholdChips(parseThresholdList(initialReminderThresholds));
      }
      setThresholdInput("");

      const testTimeValue = testTimeResponse?.data?.setting?.value;
      setReminderTestTime(testTimeValue ? String(testTimeValue) : "");

      const enabledValue = enabledResponse?.data?.setting?.value;
      const isReminderEnabled = String(enabledValue ?? "true").toLowerCase() !== "false" && String(enabledValue ?? "true").toLowerCase() !== "0" && String(enabledValue ?? "true").toLowerCase() !== "off";
      setReminderEnabled(isReminderEnabled);

      const timeoutMinutesValue = timeoutMinutesResponse?.data?.setting?.value;
      const timeoutEnabledValue = timeoutEnabledResponse?.data?.setting?.value;
      const timeoutMinutes = timeoutMinutesValue !== undefined && timeoutMinutesValue !== null ? String(timeoutMinutesValue) : String(sessionTimeoutConfig?.minutes ?? 30);
      const timeoutEnabled = String(timeoutEnabledValue ?? String(sessionTimeoutConfig?.enabled ?? true)).toLowerCase() !== "false" && String(timeoutEnabledValue ?? String(sessionTimeoutConfig?.enabled ?? true)).toLowerCase() !== "0" && String(timeoutEnabledValue ?? String(sessionTimeoutConfig?.enabled ?? true)).toLowerCase() !== "off";
      setTimeoutMinutes(timeoutMinutes);
      setEnabled(timeoutEnabled);

      setSavedReminderSettings({
        thresholds: thresholdsValue || initialReminderThresholds,
        testTime: testTimeValue || initialReminderTestTime,
        enabled: isReminderEnabled,
      });
    } catch (err) {
      console.error("Failed to load reminder settings", err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let minutes = parseInt(timeout, 10);
      if (Number.isNaN(minutes) || minutes < 1) minutes = 1;

      const normalizedThresholds = normalizeThresholdChips(thresholdChips);
      const thresholdsValue = normalizedThresholds.length ? normalizedThresholds.join(",") : initialReminderThresholds;

      updateSessionTimeoutConfig({ minutes, enabled });
      await api.put(endpoints.systemSettings.upsert, {
        key: "compliance_reminder_thresholds",
        value: thresholdsValue,
      });
      await api.put(endpoints.systemSettings.upsert, {
        key: "compliance_reminder_test_time",
        value: reminderTestTime ? String(reminderTestTime) : "",
      });
      await api.put(endpoints.systemSettings.upsert, {
        key: "compliance_reminder_enabled",
        value: reminderEnabled ? "true" : "false",
      });
      await api.put(endpoints.systemSettings.upsert, {
        key: "session_timeout_minutes",
        value: String(minutes),
      });
      await api.put(endpoints.systemSettings.upsert, {
        key: "session_timeout_enabled",
        value: enabled ? "true" : "false",
      });
      updateSessionTimeoutConfig({ minutes, enabled });
      await loadReminderSettings();
      setSaved(true);
      SweetAlert.toast.success("Reminder settings saved");
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      SweetAlert.toast.error(err.response?.data?.message || "Failed to save system settings");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (sessionTimeoutConfig) {
      setTimeoutMinutes(String(sessionTimeoutConfig.minutes ?? 30));
      setEnabled(Boolean(sessionTimeoutConfig.enabled));
    }

    loadReminderSettings();
  }, [sessionTimeoutConfig]);

  if (!canManageSystemSettings) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <h2 className="text-lg font-semibold">Access denied</h2>
          <p className="mt-2">Only Super Admins or users with the system_settings.manage permission can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500">Admin Tool</p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-700 dark:text-white mt-1">System Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Configure system-wide settings and preferences</p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !isChanged}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Check size={16} className="text-white" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && <span className="text-sm text-emerald-600 sm:ml-2">Saved</span>}
        </div>
      </div>

      <div className="text-sm bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-3 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start sm:items-center gap-3 sm:gap-4 bg-white dark:bg-slate-900">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full flex-shrink-0">
            <BellRing size={16} className="text-slate-600 dark:text-slate-300 sm:w-[18px] sm:h-[18px]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-200">Compliance Reminder Settings</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Set the reminder windows for compliance deadlines</p>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 items-start md:items-center gap-3 sm:gap-4 py-4">
            <div className="md:col-span-8">
              <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">Enable Reminder Notifications</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Turn compliance reminder emails on or off</div>
            </div>

            <div className="md:col-span-4 flex items-center justify-start md:justify-end">
              <button
                onClick={() => setReminderEnabled((v) => !v)}
                aria-pressed={reminderEnabled}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${reminderEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${reminderEnabled ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 my-4" />

          <div className="grid grid-cols-1 gap-3 sm:gap-4 py-4 md:grid-cols-12 md:items-start">
            <div className="md:col-span-8">
              <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">Reminder Thresholds</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Use friendly values like 3d, 7d, 2w or 14. Click Add to create chips.</div>
            </div>

            <div className="md:col-span-4 flex flex-col items-stretch md:items-end md:justify-end gap-2 sm:gap-3">
              <div className="flex flex-wrap gap-2">
                {thresholdChips.length ? thresholdChips.map((chip, idx) => (
                  <button
                    key={`${chip}-${idx}`}
                    type="button"
                    onClick={() => removeThresholdChip(idx)}
                    className="inline-flex max-w-full items-center gap-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    {chip}
                    <span className="text-slate-500 dark:text-slate-400">×</span>
                  </button>
                )) : (
                  <span className="text-xs text-slate-500 dark:text-slate-400">No thresholds selected</span>
                )}
              </div>
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-2">
                <input
                  type="text"
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addThresholdChip();
                    }
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Example: 3d, 1w, 14"
                />
                <button
                  type="button"
                  onClick={addThresholdChip}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs sm:text-sm font-medium text-white transition hover:bg-emerald-700 flex-shrink-0"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 my-4" />

          <div className="grid grid-cols-1 md:grid-cols-12 items-start md:items-center gap-3 sm:gap-4 py-4">
            <div className="md:col-span-8">
              <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">Test Reminder Time</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Choose a friendly time and it will save as HHMM for test reminders.</div>
            </div>

            <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-3 w-full">
              <input
                type="time"
                value={reminderTestTime ? `${String(reminderTestTime).padStart(4, "0").slice(0,2)}:${String(reminderTestTime).padStart(4, "0").slice(2)}` : ""}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(":");
                  if (hours !== undefined && minutes !== undefined) {
                    setReminderTestTime(`${hours}${minutes}`);
                  } else {
                    setReminderTestTime("");
                  }
                }}
                className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors md:w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-6">
        <div className="p-3 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start sm:items-center gap-3 sm:gap-4 bg-white dark:bg-slate-900">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full flex-shrink-0">
            <ShieldCheck size={16} className="text-slate-600 dark:text-slate-300 sm:w-[18px] sm:h-[18px]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-200">Security Settings</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage authentication and session behavior</p>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 items-start md:items-center gap-3 sm:gap-4 py-4">
            <div className="md:col-span-8">
              <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">Session Timeout (Minutes)</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Number of minutes of inactivity before user is automatically logged out</div>
            </div>

            <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={timeout}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const digits = raw.replace(/\D/g, "");
                    // strip leading zeros so typing '2' after '0' becomes '2'
                    const normalized = digits.replace(/^0+/, "") || (digits === "" ? "" : "0");
                    setTimeoutMinutes(normalized);
                  }}
                  className="w-16 sm:w-24 px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">minutes</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 my-4" />

          <div className="grid grid-cols-1 md:grid-cols-12 items-start md:items-center gap-3 sm:gap-4 py-4">
            <div className="md:col-span-8">
              <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">Enable Session Timeout</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enable or disable automatic logout on inactivity</div>
            </div>

            <div className="md:col-span-4 flex items-center justify-start md:justify-end">
              <button
                onClick={() => setEnabled((v) => !v)}
                aria-pressed={enabled}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;