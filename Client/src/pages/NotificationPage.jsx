import React, { useEffect, useState, useRef } from "react";
import { Mail, ClipboardList, BellOff, ChevronLeft, ChevronRight, EllipsisVertical, Eye, Trash2, Search } from "lucide-react";
import api, { endpoints } from "../config/api";
import EventDetailsModal from "../components/EventDetailsModal";
import { useNavigate } from "react-router-dom";
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
    <div className="flex flex-row flex-nowrap items-center justify-end gap-1 sm:gap-2 text-[11px] sm:text-xs lg:text-sm">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-200"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1 overflow-hidden">
        {pageNumbers.map((p, idx) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-gray-500 dark:text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[28px] h-7 rounded-md px-1.5 text-[11px] font-medium transition sm:text-xs ${
                p === currentPage
                  ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
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
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-200"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="ml-1 flex shrink-0 items-center gap-1.5 border-l border-gray-200 pl-2 dark:border-slate-700">
        <span className="whitespace-nowrap text-[11px] text-gray-500 dark:text-slate-400 sm:text-xs">
          {window.innerWidth < 640 ? "Page" : "Go to page"}
        </span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={goToPageInput}
          onChange={(e) => setGoToPageInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
          placeholder=""
          className="w-11 rounded-md border border-gray-300 bg-white px-1.5 py-1 text-center text-[11px] text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:text-xs"
        />
        <button
          onClick={handleGoToPage}
          className="shrink-0 rounded-md bg-gray-200 px-2 py-1 text-[11px] font-medium text-gray-700 transition hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 sm:text-xs"
        >
          Go
        </button>
      </div>
    </div>
  );
};

const NotificationPage = ({ compact = true }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [viewFilter, setViewFilter] = useState("all");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const currentUserId = Number(user?.id || 0);
  const PAGE_SIZE = 10;
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignedDropdownOpen, setAssignedDropdownOpen] = useState(false);
  const assignedDetailsRef = useRef(null);

  const toggleMenu = (id, e) => {
    if (menuOpen && openMenuId === id) {
      setMenuOpen(false);
      setOpenMenuId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.top,
      right: window.innerWidth - rect.left + 8,
    });
    setOpenMenuId(id);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setOpenMenuId(null);
  };

  // Fixed-position menu can't track its anchor button while the page moves,
  // so just close it as soon as any scrolling happens (capture=true also
  // catches scroll on inner scrollable containers, e.g. the table wrapper).
  useEffect(() => {
    if (!menuOpen) return;
    const handleScroll = () => closeMenu();
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [menuOpen]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatRelativeDue = (endDate) => {
    const due = new Date(endDate);
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const dueMid = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const nowMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((dueMid - nowMid) / msPerDay);

    if (diffDays < 0) {
      const overdueBy = Math.abs(diffDays);
      return `Overdue by ${overdueBy} day${overdueBy === 1 ? "" : "s"}`;
    }
    if (diffDays === 0) return "Due Today";
    if (diffDays === 1) return "Due Tomorrow";
    return `Due in ${diffDays} Days`;
  };

  const getStatusPillClass = (endDate) => {
    const due = new Date(endDate);
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const dueMid = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const nowMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((dueMid - nowMid) / msPerDay);

    if (diffDays < 0) {
      return "bg-red-100 text-red-700 dark:bg-red-600 dark:text-white";
    }
    if (diffDays === 0) {
      return "bg-red-100 text-red-700 dark:bg-red-600 dark:text-white";
    }
    if (diffDays === 1) {
      return "bg-orange-100 text-orange-700 dark:bg-orange-600 dark:text-white";
    }
    return "bg-amber-100 text-amber-700 dark:bg-amber-600 dark:text-white";
  };

  const getUserFullName = (person) => {
    if (!person) return "User";
    const fullName = [person.firstName, person.middleName, person.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return fullName || person.username || person.email || "User";
  };

  const getCreatorLabel = (event) => {
    if (!event) return "User";
    if (event.creator && typeof event.creator === "object") return getUserFullName(event.creator);
    if (event.createdBy && typeof event.createdBy === "object") return getUserFullName(event.createdBy);
    if (event.createdByName) return event.createdByName;
    if (event.createdByUsername) return event.createdByUsername;
    return "User";
  };

  const getAssignmentPreview = (event) => {
    if (!event) return "-";
    if (event.assignmentPreview) return event.assignmentPreview;
    if (event.assignedToLabel) return event.assignedToLabel;
    return "Not assigned";
  };

  const getAssignedItems = (event) => {
    // Return groups expected by EventDetailsModal. Minimal: no groups.
    return [];
  };

  const canModify = () => false;
  const onEdit = () => {};
  const onDelete = () => {};

  const getUrgency = (endDate) => {
    const due = new Date(endDate);
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const dueMid = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const nowMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((dueMid - nowMid) / msPerDay);

    if (diffDays < 0) return "overdue";
    if (diffDays === 0) return "today";
    if (diffDays <= 3) return "soon";
    return "upcoming";
  };

  const getNotificationMeta = (item) => {
    const status = String(item?.submissionStatus || "").trim();
    const isCreatorAlert =
      currentUserId > 0 &&
      Number(item?.createdBy) === currentUserId &&
      status === "Pending Review" &&
      Array.isArray(item?.fileUrls) &&
      item.fileUrls.length > 0;

    if (isCreatorAlert) {
      return {
        type: "Submission",
        subtitle: `${getUserFullName(item?.submitter)} submitted document(s)`,
        statusLabel: "Pending Review",
        statusClass: "bg-sky-100 text-sky-700 dark:bg-sky-700 dark:text-white",
        route: "/documentmanagement",
        eventDate: item?.submittedAt || item?.updatedAt || item?.createdAt,
      };
    }

    const isSubmitterDecisionAlert =
      currentUserId > 0 &&
      Number(item?.submittedBy) === currentUserId &&
      (status === "Approved" || status === "Rejected");

    if (isSubmitterDecisionAlert) {
      const isApproved = status === "Approved";
      return {
        type: "Review update",
        subtitle: isApproved ? "Submission approved" : "Submission rejected",
        statusLabel: status,
        statusClass: isApproved
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-700 dark:text-white"
          : "bg-rose-100 text-rose-700 dark:bg-rose-700 dark:text-white",
        route: "/submitted-documents",
        eventDate: item?.reviewedAt || item?.updatedAt || item?.createdAt,
      };
    }

    const urgency = getUrgency(item?.endDate);
    return {
      type: "Deadline",
      subtitle: formatRelativeDue(item?.endDate),
      statusLabel: formatRelativeDue(item?.endDate),
      statusClass: getStatusPillClass(item?.endDate),
      route: "/calendar",
      eventDate: item?.endDate,
      urgency,
    };
  };

  const getNotificationState = (item) => {
    if (item?.notificationDeleted) return "deleted";
    if (item?.read) return "read";
    return "unread";
  };

  const getRowClasses = (item) => {
    const state = getNotificationState(item);

    if (state === "deleted") {
      return "bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 border-l-4 border-rose-400";
    }

    if (state === "read") {
      return "bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 border-l-4 border-slate-300 dark:border-slate-700";
    }

    return "bg-white dark:bg-slate-800/40 text-slate-800 dark:text-slate-100 border-l-4 border-emerald-500";
  };

  const activeItems = items.filter((it) => !it.notificationDeleted);
  const deletedItems = items.filter((it) => it.notificationDeleted);
  const filterOptions = [
    { value: "all", label: "All", count: items.length },
    { value: "unread", label: "Unread", count: activeItems.filter((item) => getNotificationState(item) === "unread").length },
    { value: "read", label: "Read", count: activeItems.filter((item) => getNotificationState(item) === "read").length },
    { value: "deleted", label: "Deleted", count: deletedItems.length },
  ];

  const visibleItems = viewFilter === "deleted"
    ? deletedItems
    : activeItems.filter((item) => {
    if (viewFilter === "all") return true;
    return getNotificationState(item) === viewFilter;
  });

  const searchedItems = visibleItems.filter((item) => {
    if (!searchQuery || !searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const title = String(item.title || "").toLowerCase();
    const subtitle = String(getNotificationMeta(item).subtitle || "").toLowerCase();
    return title.includes(q) || subtitle.includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(searchedItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = searchedItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [viewFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const activeFilterLabel = filterOptions.find((option) => option.value === viewFilter)?.label || "Notifications";

  const fetchItems = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const resp = await api.get(endpoints.compliance.list, {
        params: { from: today.toISOString(), includeDeleted: true },
      });
      const loadedItems = resp?.data?.items || [];
      setItems(loadedItems);
      setUnreadCount(loadedItems.filter((item) => item.read !== true).length);
    } catch (err) {
      setItems([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenNotification = async (item, meta) => {
    closeMenu();
    try {
      await api.patch(endpoints.compliance.markRead(item.id));
    } catch (err) {
      // Best effort only.
    }

    // If this notification points to the calendar but the underlying
    // compliance item is soft-deleted or the notification was user-deleted,
    // show an inline details modal instead of navigating away. The server
    // now stores a snapshot per-notification so `item` contains preserved
    // fields for display.
    if (meta.route === "/calendar" && (item?.isDeleted || item?.notificationDeleted)) {
      setDetailModalItem(item);
      return;
    }

    if (meta.route === "/calendar") {
      navigate(meta.route, {
        state: { openDetailsForComplianceId: item.id },
      });
      return;
    }

    navigate(meta.route);
  };

  const handleDeleteNotification = async (item) => {
    closeMenu();
    try {
      await api.delete(endpoints.compliance.deleteNotification(item.id));
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, notificationDeleted: true, read: true } : it,
        ),
      );
    } catch (err) {
      // Best effort only.
    }
  };

  return (
    <div className={compact ? "w-full" : "p-8"}>
      <div className=" overflow-hidden">
        <div className="">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.35em] text-emerald-500">Notifications</p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-700 dark:text-white mt-1">All Notifications</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                A summary of upcoming deadlines and unread alerts for your compliance items.
              </p>
            </div>
          </div>

          {/* Legend Counts */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="px-5 py-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Total
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <ClipboardList className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {items.length}
          </div>
        </div>

        <div className="px-5 py-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Unread
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <Mail className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-blue-600 dark:text-blue-400">
            {unreadCount}
          </div>
        </div>
      </div>

          

  <div className="mt-6 flex flex-col gap-4 rounded-md border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-3 shadow-sm backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
  <div className="space-y-1">
    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notification filters</div>
    <div className="text-xs text-slate-500 dark:text-slate-400">Refine alerts, unread items, and deleted messages.</div>
  </div>

  <div className="flex flex-col items-stretch gap-3 sm:items-end lg:w-auto lg:flex-row lg:items-center lg:justify-end">
    <div className="flex flex-wrap justify-start gap-2 sm:justify-end">
      {filterOptions.map((option) => {
        const active = viewFilter === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setViewFilter(option.value)}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
              active
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <span className="truncate">{option.label}</span>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] sm:text-xs ${active ? "bg-white/20 text-white" : "bg-white text-slate-500 dark:bg-slate-700 dark:text-slate-200"}`}>
              {option.count}
            </span>
          </button>
        );
      })}
    </div>

    <div className="w-full sm:w-56 lg:w-64">
      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          placeholder="Search notifications..."
          className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>
    </div>
  </div>
</div>

          <div className="mt-6">
            {/* Loading */}
            {loading && (
              <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                <div className="animate-spin rounded-full h-6 w-6 border-4 border-emerald-500 border-t-transparent mx-auto mb-3" />
                Loading notifications...
              </div>
            )}

            {/* Table */}
            {!loading && (
              <>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto scrollbar-green">
                    <table className="min-w-[920px] w-full text-sm bg-white dark:bg-slate-900">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                          <th className="px-5 py-3 text-left whitespace-nowrap min-w-[220px]">Notification</th>
                          <th className="px-5 py-3 text-left whitespace-nowrap min-w-[180px]">Date</th>
                          <th className="px-5 py-3 text-left whitespace-nowrap">Type</th>
                          <th className="px-5 py-3 text-left whitespace-nowrap">Status</th>
                          <th className="px-5 py-3 text-center whitespace-nowrap">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800/40 divide-y divide-slate-200 dark:divide-slate-700">
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-12 text-slate-400 dark:text-slate-500">
                              No notifications found.
                            </td>
                          </tr>
                        ) : visibleItems.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-12 text-slate-400 dark:text-slate-500">
                              <div className="flex flex-col items-center gap-2">
                                <BellOff className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                                <span>No notifications match this filter.</span>
                                <div className="text-xs text-slate-400 dark:text-slate-500">
                                  Try switching from {activeFilterLabel.toLowerCase()} to another view.
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedItems.map((it) => {
                            const meta = getNotificationMeta(it);
                            const state = getNotificationState(it);
                            return (
                              <tr
                                key={it.id}
                                className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${getRowClasses(it)}`}
                              >
                                <td className="px-4 py-3.5 align-top">
                                  <div className="min-w-0 max-w-[320px]">
                                    <div
                                      className={`truncate font-medium ${state === "deleted" ? "line-through decoration-rose-400 decoration-2" : ""}`}
                                    >
                                      {it.title || "Untitled notification"}
                                    </div>
                                    <div className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                                      {meta.subtitle}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                                  <span className="block max-w-[180px] truncate">{formatDateTime(meta.eventDate)}</span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="inline-flex max-w-[120px] truncate rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                                    {meta.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className={`inline-flex max-w-[160px] truncate rounded-md px-2.5 py-1 text-[11px] font-medium ${meta.statusClass}`}>
                                    {state === "deleted" ? "Deleted" : meta.statusLabel}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={(e) => toggleMenu(it.id, e)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700"
                                    aria-label="Open actions"
                                  >
                                    <EllipsisVertical size={15} className="pointer-events-none" />
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
                            <div className="flex flex-row flex-nowrap items-center justify-between gap-3 overflow-x-auto">
                              <div className="min-w-0 shrink text-sm text-slate-600 dark:text-slate-300">
                                {visibleItems.length === 0 ? (
                                  <span className="whitespace-nowrap">Showing 0 of 0 notifications</span>
                                ) : (
                                  <span className="whitespace-nowrap">
                                    Showing {(currentPage - 1) * PAGE_SIZE + 1}-
                                    {Math.min(currentPage * PAGE_SIZE, visibleItems.length)} of {visibleItems.length} notifications
                                  </span>
                                )}
                              </div>
                              <div className="ml-auto shrink-0">
                                <Pagination
                                  currentPage={currentPage}
                                  totalPages={totalPages}
                                  onPageChange={setPage}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fixed dropdown */}
      {menuOpen && (() => {
        const activeItem = items.find((it) => it.id === openMenuId);
        if (!activeItem) return null;
        const activeMeta = getNotificationMeta(activeItem);
        const activeState = getNotificationState(activeItem);

        return (
          <>
            <div className="fixed inset-0 z-40" onClick={closeMenu} />
            <div
              className="fixed z-50 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1"
              style={{ top: menuPos.top, right: menuPos.right }}
            >
              <button
                onClick={() => handleOpenNotification(activeItem, activeMeta)}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
              >
                <Eye size={15} /> View Notification
              </button>
              {activeState !== "deleted" && (
                <button
                  onClick={() => handleDeleteNotification(activeItem)}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                >
                  <Trash2 size={15} /> Delete Notification
                </button>
              )}
            </div>
          </>
        );
      })()}
      {detailModalItem && (
        <EventDetailsModal
          event={(() => {
            try {
              const parsed = typeof detailModalItem.snapshot === "string" && detailModalItem.snapshot ? JSON.parse(detailModalItem.snapshot) : detailModalItem.snapshot || {};
              return { ...parsed, ...detailModalItem };
            } catch (e) {
              return detailModalItem;
            }
          })()}
          isOpen={true}
          onClose={() => setDetailModalItem(null)}
          canModify={canModify}
          onEdit={() => onEdit(detailModalItem)}
          onDelete={() => onDelete(detailModalItem)}
          getCreatorLabel={getCreatorLabel}
          getAssignmentPreview={getAssignmentPreview}
          getAssignedItems={getAssignedItems}
          assignedDropdownOpen={assignedDropdownOpen}
          setAssignedDropdownOpen={setAssignedDropdownOpen}
          assignedDetailsRef={assignedDetailsRef}
          complianceTypeLabel={detailModalItem.complianceType || detailModalItem.type || 'Not set'}
          submissionForLabel={detailModalItem.submissionFor || 'Not set'}
          specificSubmissionLabel={detailModalItem.specificSubmission || 'Not set'}
        />
      )}
    </div>
  );
};

export default NotificationPage;