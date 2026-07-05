

import React, { useState, useEffect } from "react";
import { ShieldCheck, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import SweetAlert from "../components/SweetAlert.jsx";

const SystemSettingsPage = () => {
  const { sessionTimeoutConfig, updateSessionTimeoutConfig } = useAuth();

  const [timeout, setTimeoutMinutes] = useState(String(sessionTimeoutConfig?.minutes ?? 30));
  const [enabled, setEnabled] = useState(sessionTimeoutConfig?.enabled ?? true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const savedMinutesStr = String(sessionTimeoutConfig?.minutes ?? 30);
  const isChanged = timeout !== savedMinutesStr || enabled !== Boolean(sessionTimeoutConfig?.enabled);

  const handleSave = async () => {
    setSaving(true);
    try {
      // parse and validate minutes before saving
      let minutes = parseInt(timeout, 10);
      if (Number.isNaN(minutes) || minutes < 1) minutes = 1;
      // persist into context/localStorage
      updateSessionTimeoutConfig({ minutes, enabled });
      // simulate latency
      await new Promise((r) => setTimeout(r, 400));
      setSaved(true);
      SweetAlert.toast.success("Settings saved");
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      // ignore for now
    } finally {
      setSaving(false);
    }
  };



  useEffect(() => {
    // keep local form in sync if config changes elsewhere
    if (sessionTimeoutConfig) {
      setTimeoutMinutes(String(sessionTimeoutConfig.minutes ?? 30));
      setEnabled(Boolean(sessionTimeoutConfig.enabled));
    }
  }, [sessionTimeoutConfig]);

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.35em] text-emerald-500">Admin Tool</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-700 dark:text-white mt-1">System Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure system-wide settings and preferences</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !isChanged}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check size={16} className="text-white" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && <span className="text-sm text-emerald-600 ml-2">Saved</span>}
        </div>
      </div>

      <div className="min-w-full text-sm bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-white dark:bg-slate-900">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
            <ShieldCheck size={18} className="text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">Security Settings</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage authentication and session behavior</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-12 items-center gap-4 py-4">
            <div className="col-span-8">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Session Timeout (Minutes)</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Number of minutes of inactivity before user is automatically logged out</div>
            </div>

            <div className="col-span-4 flex items-center justify-end gap-3">
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
                  className="w-24 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">minutes</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 my-4" />

          <div className="grid grid-cols-12 items-center gap-4 py-4">
            <div className="col-span-8">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Enable Session Timeout</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enable or disable automatic logout on inactivity</div>
            </div>

            <div className="col-span-4 flex items-center justify-end">
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