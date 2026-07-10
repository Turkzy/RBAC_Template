import React, { useEffect, useState } from "react";
import { X, LogIn, LogOut, Monitor } from "lucide-react";
import api from "../config/api.js";

const ActivityLogDetailsModal = ({ log, onClose }) => {
  const [details, setDetails] = useState(log);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/activity-logs/${log.id}`);
        setDetails(res.data.log);
      } catch (err) {
        console.error("Failed to fetch log details", err);
      }
    };

    fetchDetail();
  }, [log.id]);

  if (!details) return null;

  const metadata =
    typeof details.metadata === "string"
      ? (() => {
          try {
            return JSON.parse(details.metadata);
          } catch {
            return details.metadata || {};
          }
        })()
      : details.metadata || {};

  const changes = metadata.changes || [];

  const fullName = details.user
    ? `${details.user.firstName} ${details.user.lastName}`
    : metadata.userName || null;
  const userEmail =
    details.user?.email ||
    metadata.userEmail ||
    metadata.deletedUserEmail ||
    "—";

  const formatDate = (value) =>
    new Date(value).toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });

  const description =
    details.description || metadata.description || "No description available.";

  const renderDescriptionContent = () => {
    if (changes.length > 0) {
      return (
        <div className="space-y-3">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Changed fields
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                    Field
                  </th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                    Before
                  </th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                    After
                  </th>
                </tr>
              </thead>
              <tbody>
                {changes.map((change) => (
                  <tr
                    key={change.field}
                    className="border-b border-slate-200 dark:border-slate-800 last:border-none"
                  >
                    <td className="px-3 py-3 align-top text-slate-700 dark:text-slate-300 font-medium">
                      {change.field}
                    </td>
                    <td className="px-3 py-3 align-top text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                      {change.before ?? "-"}
                    </td>
                    <td className="px-3 py-3 align-top text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                      {change.after ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (typeof description === "string") {
      const lines = description
        .split(";")
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length > 1) {
        return (
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {lines.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        );
      }
    }

    return (
      <div className="whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">
        {description}
      </div>
    );
  };

  const renderActionBadge = () => {
    if (details.action === "login")
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          <LogIn className="h-4 w-4" /> login
        </span>
      );
    if (details.action === "logout")
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 dark:bg-sky-500/20 px-3 py-1 text-sm font-semibold text-sky-700 dark:text-sky-300">
          <LogOut className="h-4 w-4" /> logout
        </span>
      );
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
        {details.action}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-2xl lg:max-w-3xl rounded-lg bg-white dark:bg-slate-950 shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Activity Details
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Complete information about this activity
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-4 sm:py-6 text-xs sm:text-sm">
          {/* Overview */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
              Overview
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Date / Time
                </div>
                <div className="mt-2 text-slate-900 dark:text-white">
                  {formatDate(details.createdAt)}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Employee
                </div>
                <div className="mt-2 text-slate-900 dark:text-white">
                  {fullName || "System"}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Email
                </div>
                <div className="mt-2 text-slate-900 dark:text-white">
                  {userEmail}
                </div>
              </div>
            </div>
            <div className="my-6 border-t border-slate-100 dark:border-slate-800" />
            <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Description
            </div>
            <div className="mt-2 max-h-96 overflow-y-auto pr-2">
              {renderDescriptionContent()}
            </div>
          </div>

          <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

          {/* Device & Network */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
              Device
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Browser
                </div>
                <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  {metadata.browser || "-"}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Device Type
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Monitor className="h-4 w-4 text-slate-500 dark:text-slate-400" />{" "}
                  {metadata.device || "Desktop"}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Platform
                </div>
                <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  {metadata.platform || "-"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-slate-700 dark:bg-slate-600 text-white px-4 py-2 text-sm hover:bg-slate-800 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogDetailsModal;
