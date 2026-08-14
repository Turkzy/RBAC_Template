import React, { useEffect, useState } from "react";
import { X, LogIn, LogOut, Monitor, PlusCircle, PenSquare, Trash2 } from "lucide-react";
import api, { endpoints } from "../config/api.js";

const ActivityLogDetailsModal = ({ log, onClose }) => {
  const [details, setDetails] = useState(log);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(endpoints.activityLogs.getById(log.id));
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

  const formatChangeValue = (value) => {
    if (value === null || value === undefined) return "-";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return "-";
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.join(", ");
        if (typeof parsed === "object") return JSON.stringify(parsed);
      } catch {
        // use raw string
      }
      return trimmed;
    }
    return String(value);
  };

  const fullName = details.user
    ? `${details.user.firstName} ${details.user.lastName}`.trim()
    : metadata.userName || metadata.createdUserName || metadata.updatedUserName || metadata.deletedUserName || null;
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

  const rawDescription = details.description || metadata.description;
  const description = rawDescription && metadata.title
    ? rawDescription.replace(/(compliance item:\s*)\d+$/i, `$1${metadata.title}`)
    : rawDescription || "No description available.";

  const getFieldLabel = (field) => {
    const labels = {
      assignedToUserIds: "Assigned User",
      assignedToWorkgroupIds: "Assigned Workgroup",
      assignedToDepartmentIds: "Assigned Department",
      assignedToUnitsIds: "Assigned Unit",
      assignedToUserId: "Assigned User",
      assignedToWorkgroupId: "Assigned Workgroup",
      assignedToDepartmentId: "Assigned Department",
      assignedToUnitsId: "Assigned Unit",
      title: "Title",
      description: "Description",
      complianceType: "Compliance Type",
      status: "Status",
      colorIndex: "Color",
      startDate: "Start Date",
      endDate: "End Date",
      originalFilenames: "Files",
    };
    return labels[field] || field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
  };

  const renderDescriptionContent = () => {
    if (changes.length > 0) {
      return (
        <div className="space-y-3">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Changed fields
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2">
            <table className="min-w-[480px] w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm text-left">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900">
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    Field
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                    Before
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                    After
                  </th>
                </tr>
              </thead>
              <tbody>
                {changes.map((change) => (
                  <tr
                    key={change.field}
                    className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 last:border-none"
                  >
                    <td className="px-3 py-3 align-top text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                      {getFieldLabel(change.field)}
                    </td>
                    <td className="px-3 py-3 align-top text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {formatChangeValue(change.before)}
                    </td>
                    <td className="px-3 py-3 align-top text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {formatChangeValue(change.after)}
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
    const act = (details.action || "").toLowerCase();
    if (act === "login")
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-500/20 px-3 py-1 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
          <LogIn className="h-4 w-4" /> login
        </span>
      );
    if (act === "logout")
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 dark:bg-sky-500/20 px-3 py-1 text-xs sm:text-sm font-semibold text-sky-700 dark:text-sky-300 whitespace-nowrap">
          <LogOut className="h-4 w-4" /> logout
        </span>
      );

    if (act.includes("create compliance"))
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs sm:text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 whitespace-nowrap">
          <PlusCircle className="h-4 w-4" /> Create Compliance
        </span>
      );

    if (act.includes("update compliance"))
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs sm:text-sm font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300 whitespace-nowrap">
          <PenSquare className="h-4 w-4" /> Update Compliance
        </span>
      );

    if (act.includes("delete compliance"))
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs sm:text-sm font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 whitespace-nowrap">
          <Trash2 className="h-4 w-4" /> Delete Compliance
        </span>
      );

    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
        {details.action}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-slate-950 shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white truncate">
                Activity Details
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Complete information about this activity
              </p>
              <div className="mt-2 sm:mt-3">{renderActionBadge()}</div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-4 sm:py-6 text-xs sm:text-sm overflow-y-auto">
          {/* Overview */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
              Overview
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
              <div className="min-w-0">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Date / Time
                </div>
                <div className="mt-2 text-slate-900 dark:text-white break-words">
                  {formatDate(details.createdAt)}
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Employee
                </div>
                <div className="mt-2 text-slate-900 dark:text-white break-words">
                  {fullName || "System"}
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Email
                </div>
                <div className="mt-2 text-slate-900 dark:text-white break-words">
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
              <div className="min-w-0">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Browser
                </div>
                <div className="mt-2 text-sm text-slate-700 dark:text-slate-300 break-words">
                  {metadata.browser || "-"}
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Device Type
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 break-words">
                  <Monitor className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />{" "}
                  {metadata.device || "Desktop"}
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Platform
                </div>
                <div className="mt-2 text-sm text-slate-700 dark:text-slate-300 break-words">
                  {metadata.platform || "-"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto rounded-md bg-slate-700 dark:bg-slate-600 text-white px-4 py-2 text-sm hover:bg-slate-800 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogDetailsModal;