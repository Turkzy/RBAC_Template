import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { LogIn, LogOut, Settings, Calendar, ChevronDown, ChevronLeft, ChevronRight, KeyRound, Activity, PenSquare, Trash2, Search, Power, UserX, PlusCircle, AlertCircle } from "lucide-react";
import api, { endpoints } from "../config/api.js";
import ActivityLogDetailsModal from "../components/ActivityLogDetailsModal.jsx";
import ActivityLogSettingsModal from "../components/ActivityLogSettingsModal.jsx";
import { PERMISSIONS } from "../utils/permissions.js";
import { useAuth } from "../context/AuthContext.jsx";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
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
    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center sm:justify-end gap-2 sm:gap-3 mt-3 sm:mt-4 font-montserrat text-xs sm:text-sm">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((p, idx) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] h-8 px-2 rounded-md text-sm font-medium transition ${
                p === currentPage
                  ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600"
                  : "text-gray-600 hover:bg-gray-100"
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
        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
        <span className="text-sm text-gray-500">Go to page</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={goToPageInput}
          onChange={(e) => setGoToPageInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
          placeholder=""
          className="w-14 px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
        />
        <button
          onClick={handleGoToPage}
          className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
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
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
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

  const renderDescriptionPreview = (row) => {
    let metadata = row.metadata;
    if (typeof metadata === "string") {
      try {
        metadata = JSON.parse(metadata);
      } catch (e) {
        metadata = null;
      }
    }

    const description = row.description || metadata?.description;
    if (description) {
      return description.length > 120 ? `${description.slice(0, 120)}…` : description;
    }

    const changes = metadata?.changes || [];
    if (changes.length > 0) {
      const preview = changes
        .slice(0, 2)
        .map((c) => `${c.field}: ${c.before ?? "-"} -> ${c.after ?? "-"}`)
        .join("; ");
      return preview.length > 120 ? `${preview.slice(0, 120)}…` : preview;
    }

    const entity = metadata?.entity ? `${metadata.entity} ` : "";
    return row.action ? `${row.action.charAt(0).toUpperCase() + row.action.slice(1)} ${entity}record` : "-";
  };

  return (
    <div className="rounded-lg p-6 select-none">
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
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">Deletes</div>
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

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-center sm:justify-end">
          <div className="relative w-full sm:w-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" />
          </div>
          <div className="relative w-full sm:w-auto">
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-9 py-2 text-sm text-slate-900 dark:text-white">
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

          <div className="relative w-full sm:w-auto" ref={dateFilterRef}>
            <button
              onClick={() => setShowDateFilter((v) => !v)}
              className="w-full inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
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

          <button onClick={() => { fetchLogs(1); fetchCounts(); }} className="w-full sm:w-auto rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">Apply</button>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-green">
        <table className="min-w-full text-sm bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="px-5 py-3 text-left">Date/Time</th>
              <th className="px-5 py-3 text-left">User</th>
              <th className="px-5 py-3 text-left">Action</th>
              <th className="px-5 py-3 text-left">Description</th>
              <th className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400 dark:text-slate-500">Loading activity logs…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400 dark:text-slate-500">No activity logs found.</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-600 dark:text-slate-300 align-top whitespace-normal break-words sm:whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-200 align-top whitespace-normal break-words">
                    <div className="break-words">{r.user ? `${r.user.firstName} ${r.user.lastName}` : "System"}</div>
                    <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 break-words">{r.user?.email || "—"}</div>
                  </td>
                  <td className="px-5 py-3.5 align-top whitespace-normal break-words sm:whitespace-nowrap">
                    {(() => {
                      const act = (r.action || "").toLowerCase();
                      if (act === "login") {
                        return (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                            <LogIn className="h-3.5 w-3.5" />
                            Login
                          </span>
                        );
                      }
                      if (act === "logout") {
                        return (
                          <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                            <LogOut className="h-3.5 w-3.5" />
                            Logout
                          </span>
                        );
                      }
                      if (act === "login_failed" || act === "login-failed" || act === "failed_login") {
                        return (
                          <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Login Failed
                          </span>
                        );
                      }
                      if (act === "create") {
                        return (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                            <PlusCircle className="h-3.5 w-3.5" />
                            Create
                          </span>
                        );
                      }
                      if (act === "update") {
                        return (
                          <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                            <PenSquare className="h-3.5 w-3.5" />
                            Update
                          </span>
                        );
                      }
                      if (act === "assign") {
                        return (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                            <KeyRound className="h-3.5 w-3.5" />
                            Assign Permission
                          </span>
                        );
                      }
                      if (act === "remove") {
                        return (
                          <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove Permission
                          </span>
                        );
                      }
                      if (act === "activate") {
                        return (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                            <Power className="h-3.5 w-3.5" />
                            Activate
                          </span>
                        );
                      }
                      if (act === "deactivate") {
                        return (
                          <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300">
                            <UserX className="h-3.5 w-3.5" />
                            Deactivate
                          </span>
                        );
                      }
                      if (act === "delete") {
                        return (
                          <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </span>
                        );
                      }

                      // Password reset actions
                      if (act === "password_reset" || act === "passwordreset" || act === "password_reset_completed") {
                        return (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                            <KeyRound className="h-3.5 w-3.5" />
                            Password Reset
                          </span>
                        );
                      }
                      if (act === "password_reset_requested" || act === "password_resetrequest" || act === "passwordreset_requested") {
                        return (
                          <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300">
                            <KeyRound className="h-3.5 w-3.5" />
                            Password Reset Requested
                          </span>
                        );
                      }

                      return (
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {r.action?.charAt(0).toUpperCase() + r.action?.slice(1)}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 align-top whitespace-normal break-words">{renderDescriptionPreview(r)}</td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <button className="rounded-lg px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 transition hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setSelected(r)}>
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={Math.max(1, Math.ceil(count / limit))}
        onPageChange={fetchLogs}
      />

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