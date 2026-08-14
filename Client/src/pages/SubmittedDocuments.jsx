import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  FileText,
  Search,
  ChevronDown,
  CheckCircle2,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import api, { endpoints } from "../config/api.js";
import SweetAlert from "../components/SweetAlert.jsx";
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

const SubmittedDocuments = () => {
  const fileInputRef = useRef(null);
  const [uploadingItemId, setUploadingItemId] = useState(null);
  const [revisionTarget, setRevisionTarget] = useState(null);
  const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_UPLOAD_EXTENSIONS = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
    ".csv",
  ];
  const ACCEPT_UPLOAD_TYPES = ALLOWED_UPLOAD_EXTENSIONS.join(",");

  const hasAllowedUploadExtension = (filename) => {
    const lowerName = String(filename || "").toLowerCase();
    return ALLOWED_UPLOAD_EXTENSIONS.some((extension) =>
      lowerName.endsWith(extension),
    );
  };

  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

  const currentUserId = Number(user?.id || 0);

  const loadItems = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(endpoints.compliance.list, {
        params: { includeDeleted: true },
      });
      if (data?.error) {
        throw new Error(data.message || "Failed to load submitted documents");
      }

      const allItems = Array.isArray(data.items) ? data.items : [];
      const submittedItems = allItems.filter((item) => {
        if (!Array.isArray(item.fileUrls) || item.fileUrls.length === 0)
          return false;
        return Number(item.submittedBy) === currentUserId;
      });

      setItems(submittedItems);
    } catch (error) {
      console.error(error);
      SweetAlert.toast.error(
        error.message || "Failed to load submitted documents.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const normalizeReviewStatus = (item) => {
    const status = String(item?.submissionStatus || "Pending Review");
    if (status === "Approved") return "Approved";
    if (status === "Rejected") return "Needs Revision";
    return "Pending Review";
  };

  const getReviewStatus = (item) => {
    const status = normalizeReviewStatus(item);
    if (status === "Approved") {
      return {
        label: "Approved",
        classes: "border-emerald-200 bg-emerald-100 text-emerald-700",
      };
    }
    if (status === "Needs Revision") {
      return {
        label: "Needs Revision",
        classes: "border-rose-200 bg-rose-100 text-rose-700",
      };
    }
    return {
      label: "Pending Review",
      classes: "border-amber-200 bg-amber-100 text-amber-700",
    };
  };

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

        const status = String(item?.submissionStatus || "Pending Review");
        if (status === "Approved") acc.approved += 1;
        else if (status === "Rejected") acc.revision += 1;
        else acc.pending += 1;
        return acc;
      },
      { approved: 0, pending: 0, revision: 0 },
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
      const reviewStatus = normalizeReviewStatus(item);
      if (filter !== "All" && reviewStatus !== filter) return false;

      const dateValue = item?.submittedAt || item?.createdAt || item?.updatedAt;
      if (dateValue) {
        const parsedDate = new Date(dateValue);
        if (!Number.isNaN(parsedDate.getTime()) && parsedDate.getFullYear() !== Number(selectedYear)) {
          return false;
        }
      }

      if (!query) return true;
      const searchable = [
        item.title,
        item.complianceType,
        item.reviewerRemarks,
        ...(item.originalFilenames || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
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

  const handleRevisionUpload = (item) => {
    if (!item?.id) return;
    setRevisionTarget(item);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!revisionTarget || !files.length) return;

    const invalidFile = files.find(
      (file) => !hasAllowedUploadExtension(file.name),
    );
    if (invalidFile) {
      SweetAlert.toast.error(
        `Invalid file type: ${invalidFile.name}. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV.`,
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const oversizedFile = files.find(
      (file) => file.size > MAX_UPLOAD_FILE_SIZE,
    );
    if (oversizedFile) {
      SweetAlert.toast.error(
        `File too large: ${oversizedFile.name}. Maximum allowed size is 5MB.`,
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setUploadingItemId(revisionTarget.id);

    try {
      const payload = new FormData();
      files.forEach((file) => payload.append("files", file));

      const { data } = await api.put(
        endpoints.compliance.update(revisionTarget.id),
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (data?.error) {
        throw new Error(data.message || "Failed to upload revision files.");
      }

      SweetAlert.toast.success("Revision files uploaded successfully.");
      await loadItems();
    } catch (error) {
      console.error(error);
      SweetAlert.toast.error(
        error.message || "Failed to upload revision files.",
      );
    } finally {
      setUploadingItemId(null);
      setRevisionTarget(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600">
          Documents
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100">
          Submitted Documents
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Track your submitted files, review decisions, and revision remarks
          from reviewers.
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
              Needs Revision
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-semibold text-rose-600 dark:text-rose-400">
            {statusCounts.revision}
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
            placeholder="Search by title, path, filename, or remarks"
            className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-9 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="All">All</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Needs Revision">Needs Revision</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-9 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

     

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          Loading submitted documents...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
          No submitted documents found.
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedItems.map((item) => {
            const reviewStatus = getReviewStatus(item);
            const files = item.fileUrls || [];
            const fileNames = item.originalFilenames || [];
            const remarks = String(item.reviewerRemarks || "").trim();

            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {item.submittedAt
                        ? `Submitted on ${new Date(item.submittedAt).toLocaleString()}`
                        : "Submitted"}
                      {item.reviewedAt
                        ? ` • Reviewed on ${new Date(item.reviewedAt).toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-start sm:items-center gap-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</p>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${reviewStatus.classes}`}
                    >
                      {reviewStatus.label === "Needs Revision"
                        ? `Needs Revision • 1`
                        : reviewStatus.label}
                    </span>
                  </div>
                </div>

                {remarks ? (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Reviewer Remarks
                    </p>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                      {remarks}
                    </p>
                  </div>
                ) : null}

                {reviewStatus.label === "Needs Revision" ? (
                  <div className="mt-3 flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-700 dark:bg-rose-950/20">
                    <p className="text-sm font-semibold text-rose-700 dark:text-rose-200">
                      Revision requested. Upload corrected files to resubmit.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRevisionUpload(item)}
                      disabled={uploadingItemId === item.id}
                      className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {uploadingItemId === item.id
                        ? "Uploading..."
                        : "Upload Revised Documents"}
                    </button>
                  </div>
                ) : null}

                <div className="mt-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Submitted Files
                  </p>
                  <div className="space-y-2">
                    {files.map((_, index) => (
                      <button
                        key={`file-${item.id}-${index}`}
                        type="button"
                        onClick={() =>
                          handleDownload(item.id, index, fileNames[index])
                        }
                        className="flex w-full items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-left text-sm transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <FileText
                            size={16}
                            className="shrink-0 text-slate-500"
                          />
                          <span className="truncate">
                            {fileNames[index] || `File ${index + 1}`}
                          </span>
                        </span>
                        <Download size={16} className="text-slate-500" />
                      </button>
                    ))}
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
              Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredItems.length)} of {filteredItems.length} documents
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

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPT_UPLOAD_TYPES}
        onChange={handleFileSelected}
        className="hidden"
      />
    </div>
  );
};

export default SubmittedDocuments;
