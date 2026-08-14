import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { LogIn, LogOut, Settings, Calendar, ChevronDown, ChevronLeft, ChevronRight, KeyRound, Activity, PenSquare, Trash2, Search, Power, UserX, PlusCircle, AlertCircle } from "lucide-react";
import api, { endpoints } from "../config/api.js";
import ActivityLogDetailsModal from "../components/ActivityLogDetailsModal.jsx";
import ActivityLogSettingsModal from "../components/ActivityLogSettingsModal.jsx";
import { PERMISSIONS } from "../utils/permissions.js";
import { useAuth } from "../context/AuthContext.jsx";

const Pagination = ({ currentPage, totalPages, onPageChange, inFooter = false }) => {
  const [goToPageInput, setGoToPageInput] = useState("");

  const handleGoToPage = () => {
    const num = parseInt(goToPageInput, 10);
    if (num >= 1 && num <= totalPages) {
      onPageChange(num);
      setGoToPageInput("");
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const showStart = currentPage <= 3;
    const showEnd = currentPage >= totalPages - 2;
    const pages = new Set([1, totalPages]);
    if (showStart) {
      pages.add(2);
      pages.add(3);
      pages.add(4);
    }
    if (showEnd) {
      pages.add(totalPages - 3);
      pages.add(totalPages - 2);
      pages.add(totalPages - 1);
    }
    if (!showStart && !showEnd) {
      pages.add(currentPage - 1);
      pages.add(currentPage);
      pages.add(currentPage + 1);
    }
    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    let prev = 0;
    for (const p of sorted) {
      if (p - prev > 1) result.push("ellipsis");
      result.push(p);
      prev = p;
    }
    return result;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`flex flex-row flex-nowrap items-center justify-end gap-1 sm:gap-2 lg:gap-3 font-montserrat text-xs sm:text-sm overflow-x-auto scrollbar-green ${
        inFooter ? "" : "mt-3 sm:mt-4"
      }`}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((p, idx) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-500 dark:text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 px-1.5 sm:px-2 rounded-md text-xs sm:text-sm font-medium transition ${
                p === currentPage
                  ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600"
                  : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {p}
            </button>
          ),
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-gray-200 dark:border-slate-700 whitespace-nowrap shrink-0">
        <span className="text-[10px] sm:text-sm text-gray-500 dark:text-slate-400">Go to page</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={goToPageInput}
          onChange={(e) => setGoToPageInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
          placeholder=""
          className="w-11 sm:w-14 px-1.5 sm:px-2 py-1 text-[11px] sm:text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
        />
        <button
          onClick={handleGoToPage}
          className="px-2 sm:px-3 py-1 text-[11px] sm:text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition"
        >
          Go
        </button>
      </div>
    </div>
  );
};

const ActivityLogsPage = () => {
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [counts, setCounts] = useState({ total: 0, logins: 0, createsUpdates: 0, deletes: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const dateFilterRef = useRef(null);
  const roleName = (user?.role || "").toString().trim().toLowerCase();
  const isSuperAdmin = roleName === "super admin" || roleName.includes("super");
  const canManageActivityLogs = hasPermission(PERMISSIONS.AUDIT_LOGS_MANAGE) || isSuperAdmin;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dateFilterRef.current && !dateFilterRef.current.contains(e.target)) {
        setShowDateFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLogs = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit };
      if (search) params.q = search;
      if (actionFilter) params.action = actionFilter;
      if (startDate) params.from = startDate;
      if (endDate) params.to = endDate;
      const res = await api.get(endpoints.activityLogs.getAll, { params });
      setRows(res.data.rows || []);
      setCount(res.data.count || 0);
      setPage(res.data.page || p);
    } catch (err) {
      console.error("Failed to fetch activity logs", err);
    }
    setLoading(false);
  };

  const fetchCounts = async () => {
    try {
      const totalRes = await api.get(endpoints.activityLogs.getAll, { params: { page: 1, limit: 1 } });
      const loginsRes = await api.get(endpoints.activityLogs.getAll, { params: { page: 1, limit: 1, action: "login" } });
      const createsRes = await api.get(endpoints.activityLogs.getAll, { params: { page: 1, limit: 1, action: "create" } });
      const updatesRes = await api.get(endpoints.activityLogs.getAll, { params: { page: 1, limit: 1, action: "update" } });
      const deletesRes = await api.get(endpoints.activityLogs.getAll, { params: { page: 1, limit: 1, action: "delete" } });
      setCounts({
        total: totalRes.data.count || 0,
        logins: loginsRes.data.count || 0,
        createsUpdates: (createsRes.data.count || 0) + (updatesRes.data.count || 0),
        deletes: deletesRes.data.count || 0,
      });
    } catch (err) {
      console.error("Failed to fetch activity counts", err);
    }
  };

  useEffect(() => {
    fetchLogs(1);
    fetchCounts();
  }, []);

  useEffect(() => {
    const handleRefresh = (event) => {
      if (event.detail?.pathname && event.detail.pathname !== location.pathname) return;
      if (location.pathname !== "/audit/activity-logs") return;

      fetchLogs(1);
      fetchCounts();
    };

    window.addEventListener("app:refresh", handleRefresh);
    return () => window.removeEventListener("app:refresh", handleRefresh);
  }, [location.pathname]);

  const barWidth = (value) => {
    if (!counts.total) return 0;
    return Math.max(4, Math.min(100, Math.round((value / counts.total) * 100)));
  };

  const parseMetadata = (metadata) => {
    if (!metadata) return null;
    if (typeof metadata === "string") {
      try {
        return JSON.parse(metadata);
      } catch (e) {
        return null;
      }
    }
    return metadata;
  };

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
        // keep original string
      }
      return trimmed;
    }
    return String(value);
  };

  const getLogUserLabel = (row) => {
    const metadata = parseMetadata(row.metadata) || {};
    if (row.user) {
      const fullName = [row.user.firstName, row.user.lastName].filter(Boolean).join(" ");
      return fullName || row.user.email || "System";
    }

    if (metadata.userName || metadata.createdUserName || metadata.updatedUserName || metadata.deletedUserName) {
      return metadata.userName || metadata.createdUserName || metadata.updatedUserName || metadata.deletedUserName;
    }
    if (metadata.userEmail || metadata.deletedUserEmail) {
      return metadata.userEmail || metadata.deletedUserEmail;
    }
    if (metadata.userId) {
      return `User #${metadata.userId}`;
    }
    return "System";
  };

  const normalizeAction = (action) =>
    (action || "").toLowerCase().replace(/[_-]/g, " ").trim();

  const getActionBadgeConfig = (action, metadata) => {
    const act = normalizeAction(action);
    const isCompliance = metadata?.entity === "compliance";

    if (act === "login") {
      return {
        label: "Login",
        icon: <LogIn className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
      };
    }
    if (act === "logout") {
      return {
        label: "Logout",
        icon: <LogOut className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
      };
    }
    if (act === "login failed" || act === "failed login") {
      return {
        label: "Login Failed",
        icon: <AlertCircle className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
      };
    }
    if (act === "create" || act === "create compliance") {
      return {
        label: isCompliance ? "Create Compliance" : "Create",
        icon: <PlusCircle className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
      };
    }
    if (act === "update" || act === "update compliance") {
      return {
        label: isCompliance ? "Update Compliance" : "Update",
        icon: <PenSquare className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
      };
    }
    if (act === "assign") {
      return {
        label: "Assign Permission",
        icon: <KeyRound className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
      };
    }
    if (act === "remove") {
      return {
        label: "Remove Permission",
        icon: <Trash2 className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
      };
    }
    if (act === "activate") {
      return {
        label: "Activate",
        icon: <Power className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
      };
    }
    if (act === "deactivate") {
      return {
        label: "Deactivate",
        icon: <UserX className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300",
      };
    }
    if (act === "delete" || act.includes("delete compliance")) {
      return {
        label: isCompliance ? "Delete Compliance" : "Delete",
        icon: <Trash2 className="h-3.5 w-3.5 text-rose-700 dark:text-rose-300" />,
        className: "inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
      };
    }
    if (act === "password reset" || act === "passwordreset" || act === "password reset completed") {
      return {
        label: "Password Reset",
        icon: <KeyRound className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
      };
    }
    if (act === "password reset requested" || act === "password resetrequest" || act === "passwordreset requested") {
      return {
        label: "Password Reset Requested",
        icon: <KeyRound className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300",
      };
    }

    return {
      label: action?.charAt(0).toUpperCase() + action?.slice(1) || "Activity",
      icon: null,
      className: "inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    };
  };

  const renderDescriptionPreview = (row) => {
    let metadata = parseMetadata(row.metadata);

    const rawDescription = row.description || metadata?.description;
    const description = rawDescription && metadata?.title
      ? rawDescription.replace(/(compliance item:\s*)\d+$/i, `$1${metadata.title}`)
      : rawDescription;

    if (description) {
      return description.length > 120 ? `${description.slice(0, 120)}…` : description;
    }

    const changes = metadata?.changes || [];
    if (changes.length > 0) {
      const preview = changes
        .slice(0, 2)
        .map((c) => `${c.field}: ${formatChangeValue(c.before)} -> ${formatChangeValue(c.after)}`)
        .join("; ");
      return preview.length > 120 ? `${preview.slice(0, 120)}…` : preview;
    }

    const entity = metadata?.entity ? `${metadata.entity} ` : "";
    return row.action ? `${row.action.charAt(0).toUpperCase() + row.action.slice(1)} ${entity}record` : "-";
  };

  return (
    <div className="rounded-lg select-none">
      <div className="mb-6 flex flex-col gap-4 sm:gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-500">Activity Logs</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white mt-1">Audit history</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review recent user actions and system events in one place.</p>
        </div>
        {canManageActivityLogs && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button onClick={() => setShowSettings(true)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
              <Settings className="w-4 h-4" /> Settings
            </button>
          </div>
        )}
      </div>

      {/* Legend counts and search/filters */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="px-5 py-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">Total Activities</div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                <Activity className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{counts.total}</div>
            <div className="mt-3 h-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div className="h-full rounded-full bg-slate-400 dark:bg-slate-500" style={{ width: `${barWidth(counts.total)}%` }} />
            </div>
          </div>

          <div className="px-5 py-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">User Logins</div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <LogIn className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{counts.logins}</div>
            <div className="mt-3 h-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 dark:bg-emerald-600" style={{ width: `${barWidth(counts.logins)}%` }} />
            </div>
          </div>

          <div className="px-5 py-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">Creates + Updates</div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-50 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400">
                <PenSquare className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-semibold text-sky-600 dark:text-sky-400">{counts.createsUpdates}</div>
            <div className="mt-3 h-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div className="h-full rounded-full bg-sky-500 dark:bg-sky-600" style={{ width: `${barWidth(counts.createsUpdates)}%` }} />
            </div>
          </div>

          <div className="px-5 py-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-300 whitespace-nowrap">Deletes</div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                <Trash2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-400">{counts.deletes}</div>
            <div className="mt-3 h-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div className="h-full rounded-full bg-rose-500 dark:bg-rose-600" style={{ width: `${barWidth(counts.deletes)}%` }} />
            </div>
          </div>
        </div>

        <div className="flex flex-row flex-wrap gap-2 items-center justify-end">
          <div className="relative" style={{minWidth: '150px'}}>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
          <div className="relative" style={{minWidth: '120px'}}>
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-9 py-2 text-xs sm:text-sm text-slate-900 dark:text-white">
              <option value="">All actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
              <option value="delete">Delete</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative" style={{minWidth: '140px'}} ref={dateFilterRef}>
            <button
              onClick={() => setShowDateFilter((v) => !v)}
              className="w-full inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              {startDate || endDate ? (
                <span>
                  {startDate || "…"} – {endDate || "…"}
                </span>
              ) : (
                <span>Date range</span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            </button>

            {showDateFilter && (
              <div className="absolute left-0 sm:right-0 sm:left-auto z-20 mt-2 w-full sm:w-72 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-lg">
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Start date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">End date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex justify-between gap-2 pt-1">
                    <button
                      onClick={() => { setStartDate(""); setEndDate(""); }}
                      className="rounded-lg px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => { setShowDateFilter(false); fetchLogs(1); fetchCounts(); }}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 dark:hover:bg-emerald-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => { fetchLogs(1); fetchCounts(); }} className="flex-shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">Apply</button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-green">
          <table className="min-w-full text-sm bg-white dark:bg-slate-900">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="px-5 py-3 text-left whitespace-nowrap">Date/Time</th>
                <th className="px-5 py-3 text-left whitespace-nowrap">User</th>
                <th className="px-5 py-3 text-left whitespace-nowrap">Action</th>
                <th className="px-5 py-3 text-left">Description</th>
                <th className="px-5 py-3 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800/40 divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-xs sm:text-sm text-slate-400 dark:text-slate-500">Loading activity logs…</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-xs sm:text-sm text-slate-400 dark:text-slate-500">No activity logs found.</td>
                </tr>
              ) : (
                rows.map((r) => {
                  const descriptionPreview = renderDescriptionPreview(r);

                  return (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-xs sm:text-sm text-slate-600 dark:text-slate-300 align-top whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-xs sm:text-sm text-slate-700 dark:text-slate-200 align-top">
                      <div>{getLogUserLabel(r)}</div>
                      <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{r.user?.email || parseMetadata(r.metadata)?.userEmail || parseMetadata(r.metadata)?.deletedUserEmail || "—"}</div>
                    </td>
                    <td className="px-5 py-3.5 align-top whitespace-nowrap">
                      {(() => {
                        const badge = getActionBadgeConfig(r.action, parseMetadata(r.metadata));
                        return (
                          <span className={badge.className}>
                            {badge.icon}
                            {badge.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 align-top">
                      <span
                        className="block max-w-[260px] truncate md:max-w-[360px] lg:max-w-[460px]"
                        title={descriptionPreview}
                      >
                        {descriptionPreview}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <button className="rounded-lg px-3 py-1 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 transition hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setSelected(r)}>
                        View
                      </button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="border-t border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-950/30">
              <tr>
                <td colSpan={5} className="px-5 py-3">
                  <div className="flex flex-row items-center justify-between gap-3">
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap\">
                      {loading ? (
                        "Loading records..."
                      ) : (
                        <span>
                          Showing {count === 0 ? 0 : (page - 1) * limit + 1}-{Math.min(page * limit, count)} of {count} records
                        </span>
                      )}
                    </div>
                    <Pagination
                      currentPage={page}
                      totalPages={Math.max(1, Math.ceil(count / limit))}
                      onPageChange={fetchLogs}
                      inFooter={true}
                    />
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {selected && (
        <ActivityLogDetailsModal log={selected} onClose={() => setSelected(null)} />
      )}
      {showSettings && (
        <ActivityLogSettingsModal 
          open={showSettings} 
          onClose={() => setShowSettings(false)}
          onRetentionApply={() => {
            fetchLogs(1);
            fetchCounts();
          }}
        />
      )}
    </div>
  );
};

export default ActivityLogsPage;