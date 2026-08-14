import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Bell, Mail, Smartphone, RefreshCw, AlertCircle } from "lucide-react";
import api, { endpoints } from "../config/api";
import { hasPermission, PERMISSIONS } from "../utils/permissions";

// NOTE: adjust these two import paths to match where your project actually
// keeps `api` (the axios instance) and `permissions.js`.

const ToggleSwitch = ({ enabled, onClick, disabled, label }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
      enabled ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-700"
    }`}
    aria-pressed={enabled}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
        enabled ? "translate-x-5" : "translate-x-1"
      }`}
    />
  </button>
);

const SaveStatusBadge = ({ status }) => {
  const config = {
    idle: { dot: "bg-slate-300 dark:bg-slate-600", label: "Synced" },
    saving: { dot: "bg-amber-500 animate-pulse", label: "Saving..." },
    saved: { dot: "bg-emerald-500", label: "Saved" },
    error: { dot: "bg-rose-500", label: "Failed to save" },
  }[status] || { dot: "bg-slate-300", label: "Synced" };

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      {config.label}
    </div>
  );
};

const NotificationRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const canManage = hasPermission(PERMISSIONS.NOTIFICATIONS_RULES_MANAGE);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const resp = await api.get(endpoints.notificationRules.getAll);
      setRules(resp?.data?.data || []);
    } catch (err) {
      setLoadError(err?.response?.data?.message || err.message || "Failed to load notification rules");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const updateRule = async (id, field, value) => {
    if (!canManage) return;

    const previousRules = rules;
    // Optimistic update so the toggle feels instant.
    setRules((current) => current.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)));
    setSaveStatus("saving");

    try {
      await api.patch(endpoints.notificationRules.update(id), { [field]: value });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      // Roll back on failure so the UI never lies about what's saved.
      setRules(previousRules);
      setSaveStatus("error");
    }
  };

  const counts = useMemo(
    () => ({
      total: rules.length,
      emailEnabled: rules.filter((rule) => rule.email).length,
      inAppEnabled: rules.filter((rule) => rule.inApp).length,
    }),
    [rules],
  );

  return (
    <div className="rounded-lg select-none">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-500">Admin Tool</p>
          <h1 className="text-3xl font-semibold text-slate-700 dark:text-white mt-1">Notification Rules</h1>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
            Configure how compliance notifications are delivered and when they are sent.
          </p>
        </div>
        <SaveStatusBadge status={saveStatus} />
      </div>

      {/* Legend counts */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <div className="px-5 py-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Notification Types
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
              <Bell className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{counts.total}</div>
        </div>

        <div className="px-5 py-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
              In-App Enabled
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <Smartphone className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-blue-600 dark:text-blue-400">
            {counts.inAppEnabled} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">/ {counts.total}</span>
          </div>
        </div>

        <div className="px-5 py-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Email Enabled
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Mail className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {counts.emailEnabled} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">/ {counts.total}</span>
          </div>
        </div>
      </div>

      {!canManage && !loading && !loadError && (
        <div className="mb-6 flex items-center gap-3 text-amber-700 dark:text-amber-400 py-3 px-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <AlertCircle size={18} />
          <span className="flex-1 text-sm">You have view-only access. Contact an administrator to change these settings.</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-emerald-500" />
          Loading notification rules...
        </div>
      )}

      {/* Error */}
      {loadError && !loading && (
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400 py-6 px-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-6">
          <AlertCircle size={18} />
          <span className="flex-1">{loadError}</span>
          <button onClick={fetchRules} className="text-sm underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {!loading && !loadError && (
        <div>
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">Compliance</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Toggle delivery per event. Turning a channel off here stops that notification from being sent through that channel going forward.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto scrollbar-green">
              <table className="min-w-full text-sm bg-white dark:bg-slate-900">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="px-5 py-3 text-left whitespace-nowrap">#</th>
                    <th className="px-5 py-3 text-left whitespace-nowrap">Notification</th>
                    <th className="px-5 py-3 text-center whitespace-nowrap">In App</th>
                    <th className="px-5 py-3 text-center whitespace-nowrap">Email</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800/40 divide-y divide-slate-200 dark:divide-slate-700">
                  {rules.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-slate-400 dark:text-slate-500">
                        No notification rules found.
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule, i) => (
                      <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="px-5 py-3.5 text-xs sm:text-sm align-top text-slate-400 dark:text-slate-500 whitespace-nowrap">{i + 1}</td>
                        <td className="px-5 py-3.5 text-xs sm:text-sm align-top">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white break-words">{rule.title}</span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-950 dark:text-slate-400 flex-shrink-0">
                              {rule.id}
                            </span>
                          </div>
                          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 break-words">{rule.description}</p>
                        </td>
                        <td className="px-5 py-3.5 text-xs sm:text-sm align-top">
                          <div className="flex justify-center">
                            <ToggleSwitch
                              enabled={rule.inApp}
                              disabled={!canManage}
                              label={`Toggle in-app notification for ${rule.title}`}
                              onClick={() => updateRule(rule.id, "inApp", !rule.inApp)}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs sm:text-sm align-top">
                          <div className="flex justify-center">
                            <ToggleSwitch
                              enabled={rule.email}
                              disabled={!canManage}
                              label={`Toggle email notification for ${rule.title}`}
                              onClick={() => updateRule(rule.id, "email", !rule.email)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationRules;