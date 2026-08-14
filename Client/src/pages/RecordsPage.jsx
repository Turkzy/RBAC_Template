import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, EllipsisVertical, Eye, Trash2, Search, RotateCcw } from "lucide-react";
import api, { endpoints } from "../config/api";
import EventDetailsModal from "../components/EventDetailsModal";
import SweetAlert from "../components/SweetAlert.jsx";

const Pagination = ({ currentPage, totalPages, onPageChange, inFooter = false }) => {
  const [goToPageInput, setGoToPageInput] = useState("");

  const handleGoToPage = () => {
    const num = parseInt(goToPageInput, 10);
    if (num >= 1 && num <= totalPages) {
      onPageChange(num);
      setGoToPageInput("");
    }
  };

  if (totalPages <= 1) return null;

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

const RecordsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewFilter] = useState("deleted");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoreConfirmation, setRestoreConfirmation] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [assignedDropdownOpen, setAssignedDropdownOpen] = useState(false);
  const [complianceFormTitles, setComplianceFormTitles] = useState([]);
  const [users, setUsers] = useState([]);
  const [workgroups, setWorkgroups] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [units, setUnits] = useState([]);
  const [pageSize] = useState(10);
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const assignedDetailsRef = useRef(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const resp = await api.get(endpoints.compliance.notificationRecords);
      setRecords(resp?.data?.items || []);
    } catch (err) {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRecords();
  }, []);

  useEffect(() => {
    const fetchComplianceFormTitles = async () => {
      try {
        const resp = await api.get(endpoints.complianceForms.titles.getAll);
        setComplianceFormTitles(resp?.data?.data || []);
      } catch (err) {
        setComplianceFormTitles([]);
      }
    };

    fetchComplianceFormTitles();
  }, []);

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [usersResult, workgroupsResult, unitsResult, departmentsResult] = await Promise.allSettled([
          api.get(endpoints.users.getAll),
          api.get(endpoints.workgroups.getAll),
          api.get(endpoints.units.getAll),
          api.get(endpoints.departments.getAll),
        ]);

        setUsers(usersResult.status === "fulfilled" ? usersResult.value?.data?.users || [] : []);
        setWorkgroups(workgroupsResult.status === "fulfilled" ? workgroupsResult.value?.data?.workgroups || [] : []);
        setDepartments(departmentsResult.status === "fulfilled" ? departmentsResult.value?.data?.departments || [] : []);
        setUnits(unitsResult.status === "fulfilled" ? unitsResult.value?.data?.units || [] : []);
      } catch (e) {
        setUsers([]);
        setWorkgroups([]);
        setDepartments([]);
        setUnits([]);
      }
    };

    loadReferenceData();
  }, []);

  const getNotificationState = (item) => {
    if (item?.isDeleted) return "deleted";
    return item?.read ? "read" : "unread";
  };

  const availableYears = React.useMemo(() => {
    const years = new Set([String(new Date().getFullYear())]);

    records.forEach((item) => {
      const dateValue = item?.deletedAt || item?.createdAt || item?.updatedAt;
      if (!dateValue) return;

      const parsedDate = new Date(dateValue);
      if (!Number.isNaN(parsedDate.getTime())) {
        years.add(String(parsedDate.getFullYear()));
      }
    });

    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [records]);

  const filteredRecords = records.filter((item) => {
    if (viewFilter === "active") return !item?.isDeleted;
    if (viewFilter === "deleted") return item?.isDeleted;
    return true;
  }).filter((item) => {
    const dateValue = item?.deletedAt || item?.createdAt || item?.updatedAt;
    if (dateValue) {
      const parsedDate = new Date(dateValue);
      if (!Number.isNaN(parsedDate.getTime()) && parsedDate.getFullYear() !== Number(selectedYear)) {
        return false;
      }
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    let snapshot = null;
    try {
      snapshot = item?.snapshot ? JSON.parse(item.snapshot) : null;
    } catch {
      snapshot = null;
    }
    const title = String(snapshot?.title || snapshot?.deadlineTitle || snapshot?.complianceTitle || item?.title || "").toLowerCase();
    const subtitle = String(snapshot?.submissionFor || snapshot?.specificSubmission || snapshot?.complianceType || item?.subtitle || "").toLowerCase();
    return title.includes(q) || subtitle.includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedYear, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleRestoreNotification = async (item) => {
    try {
      await api.patch(endpoints.compliance.restoreNotification(item.complianceId), {
        userId: item.recipientUserIds?.[0] || item.userId,
      });
      await fetchRecords();
      SweetAlert.success("Deadline restored", "The deleted deadline has been restored to the calendar.");
    } catch (err) {
      console.error(err);
      SweetAlert.error("Restore failed", "Unable to restore the deadline.");
    }
  };

  const openRestoreModal = (item) => {
    setRestoreTarget(item);
    setRestoreConfirmation("");
    setRestoreModalOpen(true);
  };

  const closeRestoreModal = () => {
    setRestoreModalOpen(false);
    setRestoreTarget(null);
    setRestoreConfirmation("");
  };

  const confirmRestore = async () => {
    if (restoreConfirmation.trim().toLowerCase() !== "restore" || !restoreTarget) {
      return;
    }

    await handleRestoreNotification(restoreTarget);
    closeRestoreModal();
  };

  const openDeleteModal = (item) => {
    setDeleteTarget(item);
    setDeleteConfirmation("");
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
    setDeleteConfirmation("");
  };

  const confirmDeletePermanently = async () => {
    if (deleteConfirmation.trim().toLowerCase() !== "delete" || !deleteTarget) {
      return;
    }

    try {
      await api.delete(endpoints.compliance.deleteNotificationPermanent(deleteTarget.complianceId), {
        data: { userId: deleteTarget.recipientUserIds?.[0] || deleteTarget.userId },
      });
      await fetchRecords();
      SweetAlert.success("Record removed", "The deleted deadline was permanently removed.");
      closeDeleteModal();
    } catch (err) {
      console.error(err);
      SweetAlert.error("Remove failed", "Unable to remove the deadline.");
    }
  };

  const handleDeletePermanently = async (item) => {
    openDeleteModal(item);
  };

  const getResponsibleLabel = (item) => {
    const recipients = Array.isArray(item?.recipientUsers) ? item.recipientUsers : [];

    if (recipients.length) {
      const names = recipients
        .map((user) => {
          const fullName = [user.firstName, user.middleName, user.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
          return fullName || user.username || user.email || `User ${user.id}`;
        })
        .filter(Boolean);

      if (!names.length) {
        return item.recipientSummary || "1 recipient";
      }

      if (names.length <= 2) {
        return names.join(", ");
      }

      return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
    }

    if (item.user) {
      const fullName = [item.user.firstName, item.user.middleName, item.user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      return fullName || item.user.username || item.user.email || `User ${item.userId}`;
    }

    return item.userId ? getUserLabel(item.userId, item) : "Unknown";
  };

  const getCreatorLabel = (item) => {
    if (!item?.createdBy) return "Unknown creator";

    if (item.creator) {
      return (
        [item.creator.firstName, item.creator.middleName, item.creator.lastName]
          .filter(Boolean)
          .join(" ") ||
        item.creator.username ||
        item.creator.email ||
        getUserLabel(item.createdBy, item)
      );
    }

    return getUserLabel(item.createdBy, item);
  };

  const parseSnapshotItem = (item) => {
    if (!item) return item;

    let snapshot = null;
    try {
      snapshot = item.snapshot ? (typeof item.snapshot === 'string' ? JSON.parse(item.snapshot) : item.snapshot) : null;
    } catch {
      snapshot = null;
    }

    // When viewing a deleted record, prefer values from the stored snapshot (historical values)
    // so snapshot fields override the live item fields.
    return snapshot ? { ...item, ...snapshot } : item;
  };

  const getDeleteTargetTitle = (item) => {
    if (!item) return "this record";

    let snapshot = null;
    try {
      snapshot = item.snapshot ? (typeof item.snapshot === 'string' ? JSON.parse(item.snapshot) : item.snapshot) : null;
    } catch {
      snapshot = null;
    }

    const title =
      snapshot?.title ||
      snapshot?.deadlineTitle ||
      snapshot?.complianceTitle ||
      snapshot?.complianceType ||
      item.title ||
      item.complianceTitle ||
      item.complianceType ||
      item.submissionFor ||
      item.specificSubmission;

    if (title) return String(title);
    if (item.complianceId) return `Record ${item.complianceId}`;
    return "this record";
  };

  const getUserLabel = (id, complianceItem) => {
    if (!id) return "N/A";

    if (complianceItem?.assignedUsers?.length) {
      const match = complianceItem.assignedUsers.find((user) => Number(user.id) === Number(id));
      if (match) {
        const name = [
          match.fullName,
          [match.firstName, match.middleName, match.lastName].filter(Boolean).join(" "),
        ]
          .flat()
          .filter(Boolean)[0];
        return name || match.username || match.email || `User #${id}`;
      }
    }

    if (complianceItem?.assignedUser?.id === Number(id)) {
      const user = complianceItem.assignedUser;
      return ([user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ") || user.username || user.email || `User #${id}`);
    }

    if (complianceItem?.creator?.id === Number(id)) {
      const user = complianceItem.creator;
      return ([user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ") || user.username || user.email || `User #${id}`);
    }

    const match = users.find((item) => Number(item.id) === Number(id));
    if (match) {
      return (match.fullName || [match.firstName, match.middleName, match.lastName].filter(Boolean).join(" ") || match.username || match.email || `User #${id}`);
    }
    return `User #${id}`;
  };

  const getWorkgroupLabel = (id, complianceItem) => {
    if (!id) return "N/A";

    if (complianceItem?.assignedWorkgroups?.length) {
      const match = complianceItem.assignedWorkgroups.find((item) => Number(item.id) === Number(id));
      if (match) return match.workgroupName || match.name || `Workgroup #${id}`;
    }

    if (complianceItem?.assignedWorkgroup?.id === Number(id)) {
      return complianceItem.assignedWorkgroup.workgroupName || `Workgroup #${id}`;
    }

    const match = workgroups.find((item) => Number(item.id) === Number(id));
    if (match) return match.workgroupName || match.name || `Workgroup #${id}`;
    return `Workgroup #${id}`;
  };

  const getDepartmentLabel = (id, complianceItem) => {
    if (!id) return "N/A";
    if (complianceItem?.assignedDepartments?.length) {
      const match = complianceItem.assignedDepartments.find((item) => Number(item.id) === Number(id));
      if (match) return match.departmentName || match.name || `Department #${id}`;
    }
    if (complianceItem?.assignedDepartment?.id === Number(id)) {
      return complianceItem.assignedDepartment.departmentName || `Department #${id}`;
    }
    const match = departments.find((item) => Number(item.id) === Number(id));
    if (match) return match.departmentName || match.name || `Department #${id}`;
    return `Department #${id}`;
  };

  const getUnitLabel = (id, complianceItem) => {
    if (!id) return "N/A";
    if (complianceItem?.assignedUnits?.length) {
      const match = complianceItem.assignedUnits.find((item) => Number(item.id) === Number(id));
      if (match) return match.UnitName || match.name || `Unit #${id}`;
    }
    if (complianceItem?.assignedUnit?.id === Number(id)) {
      return complianceItem.assignedUnit.UnitName || `Unit #${id}`;
    }
    const match = units.find((item) => Number(item.id) === Number(id));
    if (match) return match.UnitName || match.name || `Unit #${id}`;
    return `Unit #${id}`;
  };

  const getAssignmentPreview = (item) => {
    if (!item) return "Not assigned";

    const groups = getAssignedItems(item).filter((group) => group.title !== "Recipients");
    if (groups.length) {
      return groups.map((group) => `${group.title}: ${group.items.length}`).join(" • ");
    }

    if (Array.isArray(item.assignedTo) && item.assignedTo.length) {
      return `${item.assignedTo.length} assignee${item.assignedTo.length > 1 ? "s" : ""}`;
    }
    if (item.assignedToLabel) return item.assignedToLabel;
    return "Not assigned";
  };

  const getAssignedItems = (item) => {
    if (!item) return [];

    const groups = [];

    if (Array.isArray(item.assignedTo) && item.assignedTo.length && typeof item.assignedTo[0] === "string") {
      groups.push({
        title: "Assigned",
        items: item.assignedTo,
      });
    }

    // Users (support embedded user objects, id arrays, or singular ids)
    if (Array.isArray(item.assignedToUsers) && item.assignedToUsers.length) {
      groups.push({
        title: "Users",
        items: item.assignedToUsers.map((u) => {
          const fullName = [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ").trim();
          return fullName || u.username || u.email || `User ${u.id || u.userId}`;
        }),
      });
    } else if (Array.isArray(item.assignedToUserIds) && item.assignedToUserIds.length) {
      groups.push({
        title: "Users",
        items: item.assignedToUserIds.map((id) => getUserLabel(id, item)),
      });
    } else if (item.assignedToUserId) {
      groups.push({
        title: "Users",
        items: [getUserLabel(item.assignedToUserId, item)],
      });
    }

    // Workgroups (support embedded objects, id arrays, or singular ids)
    if (Array.isArray(item.assignedToWorkgroups) && item.assignedToWorkgroups.length) {
      groups.push({
        title: "Workgroups",
        items: item.assignedToWorkgroups.map((w) => w.workgroupName || w.name || `Workgroup ${w.id}`),
      });
    } else if (Array.isArray(item.assignedToWorkgroupIds) && item.assignedToWorkgroupIds.length) {
      groups.push({
        title: "Workgroups",
        items: item.assignedToWorkgroupIds.map((id) => getWorkgroupLabel(id, item)),
      });
    } else if (item.assignedToWorkgroupId) {
      groups.push({
        title: "Workgroups",
        items: [getWorkgroupLabel(item.assignedToWorkgroupId, item)],
      });
    }

    // Departments
    if (Array.isArray(item.assignedToDepartments) && item.assignedToDepartments.length) {
      groups.push({
        title: "Departments",
        items: item.assignedToDepartments.map((d) => d.departmentName || d.name || `Department ${d.id}`),
      });
    } else if (Array.isArray(item.assignedToDepartmentIds) && item.assignedToDepartmentIds.length) {
      groups.push({
        title: "Departments",
        items: item.assignedToDepartmentIds.map((id) => getDepartmentLabel(id, item)),
      });
    } else if (item.assignedToDepartmentId) {
      groups.push({
        title: "Departments",
        items: [getDepartmentLabel(item.assignedToDepartmentId, item)],
      });
    }

    // Units
    if (Array.isArray(item.assignedToUnits) && item.assignedToUnits.length) {
      groups.push({
        title: "Units",
        items: item.assignedToUnits.map((u) => u.UnitName || u.name || `Unit ${u.id}`),
      });
    } else if (Array.isArray(item.assignedToUnitsIds) && item.assignedToUnitsIds.length) {
      groups.push({
        title: "Units",
        items: item.assignedToUnitsIds.map((id) => getUnitLabel(id, item)),
      });
    } else if (item.assignedToUnitsId) {
      groups.push({
        title: "Units",
        items: [getUnitLabel(item.assignedToUnitsId, item)],
      });
    }

    return groups;
  };

  const findComplianceTitle = (item) => {
    if (!item?.complianceTitleId) return null;
    return Array.isArray(complianceFormTitles)
      ? complianceFormTitles.find((title) => String(title.id) === String(item.complianceTitleId))
      : null;
  };

  const findSubmissionForm = (item) => {
    const title = findComplianceTitle(item);
    if (!title || !Array.isArray(title.ComplianceForms)) return null;
    return title.ComplianceForms.find((form) => String(form.id) === String(item.complianceFormId)) || null;
  };

  const getEventComplianceTypeLabel = (item) => {
    if (!item) return "Not set";
    const title = findComplianceTitle(item);
    return title?.title || item.complianceTitle || item.complianceType || item.type || "Not set";
  };

  const getEventSubmissionForLabel = (item) => {
    if (!item) return "Not set";
    const form = findSubmissionForm(item);
    return form?.formName || item.submissionFor || item.complianceForm || item.complianceFormName || "Not set";
  };

  const getEventSpecificSubmissionLabel = (item) => {
    if (!item) return "Not set";
    const raw = String(item.specificSubmission || item.complianceType || "").trim();
    if (!raw) return "Not set";

    const submissionFor = getEventSubmissionForLabel(item);
    if (submissionFor !== "Not set") {
      if (raw === submissionFor) return "Not set";
      const prefix = `${submissionFor} / `;
      if (raw.startsWith(prefix)) return raw.slice(prefix.length);
    }

    return raw;
  };

  const handleViewNotification = (item) => {
    setDetailModalItem(parseSnapshotItem(item));
  };

  const toggleMenu = (id, e) => {
    const menuKey = String(id);
    if (menuOpen && openMenuId === menuKey) {
      setMenuOpen(false);
      setOpenMenuId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.top,
      right: window.innerWidth - rect.left + 8,
    });
    setOpenMenuId(menuKey);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setOpenMenuId(null);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleScroll = () => closeMenu();
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [menuOpen]);

  return (
    <div className="w-full">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-500">Records</p>
        <h1 className="text-3xl font-semibold text-slate-700 dark:text-white mt-1">Deleted Records</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Showing deleted compliance deadlines across all recipients. Restore brings the deadline back to the calendar for everyone linked to that record, and delete permanently removes the full compliance item and its deleted notification rows.
        </p>
      </div>
      {/* Fixed dropdown for row actions */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} />
          <div
            className="fixed z-50 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            {(() => {
              const openItem = records.find((r) => Number(r.complianceId) === Number(openMenuId));
              let snapshot = null;
              try { snapshot = openItem?.snapshot ? JSON.parse(openItem.snapshot) : null; } catch { snapshot = null; }
              return (
                <>
                  <button
                    onClick={() => {
                      if (openItem) handleViewNotification(openItem);
                      closeMenu();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                  >
                    <Eye size={15} /> View Record
                  </button>
                  <button
                    onClick={() => {
                      if (openItem) openRestoreModal(openItem);
                      closeMenu();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                  >
                    <RotateCcw size={15} /> Restore Record
                  </button>
                  <button
                    onClick={() => {
                      if (openItem) {
                        handleDeletePermanently(openItem);
                      }
                      closeMenu();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-rose-600 dark:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                  >
                    <Trash2 size={15} /> Delete Record
                  </button>
                </>
              );
            })()}
          </div>
        </>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full sm:w-auto sm:ml-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records..."
              className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="relative w-full sm:w-40">
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
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
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-4">
        <div className="overflow-x-auto scrollbar-green">
          <table className="min-w-full text-sm bg-white dark:bg-slate-900">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="px-5 py-3 text-left whitespace-nowrap">Record</th>
                <th className="px-5 py-3 text-left whitespace-nowrap">Recipients</th>
                <th className="px-5 py-3 text-left whitespace-nowrap">Deleted Date</th>
                <th className="px-5 py-3 text-left whitespace-nowrap">Status</th>
                <th className="px-5 py-3 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800/40 divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 dark:text-slate-400">Loading records...</td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 dark:text-slate-500">No records found.</td>
                </tr>
              ) : (
                paginatedRecords.map((item) => {
                  let snapshot = null;
                  try { snapshot = item.snapshot ? JSON.parse(item.snapshot) : null; } catch (e) { snapshot = null; }
                  const title = snapshot?.title || snapshot?.deadlineTitle || snapshot?.complianceTitle || `Compliance ${item.complianceId}`;
                  const deletedAt = item.deletedAt ? new Date(item.deletedAt).toLocaleString() : "";
                  const status = item.isDeleted ? "Deleted" : (item.read ? "Read" : "Unread");

                  return (
                    <tr key={item.complianceId} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="px-5 py-3.5 align-top">
                        <div className="font-medium text-xs sm:text-sm text-slate-700 dark:text-slate-100 break-words">{title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">{snapshot?.submissionFor || snapshot?.specificSubmission || ''}</div>
                      </td>
                      <td className="px-5 py-3.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 align-top whitespace-nowrap">{getResponsibleLabel(item)}</td>
                      <td className="px-5 py-3.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 align-top whitespace-nowrap">{deletedAt}</td>
                      <td className="px-5 py-3.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 align-top whitespace-nowrap">{status}</td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap align-top">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={(e) => toggleMenu(item.complianceId, e)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700 transition"
                            aria-label="Open actions"
                          >
                            <EllipsisVertical size={15} className="pointer-events-none" />
                          </button>
                        </div>
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
                    <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {filteredRecords.length === 0 ? (
                        <span>Showing 0 of 0 records</span>
                      ) : (
                        <span>
                          Showing {(currentPage - 1) * pageSize + 1}-
                          {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} records
                        </span>
                      )}
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      inFooter={true}
                    />
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {detailModalItem && (
        <EventDetailsModal
          event={detailModalItem}
          isOpen={true}
          onClose={() => setDetailModalItem(null)}
          canModify={() => false}
          onEdit={() => {}}
          onDelete={() => {}}
          getCreatorLabel={getCreatorLabel}
          getAssignmentPreview={getAssignmentPreview}
          getAssignedItems={getAssignedItems}
          assignedDropdownOpen={assignedDropdownOpen}
          setAssignedDropdownOpen={setAssignedDropdownOpen}
          assignedDetailsRef={assignedDetailsRef}
          complianceTypeLabel={getEventComplianceTypeLabel(detailModalItem)}
          submissionForLabel={getEventSubmissionForLabel(detailModalItem)}
          specificSubmissionLabel={getEventSpecificSubmissionLabel(detailModalItem)}
        />
      )}

      {restoreModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4"
          onClick={closeRestoreModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.25)] dark:border-slate-700 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Restore notification</h2>
              </div>
              <button
                type="button"
                onClick={closeRestoreModal}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                ×
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
                <RotateCcw className="h-6 w-6" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                To confirm, type <span className="font-semibold">restore</span> in the box below.
              </p>
              <input
                type="text"
                value={restoreConfirmation}
                onChange={(e) => setRestoreConfirmation(e.target.value)}
                className="mt-5 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
                placeholder="Type restore here"
              />
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRestoreModal}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRestore}
                disabled={restoreConfirmation.trim().toLowerCase() !== "restore"}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Restore notification
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4"
          onClick={closeDeleteModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.25)] dark:border-slate-700 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Delete record permanently</h2>
              </div>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                ×
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200">
                <Trash2 className="h-6 w-6" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                To confirm permanent deletion of <span className="font-semibold">{getDeleteTargetTitle(deleteTarget)}</span>, type <span className="font-semibold">delete</span> in the box below.
              </p>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="mt-5 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-rose-500 dark:focus:ring-rose-500/20"
                placeholder="Type delete here"
              />
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePermanently}
                disabled={deleteConfirmation.trim().toLowerCase() !== "delete"}
                className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordsPage;