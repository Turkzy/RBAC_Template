import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Eye, Download, ChevronDown } from "lucide-react";

const EventDetailsModal = ({
  event,
  isOpen,
  onClose,
  canModify,
  onEdit,
  onDelete,
  getCreatorLabel,
  getAssignmentPreview,
  getAssignedItems,
  assignedDropdownOpen,
  setAssignedDropdownOpen,
  assignedDetailsRef,
  complianceTypeLabel = "Not set",
  submissionForLabel = "Not set",
  specificSubmissionLabel = "Not set",
}) => {
  const assignedTriggerRef = useRef(null);
  const [assignedOverlayStyle, setAssignedOverlayStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
    maxHeight: 288,
  });

  const positionAssignedOverlay = () => {
    const trigger = assignedTriggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const sideMargin = 12;
    const gap = 8;
    const preferredMaxHeight = 288;

    const width = Math.min(rect.width, viewportWidth - sideMargin * 2);
    const left = Math.min(
      Math.max(rect.left, sideMargin),
      viewportWidth - width - sideMargin,
    );

    const spaceBelow = viewportHeight - rect.bottom - sideMargin;
    const spaceAbove = rect.top - sideMargin;

    let maxHeight = Math.min(
      preferredMaxHeight,
      Math.max(120, spaceBelow - gap),
    );
    let top = rect.bottom + gap;

    if (spaceBelow < 180 && spaceAbove > spaceBelow) {
      maxHeight = Math.min(preferredMaxHeight, Math.max(120, spaceAbove - gap));
      top = Math.max(sideMargin, rect.top - gap - maxHeight);
    }

    setAssignedOverlayStyle({ left, top, width, maxHeight });
  };

  useEffect(() => {
    if (!assignedDropdownOpen) return undefined;

    positionAssignedOverlay();
    const reposition = () => positionAssignedOverlay();

    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);

    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [assignedDropdownOpen]);

  if (!isOpen || !event) return null;

  const hasComplianceType = Boolean(
    complianceTypeLabel &&
      String(complianceTypeLabel).trim() &&
      String(complianceTypeLabel).trim().toLowerCase() !== "not set",
  );
  const hasSubmissionFor = Boolean(
    submissionForLabel &&
      String(submissionForLabel).trim() &&
      String(submissionForLabel).trim().toLowerCase() !== "not set",
  );
  const hasSpecificSubmission = Boolean(
    specificSubmissionLabel &&
      String(specificSubmissionLabel).trim() &&
      String(specificSubmissionLabel).trim().toLowerCase() !== "not set",
  );

  const normalizeStatusBadge = (status) => {
    const value = String(status || "")
      .trim()
      .toLowerCase();

    if (value === "compliant" || value === "completed") {
      return {
        code: "C",
        label: "Compliant",
        classes: "bg-emerald-600 text-white",
      };
    }

    if (value === "under evaluation" || value === "in progress") {
      return {
        code: "UE",
        label: "Under Evaluation",
        classes: "bg-sky-700 text-white",
      };
    }

    if (value === "non-compliant" || value === "non compliant") {
      return {
        code: "NC",
        label: "Non-Compliant",
        classes: "bg-amber-400 text-white",
      };
    }

    if (value === "not applicable") {
      return {
        code: "NA",
        label: "Not Applicable",
        classes: "bg-slate-500 text-white",
      };
    }

    return {
      code: "NS",
      label: "No Submission",
      classes: "bg-slate-300 text-slate-700",
    };
  };

  const statusBadge = normalizeStatusBadge(event?.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-white/10 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.35)] dark:bg-slate-900">
        <div className="bg-emerald-900 px-5 py-5 text-white sm:px-6 sm:py-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-50/90">
                Compliance details
              </p>
              <h2 className="mt-1 text-md font-semibold sm:text-xl">
                {event.title}
              </h2>
              <p className="mt-2 text-sm text-emerald-50/90">
                {`${new Date(event.startDate).toLocaleString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })} –> ${new Date(event.endDate).toLocaleString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/15 p-2 transition hover:bg-white/25 text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6 dark:bg-slate-950">
          <div className="grid gap-4 md:grid-cols-2">
            {hasComplianceType && (
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Compliance Type
                </p>
                <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  {complianceTypeLabel}
                </p>
              </div>
            )}
            {hasSubmissionFor && (
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Submission For
                </p>
                <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  {submissionForLabel}
                </p>
              </div>
            )}
            {hasSpecificSubmission && (
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Specific Submission
                </p>
                <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  {specificSubmissionLabel}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Status
              </p>
              <div className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${statusBadge.classes}`}>
                  {statusBadge.code}
                </span>
                <span className="font-medium">{statusBadge.label}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Assigned by
              </p>
              <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                {getCreatorLabel(event)}
              </p>
            </div>
            <div className="relative" ref={assignedDetailsRef}>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Assigned to
              </p>
              <button
                type="button"
                ref={assignedTriggerRef}
                onClick={() => setAssignedDropdownOpen((prev) => !prev)}
                className="mt-2 flex w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-left text-sm text-slate-700 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600"
              >
                <span className="truncate">{getAssignmentPreview(event)}</span>
                <ChevronDown
                  className={`w-4 h-4 transition ${assignedDropdownOpen ? "-rotate-180" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap justify-end gap-2">
          {canModify(event) && (
            <>
              <button
                type="button"
                onClick={() => onEdit(event)}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Delete
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white px-4 py-2 text-sm hover:bg-gray-300 dark:hover:bg-slate-600 transition"
          >
            Close
          </button>
        </div>
      </div>

      {assignedDropdownOpen
        ? createPortal(
            <div
              data-assigned-overlay="true"
              className="fixed z-[80] rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
              style={{
                left: `${assignedOverlayStyle.left}px`,
                top: `${assignedOverlayStyle.top}px`,
                width: `${assignedOverlayStyle.width}px`,
              }}
            >
              <div
                className="space-y-2 overflow-y-auto p-2"
                style={{ maxHeight: `${assignedOverlayStyle.maxHeight}px` }}
              >
                {getAssignedItems(event).filter((group) => group.title !== "Recipients").length ? (
                  getAssignedItems(event)
                    .filter((group) => group.title !== "Recipients")
                    .map((group) => (
                    <div key={group.title} className="space-y-1">
                      <div className="px-3 py-1 text-sm font-semibold leading-tight text-slate-800 dark:text-slate-200">
                        {group.title}
                      </div>
                      <div className="overflow-x-auto px-3 py-0.5">
                        <table className="min-w-full table-fixed border border-slate-200 text-sm dark:border-slate-700">
                          <tbody>
                            {group.items
                              .reduce((rows, item, index) => {
                                if (index % 2 === 0) rows.push([item]);
                                else rows[rows.length - 1].push(item);
                                return rows;
                              }, [])
                              .map((rowItems, rowIdx) => (
                                <tr
                                  key={`${group.title}-row-${rowIdx}`}
                                  className="last:border-b-0 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                                >
                                  {rowItems.length === 1 ? (
                                    <td
                                      className="whitespace-normal break-words px-3 py-2 align-top text-slate-700 dark:text-slate-200"
                                      colSpan={2}
                                    >
                                      {rowItems[0]}
                                    </td>
                                  ) : (
                                    <>
                                      <td className="w-1/2 whitespace-normal break-words border-r border-slate-200 px-3 py-2 align-top text-slate-700 dark:border-slate-700 dark:text-slate-200">
                                        {rowItems[0]}
                                      </td>
                                      <td className="w-1/2 whitespace-normal break-words px-3 py-2 align-top text-slate-700 dark:text-slate-200">
                                        {rowItems[1]}
                                      </td>
                                    </>
                                  )}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                    No assignments available.
                  </div>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};

export default EventDetailsModal;
