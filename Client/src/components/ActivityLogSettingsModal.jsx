import React, { useState, useEffect } from "react";
import api, { endpoints } from "../config/api.js";
import SweetAlert from "./SweetAlert.jsx";

const STORAGE_KEY = "activity_log_retention_months";

const ActivityLogSettingsModal = ({ open, onClose, onRetentionApply }) => {
  const [months, setMonths] = useState(3);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = parseInt(localStorage.getItem(STORAGE_KEY) || "3", 10);
    setMonths(saved);
  }, [open]);

  const save = async () => {
    // Show confirmation dialog
    const confirmed = await SweetAlert.confirm(
      `Clean Activity Logs?`,
      `This will permanently delete all logs older than ${months} month${months !== 1 ? 's' : ''}. This action cannot be undone.`,
      "Yes, clean logs",
      "Cancel"
    );

    if (confirmed.isConfirmed) {
      setLoading(true);
      SweetAlert.loading("Cleaning logs...", "Please wait");

      try {
        const res = await api.post(endpoints.activityLogs.retention, { months });
        SweetAlert.close();
        
        localStorage.setItem(STORAGE_KEY, String(months));
        
        SweetAlert.success(
          "Logs cleaned!",
          `Successfully deleted ${res.data.deletedCount || 0} old logs`
        );

        if (onRetentionApply) {
          onRetentionApply();
        }
        
        setTimeout(() => {
          onClose();
        }, 1000);
      } catch (err) {
        SweetAlert.close();
        console.error("Failed to cleanup logs", err);
        SweetAlert.error("Cleanup failed", "Failed to clean activity logs");
      }
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 shrink-0">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Activity Log Settings</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Configure log retention and cleanup</p>
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800 space-y-3 overflow-y-auto">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-300 font-medium">Retention Period (Months)</label>
            <input
              type="number"
              min={1}
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value || "1", 10))}
              className="mt-2 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 sm:py-2 text-base sm:text-sm text-slate-900 dark:text-white"
              disabled={loading}
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 break-words">Logs older than {months} month{months !== 1 ? 's' : ''} will be deleted</p>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse gap-2 sm:flex-row sm:gap-3 sm:justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="w-full sm:w-auto rounded-md bg-emerald-600 text-white px-4 py-2 text-sm hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-50"
            disabled={loading}
          >
            Save & Clean
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogSettingsModal;