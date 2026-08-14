import React, { useEffect, useMemo, useState } from "react";
import { Download, FileText, MessageSquare, Search, CheckCircle2, Clock3, XCircle, Lock, Unlock, ChevronDown } from "lucide-react";
import api, { endpoints } from "../config/api.js";
import SweetAlert from "../components/SweetAlert.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import useComplianceNotificationStream from "../hooks/useComplianceNotificationStream.js";

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
      [1, 2, 3, 4].forEach((p) => p <= totalPages && pages.add(p));
    }
    if (showEnd) {
      [totalPages - 3, totalPages - 2, totalPages - 1, totalPages].forEach(
        (p) => p >= 1 && pages.add(p),
      );
    }
    if (!showStart && !showEnd) {
      [currentPage - 1, currentPage, currentPage + 1].forEach(
        (p) => p >= 1 && p <= totalPages && pages.add(p),
      );
    }

    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    let prev = 0;
    for (const p of sorted) {
      if (p > prev + 1) result.push("ellipsis");
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

const DocumentManagementPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Pending Review");
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [savingId, setSavingId] = useState(null);
  const [remarksDraft, setRemarksDraft] = useState({});
  const [statusDraft, setStatusDraft] = useState({});
  const [complianceStatusDraft, setComplianceStatusDraft] = useState({});
  const [closedDraft, setClosedDraft] = useState({});

  const isPrivilegedReviewer = useMemo(() => {
    const roleName = String(user?.role || "").trim().toLowerCase();
    return roleName === "admin" || roleName === "super admin" || roleName.includes("super");
  }, [user?.role]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(endpoints.compliance.list, {
        params: { includeDeleted: true },
      });
      if (data?.error) {
        throw new Error(data.message || "Failed to load documents");
      }

      const records = (data.items || []).filter((item) => Array.isArray(item.fileUrls) && item.fileUrls.length > 0);
      setItems(records);
      setRemarksDraft(
        records.reduce((acc, item) => {
          acc[item.id] = item.reviewerRemarks || "";
          return acc;
        }, {})
      );
      setStatusDraft(
        records.reduce((acc, item) => {
          acc[item.id] = item.submissionStatus || "Pending Review";
          return acc;
        }, {})
      );
      setComplianceStatusDraft(
        records.reduce((acc, item) => {
          acc[item.id] = item.status || "Not Applicable";
          return acc;
        }, {})
      );
      setClosedDraft(
        records.reduce((acc, item) => {
          acc[item.id] = Boolean(item.isSubmissionClosed);
          return acc;
        }, {})
      );
    } catch (error) {
      console.error(error);
      SweetAlert.toast.error(error.message || "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  useComplianceNotificationStream(() => {
    loadSubmissions();
  }, Boolean(user));

  const statusCounts = useMemo(() => {
    const selectedYearNumber = Number(selectedYear);

    return items.reduce(
      (acc, item) => {
        const dateValue = item?.submittedAt || item?.createdAt || item?.updatedAt;
        if (dateValue) {
          const parsedDate = new Date(dateValue);
          if (!Number.isNaN(parsedDate.getTime()) && parsedDate.getFullYear() !== selectedYearNumber) {
            return acc;
          }
        }

        const status = item.submissionStatus || "Pending Review";
        if (status === "Approved") acc.approved += 1;
        else if (status === "Rejected") acc.rejected += 1;
        else acc.pending += 1;
        return acc;
      },
      { approved: 0, pending: 0, rejected: 0 },
    );
  }, [items, selectedYear]);

  const availableYears = useMemo(() => {
    const years = new Set([String(new Date().getFullYear())]);

    items.forEach((item) => {
      const dateValue = item?.submittedAt || item?.createdAt || item?.updatedAt;
      if (!dateValue) return;

      const parsedDate = new Date(dateValue);
      if (!Number.isNaN(parsedDate.getTime())) {
        years.add(String(parsedDate.getFullYear()));
      }
    });

    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const status = item.submissionStatus || "Pending Review";
      if (filter !== "All" && status !== filter) return false;

      const dateValue = item?.submittedAt || item?.createdAt || item?.updatedAt;
      if (dateValue) {
        const parsedDate = new Date(dateValue);
        if (!Number.isNaN(parsedDate.getTime()) && parsedDate.getFullYear() !== Number(selectedYear)) {
          return false;
        }
      }

      if (!query) return true;

      const pool = [
        item.title,
        item.complianceType,
        item.submitter?.firstName,
        item.submitter?.lastName,
        item.submitter?.username,
        item.submitter?.email,
        ...(item.originalFilenames || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return pool.includes(query);
    });
  }, [filter, items, search, selectedYear]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [search, filter, selectedYear]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleDownload = (itemId, index, originalFilename) => {
    const url = `${api.defaults.baseURL}${endpoints.compliance.download(itemId)}?index=${index}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = originalFilename || `submission-${itemId}-${index + 1}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveReview = async (item) => {
    if (!isPrivilegedReviewer) {
      SweetAlert.toast.error("Only Admin or Super Admin can review submissions.");
      return;
    }

    try {
      setSavingId(item.id);
      const payload = {
        submissionStatus: statusDraft[item.id] || "Pending Review",
        status: complianceStatusDraft[item.id] || item.status || "Not Applicable",
        isSubmissionClosed: Boolean(closedDraft[item.id]),
        reviewerRemarks: remarksDraft[item.id] || "",
      };
      const { data } = await api.put(endpoints.compliance.update(item.id), payload);
      if (data?.error) {
        throw new Error(data.message || "Failed to save review");
      }

      SweetAlert.toast.success("Submission review updated.");
      await loadSubmissions();
    } catch (error) {
      console.error(error);
      SweetAlert.toast.error(error.message || "Failed to save review.");
    } finally {
      setSavingId(null);
    }
  };

  const badgeClass = (status) => {
    if (status === "Approved") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "Rejected") return "bg-rose-100 text-rose-700 border-rose-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600">Documents</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100">Compliance Submissions</h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Review uploaded files, set approval decision, update compliance status, and provide remarks.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="px-4 sm:px-5 py-3 sm:py-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Approved
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {statusCounts.approved}
          </div>
        </div>
        <div className="px-4 sm:px-5 py-3 sm:py-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Pending Review
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Clock3 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-semibold text-amber-600 dark:text-amber-400">
            {statusCounts.pending}
          </div>
        </div>
        <div className="px-4 sm:px-5 py-3 sm:py-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Rejected
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
              <XCircle className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-semibold text-rose-600 dark:text-rose-400">
            {statusCounts.rejected}
          </div>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, path, submitter, or filename"
            className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 py-2 text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="relative">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-10 sm:pr-11 text-xs sm:text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="Pending Review">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="All">All</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="relative">
          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-10 sm:pr-11 text-xs sm:text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          Loading submissions...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          No compliance su bmissions found.
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedItems.map((item) => {
            const submissionStatus = item.submissionStatus || "Pending Review";
            const submissionFiles = item.fileUrls || [];
            const fileNames = item.originalFilenames || [];
            const isClosed = Boolean(closedDraft[item.id]);

            return (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{item.title}</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.complianceType || "No path"}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Submitted by {item.submitter ? `${item.submitter.firstName || ""} ${item.submitter.lastName || ""}`.trim() || item.submitter.username || item.submitter.email : "Unknown user"}
                      {item.submittedAt ? ` on ${new Date(item.submittedAt).toLocaleString()}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
                    <div className="flex flex-col items-start sm:items-center gap-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Approval</p>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(submissionStatus)}`}>
                        {submissionStatus}
                      </span>
                    </div>
                    <div className="flex flex-col items-start sm:items-center gap-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Access</p>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          isClosed
                            ? "border-rose-200 bg-rose-100 text-rose-700"
                            : "border-emerald-200 bg-emerald-100 text-emerald-700"
                        }`}
                        title={isClosed ? "Submission closed" : "Submission open"}
                      >
                        {isClosed ? <Lock size={12} /> : <Unlock size={12} />}
                        {isClosed ? "Closed" : "Open"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      Submitted Files
                    </p>
                    <div className="space-y-2">
                      {submissionFiles.map((_, index) => (
                        <button
                          key={`file-${item.id}-${index}`}
                          type="button"
                          onClick={() => handleDownload(item.id, index, fileNames[index])}
                          className="flex w-full items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-left text-sm transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <FileText size={16} className="shrink-0 text-slate-500" />
                            <span className="truncate">{fileNames[index] || `File ${index + 1}`}</span>
                          </span>
                          <Download size={16} className="text-slate-500" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      Review
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Submission Access</label>
                        <div className="relative">
                          <select
                            value={closedDraft[item.id] ? "closed" : "open"}
                            onChange={(event) =>
                              setClosedDraft((prev) => ({ ...prev, [item.id]: event.target.value === "closed" }))
                            }
                            disabled={!isPrivilegedReviewer || savingId === item.id}
                            className="w-full appearance-none rounded-md border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm dark:border-slate-700 dark:bg-slate-900"
                          >
                            <option value="open">Open Submission</option>
                            <option value="closed">Close Submission</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Approval</label>
                        <div className="relative">
                          <select
                            value={statusDraft[item.id] || "Pending Review"}
                            onChange={(event) =>
                              setStatusDraft((prev) => ({ ...prev, [item.id]: event.target.value }))
                            }
                            disabled={!isPrivilegedReviewer || savingId === item.id}
                            className="w-full appearance-none rounded-md border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm dark:border-slate-700 dark:bg-slate-900"
                          >
                            <option value="Pending Review">Pending Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Compliance Status</label>
                        <div className="relative">
                          <select
                            value={complianceStatusDraft[item.id] || item.status || "Not Applicable"}
                            onChange={(event) =>
                              setComplianceStatusDraft((prev) => ({ ...prev, [item.id]: event.target.value }))
                            }
                            disabled={!isPrivilegedReviewer || savingId === item.id}
                            className="w-full appearance-none rounded-md border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm dark:border-slate-700 dark:bg-slate-900"
                          >
                            <option value="Compliant">Compliant</option>
                            <option value="Under Evaluation">Under Evaluation</option>
                            <option value="No Submission">No Submission</option>
                            <option value="Non-Compliant">Non-Compliant</option>
                            <option value="Not Applicable">Not Applicable</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Remarks</label>
                        <textarea
                          rows={3}
                          value={remarksDraft[item.id] || ""}
                          onChange={(event) =>
                            setRemarksDraft((prev) => ({ ...prev, [item.id]: event.target.value }))
                          }
                          disabled={!isPrivilegedReviewer || savingId === item.id}
                          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                          placeholder="Add reviewer remarks..."
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setStatusDraft((prev) => ({
                              ...prev,
                              [item.id]: "Rejected",
                            }))
                          }
                          disabled={!isPrivilegedReviewer || savingId === item.id}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs sm:text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                        >
                          <XCircle size={15} /> Mark Rejected
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setStatusDraft((prev) => ({
                              ...prev,
                              [item.id]: "Approved",
                            }))
                          }
                          disabled={!isPrivilegedReviewer || savingId === item.id}
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                        >
                          <CheckCircle2 size={15} /> Mark Approved
                        </button>
                        <button
                          type="button"
                          onClick={() => saveReview(item)}
                          disabled={!isPrivilegedReviewer || savingId === item.id}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                        >
                          <MessageSquare size={15} /> {savingId === item.id ? "Saving..." : "Save Review"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredItems.length > 0 && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50/80 px-5 py-3 dark:border-slate-700 dark:bg-slate-950/30">
          <div className="flex flex-row items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
              Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredItems.length)} of {filteredItems.length} submissions
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              inFooter={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagementPage;