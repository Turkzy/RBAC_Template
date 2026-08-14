import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLocation } from "react-router-dom";
import { PERMISSIONS } from "../utils/permissions";
import { ChevronDown, X, Download, Eye, File } from "lucide-react";
import CalendarFormModal from "../components/CalendarFormModal";
import CalendarHeader from "../components/CalendarHeader";
import DayListModal from "../components/DayListModal";
import EventDetailsModal from "../components/EventDetailsModal";
import SweetAlert from "../components/SweetAlert";
import api, { endpoints } from "../config/api";

const CalendarPage = () => {
  const normalizeComplianceStatusValue = (value) => {
    const normalized = String(value || "")
      .trim()
      .toLowerCase();
    if (normalized === "compliant") return "Compliant";
    if (normalized === "under evaluation" || normalized === "in progress")
      return "Under Evaluation";
    if (normalized === "no submission" || normalized === "pending")
      return "No Submission";
    if (normalized === "non-compliant" || normalized === "non compliant")
      return "Non-Compliant";
    if (normalized === "not applicable") return "Not Applicable";
    return "No Submission";
  };

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState("Month");
  const [complianceItems, setComplianceItems] = useState([]);
  const [complianceFormTitles, setComplianceFormTitles] = useState([]);
  const [users, setUsers] = useState([]);
  const [workgroups, setWorkgroups] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pendingOpenComplianceId, setPendingOpenComplianceId] = useState(null);
  const location = useLocation();
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    complianceType: "",
    complianceTitleId: "",
    complianceFormId: "",
    assignedToUserIds: [],
    assignedToWorkgroupIds: [],
    assignedToDepartmentIds: [],
    assignedToUnitsIds: [],
    status: "No Submission",
    colorIndex: 0,
  });
  const [dayListOpen, setDayListOpen] = useState(false);
  const [dayListDate, setDayListDate] = useState(null);
  const [dayListEvents, setDayListEvents] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [assignedDropdownOpen, setAssignedDropdownOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const assignedDetailsRef = useRef(null);
  const { user, hasPermission } = useAuth();

  const isCreator = (it) => {
    if (!user) return false;
    if (it?.creator?.id) return Number(it.creator.id) === Number(user.id);
    if (it?.createdBy) return Number(it.createdBy) === Number(user.id);
    return false;
  };

  const canModify = (it) =>
    isCreator(it) || hasPermission(PERMISSIONS.CALENDAR_MANAGE_OTHERS);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Get previous month's days to fill the grid
  const prevMonthLastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0,
  ).getDate();
  const prevMonthDays = Array.from(
    { length: startingDayOfWeek },
    (_, i) => prevMonthLastDay - startingDayOfWeek + i + 1,
  );

  // Current month days
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Next month days to fill the grid
  const totalCells = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7;
  const nextMonthDays = Array.from(
    { length: totalCells - startingDayOfWeek - daysInMonth },
    (_, i) => i + 1,
  );

  // Unified day list for the month grid, chunked into week rows
  const monthGridDays = [
    ...prevMonthDays.map((day) => ({
      date: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        day,
      ),
      day,
      isCurrentMonth: false,
    })),
    ...currentMonthDays.map((day) => ({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
      day,
      isCurrentMonth: true,
    })),
    ...nextMonthDays.map((day) => ({
      date: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        day,
      ),
      day,
      isCurrentMonth: false,
    })),
  ];

  const monthWeeks = [];
  for (let i = 0; i < monthGridDays.length; i += 7) {
    monthWeeks.push(monthGridDays.slice(i, i + 7));
  }

  const MAX_VISIBLE_LANES = 3;
  const LANE_HEIGHT_PX = 22;
  const LANE_GAP_PX = 3;

  // Determine which compliance items are visible to the current user
  const isItemVisibleToUser = (item) => {
    if (!item) return false;
    // admins or users with override permission can see everything
    if (hasPermission && hasPermission(PERMISSIONS.CALENDAR_MANAGE_OTHERS)) return true;

    const currentUserId = Number(user?.id || 0);
    if (!currentUserId) return false;

    const matchArray = (values) =>
      Array.isArray(values) && values.some((id) => Number(id) === currentUserId);

    if (Number(item?.assignedToUserId) === currentUserId) return true;
    if (matchArray(item?.assignedToUserIds)) return true;
    if (Number(item?.createdBy) === currentUserId) return true;
    if (Number(item?.submittedBy) === currentUserId) return true;

    // check workgroup / department / unit membership against requester
    const userWorkgroupId = Number(user?.workgroupId || 0);
    const userDepartmentId = Number(user?.DepartmentId || 0);
    const userUnitsId = Number(user?.unitsId || 0);

    if (userWorkgroupId) {
      if (Number(item?.assignedToWorkgroupId) === userWorkgroupId) return true;
      if (Array.isArray(item?.assignedToWorkgroupIds) && item.assignedToWorkgroupIds.some((id) => Number(id) === userWorkgroupId)) return true;
    }
    if (userDepartmentId) {
      if (Number(item?.assignedToDepartmentId) === userDepartmentId) return true;
      if (Array.isArray(item?.assignedToDepartmentIds) && item.assignedToDepartmentIds.some((id) => Number(id) === userDepartmentId)) return true;
    }
    if (userUnitsId) {
      if (Number(item?.assignedToUnitsId) === userUnitsId) return true;
      if (Array.isArray(item?.assignedToUnitsIds) && item.assignedToUnitsIds.some((id) => Number(id) === userUnitsId)) return true;
    }

    return false;
  };

  const visibleComplianceItems = React.useMemo(() => {
    return (complianceItems || []).filter((it) => isItemVisibleToUser(it));
  }, [complianceItems, user]);

  // Builds merged event bars (with lane assignment) for a single week row
  const getWeekEventSegments = (weekCells) => {
    const normalizedCells = weekCells.map((cell) =>
      cell && cell.date ? cell.date : cell,
    );
    const weekStart = normalizedCells[0];
    const weekEnd = normalizedCells[normalizedCells.length - 1];
    const normStart = new Date(
      weekStart.getFullYear(),
      weekStart.getMonth(),
      weekStart.getDate(),
    );
    const normEnd = new Date(
      weekEnd.getFullYear(),
      weekEnd.getMonth(),
      weekEnd.getDate(),
    );

    const segments = visibleComplianceItems
      .map((item) => {
        const rawStart = new Date(item.startDate);
        const rawEnd = new Date(item.endDate);
        const itemStart = new Date(
          rawStart.getFullYear(),
          rawStart.getMonth(),
          rawStart.getDate(),
        );
        const itemEnd = new Date(
          rawEnd.getFullYear(),
          rawEnd.getMonth(),
          rawEnd.getDate(),
        );

        if (itemEnd < normStart || itemStart > normEnd) return null;

        const segStart = itemStart < normStart ? normStart : itemStart;
        const segEnd = itemEnd > normEnd ? normEnd : itemEnd;

        const startCol = Math.round((segStart - normStart) / 86400000);
        const endCol = Math.round((segEnd - normStart) / 86400000);

        return {
          item,
          startCol,
          endCol,
          continuesBefore: itemStart < segStart,
          continuesAfter: itemEnd > segEnd,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.startCol - b.startCol || b.endCol - a.endCol);

    // Assign lanes so overlapping bars don't collide
    const laneEnds = [];
    segments.forEach((seg) => {
      let lane = laneEnds.findIndex(
        (occupiedEnd) => seg.startCol > occupiedEnd,
      );
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(seg.endCol);
      } else {
        laneEnds[lane] = seg.endCol;
      }
      seg.lane = lane;
    });

    // Per-day counts of overflow bars, for "+N more"
    const hiddenPerDay = Array(7).fill(0);
    segments.forEach((seg) => {
      if (seg.lane >= MAX_VISIBLE_LANES) {
        for (let col = seg.startCol; col <= seg.endCol; col += 1) {
          hiddenPerDay[col] += 1;
        }
      }
    });

    return {
      visibleSegments: segments.filter((seg) => seg.lane < MAX_VISIBLE_LANES),
      hiddenPerDay,
    };
  };

  const handlePrev = () => {
    if (viewMode === "Week") {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 7,
        ),
      );
      return;
    }

    if (viewMode === "Day") {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 1,
        ),
      );
      return;
    }

    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const handleNext = () => {
    if (viewMode === "Week") {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + 7,
        ),
      );
      return;
    }

    if (viewMode === "Day") {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + 1,
        ),
      );
      return;
    }

    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const getWeekStart = (date) => {
    const weekStart = new Date(date);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    return weekStart;
  };

  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from(
    { length: 7 },
    (_, i) =>
      new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate() + i,
      ),
  );

  const getViewDateRange = () => {
    if (viewMode === "Week") {
      const start = weekStart;
      const end = new Date(weekStart);
      end.setDate(end.getDate() + 6);
      return {
        start: start.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        end: end.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
    }

    if (viewMode === "Day") {
      return {
        start: currentDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        end: "",
      };
    }

    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const lastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    return {
      start: firstDay.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      end: lastDay.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };
  };

  const viewDateRange = getViewDateRange();
  const viewTitle =
    viewMode === "Month"
      ? monthName
      : viewMode === "Week"
        ? `Week of ${weekStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}`
        : currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          });

  const formatDateTimeValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatEventTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  const getUserLabel = (id, complianceItem) => {
    if (!id) return "N/A";

    if (complianceItem?.assignedUsers?.length) {
      const match = complianceItem.assignedUsers.find(
        (user) => Number(user.id) === Number(id),
      );
      if (match) {
        const name = [
          match.fullName,
          [match.firstName, match.middleName, match.lastName]
            .filter(Boolean)
            .join(" "),
        ]
          .flat()
          .filter(Boolean)[0];
        return name || match.username || match.email || `User #${id}`;
      }
    }

    if (complianceItem?.assignedUser?.id === Number(id)) {
      const user = complianceItem.assignedUser;
      return (
        [user.firstName, user.middleName, user.lastName]
          .filter(Boolean)
          .join(" ") ||
        user.username ||
        user.email ||
        `User #${id}`
      );
    }

    if (complianceItem?.creator?.id === Number(id)) {
      const user = complianceItem.creator;
      return (
        [user.firstName, user.middleName, user.lastName]
          .filter(Boolean)
          .join(" ") ||
        user.username ||
        user.email ||
        `User #${id}`
      );
    }

    const match = users.find((item) => Number(item.id) === Number(id));
    if (match) {
      return (
        match.fullName ||
        [match.firstName, match.middleName, match.lastName]
          .filter(Boolean)
          .join(" ") ||
        match.username ||
        match.email ||
        `User #${id}`
      );
    }
    return `User #${id}`;
  };

  const getWorkgroupLabel = (id, complianceItem) => {
    if (!id) return "N/A";

    if (complianceItem?.assignedWorkgroups?.length) {
      const match = complianceItem.assignedWorkgroups.find(
        (item) => Number(item.id) === Number(id),
      );
      if (match) {
        return match.workgroupName || match.name || `Workgroup #${id}`;
      }
    }

    if (complianceItem?.assignedWorkgroup?.id === Number(id)) {
      return (
        complianceItem.assignedWorkgroup.workgroupName || `Workgroup #${id}`
      );
    }

    const match = workgroups.find((item) => Number(item.id) === Number(id));
    if (match) {
      return match.workgroupName || match.name || `Workgroup #${id}`;
    }
    return `Workgroup #${id}`;
  };

  const getDepartmentLabel = (id, complianceItem) => {
    if (!id) return "N/A";

    if (complianceItem?.assignedDepartments?.length) {
      const match = complianceItem.assignedDepartments.find(
        (item) => Number(item.id) === Number(id),
      );
      if (match) {
        return match.departmentName || match.name || `Department #${id}`;
      }
    }

    if (complianceItem?.assignedDepartment?.id === Number(id)) {
      return (
        complianceItem.assignedDepartment.departmentName || `Department #${id}`
      );
    }

    const match = departments.find((item) => Number(item.id) === Number(id));
    if (match) {
      return match.departmentName || match.name || `Department #${id}`;
    }
    return `Department #${id}`;
  };

  const getUnitLabel = (id, complianceItem) => {
    if (!id) return "N/A";

    if (complianceItem?.assignedUnits?.length) {
      const match = complianceItem.assignedUnits.find(
        (item) => Number(item.id) === Number(id),
      );
      if (match) {
        return match.UnitName || match.name || `Unit #${id}`;
      }
    }

    if (complianceItem?.assignedUnit?.id === Number(id)) {
      return complianceItem.assignedUnit.UnitName || `Unit #${id}`;
    }

    const match = units.find((item) => Number(item.id) === Number(id));
    if (match) {
      return match.UnitName || match.name || `Unit #${id}`;
    }
    return `Unit #${id}`;
  };

  const getAssignmentSummary = (item) => {
    const parts = [];
    if (
      Array.isArray(item.assignedToUserIds) &&
      item.assignedToUserIds.length
    ) {
      parts.push(
        `Users: ${item.assignedToUserIds.map((id) => getUserLabel(id, item)).join(", ")}`,
      );
    } else if (item.assignedToUserId) {
      parts.push(`User: ${getUserLabel(item.assignedToUserId, item)}`);
    }
    if (
      Array.isArray(item.assignedToWorkgroupIds) &&
      item.assignedToWorkgroupIds.length
    ) {
      parts.push(
        `Workgroups: ${item.assignedToWorkgroupIds.map((id) => getWorkgroupLabel(id, item)).join(", ")}`,
      );
    } else if (item.assignedToWorkgroupId) {
      parts.push(
        `Workgroup: ${getWorkgroupLabel(item.assignedToWorkgroupId, item)}`,
      );
    }
    if (
      Array.isArray(item.assignedToDepartmentIds) &&
      item.assignedToDepartmentIds.length
    ) {
      parts.push(
        `Departments: ${item.assignedToDepartmentIds.map((id) => getDepartmentLabel(id, item)).join(", ")}`,
      );
    } else if (item.assignedToDepartmentId) {
      parts.push(
        `Department: ${getDepartmentLabel(item.assignedToDepartmentId, item)}`,
      );
    }
    if (
      Array.isArray(item.assignedToUnitsIds) &&
      item.assignedToUnitsIds.length
    ) {
      parts.push(
        `Units: ${item.assignedToUnitsIds.map((id) => getUnitLabel(id, item)).join(", ")}`,
      );
    } else if (item.assignedToUnitsId) {
      parts.push(`Unit: ${getUnitLabel(item.assignedToUnitsId, item)}`);
    }
    return parts.length ? parts.join(" • ") : "Unassigned";
  };

  const getAssignedGroups = (item) => {
    const groups = [];
    const users = Array.isArray(item.assignedToUserIds)
      ? item.assignedToUserIds
      : item.assignedToUserId
        ? [item.assignedToUserId]
        : [];
    if (users.length) {
      groups.push({
        title: "Users",
        items: users.map((id) => getUserLabel(id, item)),
      });
    }

    const workgroups = Array.isArray(item.assignedToWorkgroupIds)
      ? item.assignedToWorkgroupIds
      : item.assignedToWorkgroupId
        ? [item.assignedToWorkgroupId]
        : [];
    if (workgroups.length) {
      groups.push({
        title: "Workgroups",
        items: workgroups.map((id) => getWorkgroupLabel(id, item)),
      });
    }

    const departments = Array.isArray(item.assignedToDepartmentIds)
      ? item.assignedToDepartmentIds
      : item.assignedToDepartmentId
        ? [item.assignedToDepartmentId]
        : [];
    if (departments.length) {
      groups.push({
        title: "Departments",
        items: departments.map((id) => getDepartmentLabel(id, item)),
      });
    }

    const units = Array.isArray(item.assignedToUnitsIds)
      ? item.assignedToUnitsIds
      : item.assignedToUnitsId
        ? [item.assignedToUnitsId]
        : [];
    if (units.length) {
      groups.push({
        title: "Units",
        items: units.map((id) => getUnitLabel(id, item)),
      });
    }

    return groups;
  };

  const getAssignedItems = (item) => {
    return getAssignedGroups(item);
  };

  const getAssignmentPreview = (item) => {
    const groups = getAssignedGroups(item);
    if (!groups.length) return "Unassigned";

    return groups
      .map((group) => `${group.title}: ${group.items.length}`)
      .join(" • ");
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
    const title = findComplianceTitle(item);
    return title?.title || item?.complianceTitle || "Not set";
  };

  const getEventSubmissionForLabel = (item) => {
    const form = findSubmissionForm(item);
    return form?.formName || item?.complianceForm || "Not set";
  };

  const getEventSpecificSubmissionLabel = (item) => {
    const raw = String(item?.complianceType || "").trim();
    if (!raw) return "Not set";

    const submissionFor = getEventSubmissionForLabel(item);
    if (submissionFor !== "Not set") {
      if (raw === submissionFor) return "Not set";
      const prefix = `${submissionFor} / `;
      if (raw.startsWith(prefix)) return raw.slice(prefix.length);
    }

    return raw;
  };

  const getSelectedComplianceContext = () => {
    const selectedTitle = Array.isArray(complianceFormTitles)
      ? complianceFormTitles.find(
          (title) => String(title.id) === String(formData.complianceTitleId),
        )
      : null;
    const selectedForm = Array.isArray(selectedTitle?.ComplianceForms)
      ? selectedTitle.ComplianceForms.find(
          (form) => String(form.id) === String(formData.complianceFormId),
        )
      : null;

    return { selectedTitle, selectedForm };
  };

  const resolveComplianceTypeLabel = () => {
    const trimmed = String(formData.complianceType || "").trim();
    if (trimmed) {
      return trimmed;
    }

    return "";
  };

  const resolveDeadlineTitle = () => {
    const { selectedTitle, selectedForm } = getSelectedComplianceContext();
    const specificSubmission = String(formData.complianceType || "").trim();

    if (specificSubmission) {
      const pathParts = specificSubmission
        .split(" / ")
        .map((part) => part.trim())
        .filter(Boolean);
      return pathParts[pathParts.length - 1] || specificSubmission;
    }

    if (selectedForm?.formName) {
      return selectedForm.formName;
    }

    if (selectedTitle?.title) {
      return selectedTitle.title;
    }

    return String(formData.title || selectedEvent?.title || "").trim();
  };

  const getCreatorLabel = (item) => {
    if (!item?.createdBy) return "Unknown creator";
    // Use embedded creator data if available
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

  const openComplianceModal = (date) => {
    const pickedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      9,
      0,
    );
    setCurrentDate(new Date(pickedDate.getFullYear(), pickedDate.getMonth()));
    setSelectedDate(pickedDate);
    setSelectedEvent(null);
    setEditingItemId(null);
    setIsDetailsOpen(false);
    setFormData((prev) => ({
      ...prev,
      title: "",
      complianceType: "",
      complianceTitleId: "",
      complianceFormId: "",
      assignedToUserIds: [],
      assignedToWorkgroupIds: [],
      assignedToDepartmentIds: [],
      assignedToUnitsIds: [],
      status: "No Submission",
      colorIndex: 0,
      startDate: formatDateTimeValue(pickedDate),
      endDate: formatDateTimeValue(pickedDate),
    }));
    setIsModalOpen(true);
  };

  const openEventDetails = (event) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const selectedId = location?.state?.openDetailsForComplianceId;
    if (!selectedId) return;
    setPendingOpenComplianceId(selectedId);
  }, [location?.state]);

  useEffect(() => {
    if (!pendingOpenComplianceId) return;

    const openPendingItem = async () => {
      const event = complianceItems.find(
        (item) => String(item.id) === String(pendingOpenComplianceId),
      );

      if (event) {
        openEventDetails(event);
        setPendingOpenComplianceId(null);
        return;
      }

      const deletedEvent = await fetchComplianceItemById(pendingOpenComplianceId);
      if (deletedEvent) {
        setComplianceItems((prev) => [...prev, deletedEvent]);
        openEventDetails(deletedEvent);
      }
      setPendingOpenComplianceId(null);
    };

    openPendingItem();
  }, [pendingOpenComplianceId, complianceItems]);

  const openEditComplianceModal = (event) => {
    if (!event) return;

    if (!canModify(event)) {
      SweetAlert.error(
        "Permission denied",
        "You can only edit items you created or if you have the calendar override permission.",
      );
      return;
    }

    const start = event.startDate ? new Date(event.startDate) : new Date();
    const end = event.endDate ? new Date(event.endDate) : new Date();

    setEditingItemId(event.id);
    setSelectedDate(start);
    setSelectedEvent(event);
    setIsDetailsOpen(false);
    setFormData({
      title: event.title || "",
      startDate: formatDateTimeValue(start),
      endDate: formatDateTimeValue(end),
      complianceType: event.complianceType || "",
      complianceTitleId: event.complianceTitleId || "",
      complianceFormId: event.complianceFormId || "",
      assignedToUserIds:
        Array.isArray(event.assignedToUserIds) && event.assignedToUserIds.length
          ? event.assignedToUserIds
          : event.assignedToUserId
            ? [event.assignedToUserId]
            : [],
      assignedToWorkgroupIds:
        Array.isArray(event.assignedToWorkgroupIds) &&
        event.assignedToWorkgroupIds.length
          ? event.assignedToWorkgroupIds
          : event.assignedToWorkgroupId
            ? [event.assignedToWorkgroupId]
            : [],
      assignedToDepartmentIds:
        Array.isArray(event.assignedToDepartmentIds) &&
        event.assignedToDepartmentIds.length
          ? event.assignedToDepartmentIds
          : event.assignedToDepartmentId
            ? [event.assignedToDepartmentId]
            : [],
      assignedToUnitsIds:
        Array.isArray(event.assignedToUnitsIds) &&
        event.assignedToUnitsIds.length
          ? event.assignedToUnitsIds
          : event.assignedToUnitsId
            ? [event.assignedToUnitsId]
            : [],
      status: normalizeComplianceStatusValue(event.status || "No Submission"),
      colorIndex: event.colorIndex ?? 0,
    });
    setIsModalOpen(true);
  };

  const closeComplianceModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setEditingItemId(null);
  };

  const closeEventDetails = () => {
    setIsDetailsOpen(false);
    setSelectedEvent(null);
    setAssignedDropdownOpen(false);
  };

  const handleFormChange = (event) => {
    const { name, value, options, multiple } = event.target;
    const fieldValue = multiple
      ? Array.from(options)
          .filter((option) => option.selected)
          .map((option) => option.value)
      : value;
    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
  };

  // Get week number
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const diff = d - yearStart;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.round(diff / oneWeek) + 1;
  };

  // Get date range
  const getDateRange = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      start: firstDay.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      end: lastDay.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };
  };

  const dateRange = getDateRange();
  const weekNumber = getWeekNumber(currentDate);

  const isToday = (day, isCurrentMonth) => {
    return (
      isCurrentMonth &&
      day === today.getDate() &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const normalizedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    return visibleComplianceItems.filter((item) => {
      const rawStart = new Date(item.startDate);
      const rawEnd = new Date(item.endDate);
      const itemStart = new Date(
        rawStart.getFullYear(),
        rawStart.getMonth(),
        rawStart.getDate(),
      );
      const itemEnd = new Date(
        rawEnd.getFullYear(),
        rawEnd.getMonth(),
        rawEnd.getDate(),
      );
      return itemStart <= normalizedDate && itemEnd >= normalizedDate;
    });
  };

  const isComplianceDay = (date) => {
    return getEventsForDate(date).length > 0;
  };

  const getEventColorClasses = (type) => {
    switch (type) {
      case "Audit":
        return "bg-blue-500 text-white border-blue-500 hover:bg-blue-600";
      case "Review":
        return "bg-purple-500 text-white border-purple-500 hover:bg-purple-600";
      case "Training":
        return "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600";
      case "Policy":
        return "bg-orange-500 text-white border-orange-500 hover:bg-orange-600";
      default:
        return "bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-600";
    }
  };

  // Twenty distinct color classes for deadlines/events
  const DEADLINE_COLOR_CLASSES = [
    "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700",
    "bg-blue-500 text-white border-blue-500 hover:bg-blue-600",
    "bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600",
    "bg-pink-500 text-white border-pink-500 hover:bg-pink-600",
    "bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600",
    "bg-rose-500 text-white border-rose-500 hover:bg-rose-600",
    "bg-lime-500 text-white border-lime-500 hover:bg-lime-600",
    "bg-sky-500 text-white border-sky-500 hover:bg-sky-600",
    "bg-violet-500 text-white border-violet-500 hover:bg-violet-600",
    "bg-cyan-500 text-white border-cyan-500 hover:bg-cyan-600",
    "bg-fuchsia-500 text-white border-fuchsia-500 hover:bg-fuchsia-600",
    "bg-amber-500 text-white border-amber-500 hover:bg-amber-600",
    "bg-teal-500 text-white border-teal-500 hover:bg-teal-600",
    "bg-orange-500 text-white border-orange-500 hover:bg-orange-600",
    "bg-emerald-400 text-white border-emerald-400 hover:bg-emerald-500",
    "bg-indigo-400 text-white border-indigo-400 hover:bg-indigo-500",
    "bg-rose-400 text-white border-rose-400 hover:bg-rose-500",
    "bg-lime-400 text-white border-lime-400 hover:bg-lime-500",
    "bg-sky-400 text-white border-sky-400 hover:bg-sky-500",
    "bg-violet-400 text-white border-violet-400 hover:bg-violet-500",
  ];

  const getColorClassForItem = (item) => {
    if (!item) return DEADLINE_COLOR_CLASSES[0];
    // Prefer explicit colorIndex if provided on the item
    const ci = item.colorIndex;
    if (ci === 0 || ci) {
      const i = Number(ci) % DEADLINE_COLOR_CLASSES.length;
      return DEADLINE_COLOR_CLASSES[i];
    }

    const id = item.id;
    let idx = 0;
    if (typeof id === "number") {
      idx = Math.abs(id) % DEADLINE_COLOR_CLASSES.length;
    } else if (typeof id === "string") {
      // simple hash: sum of char codes
      let sum = 0;
      for (let i = 0; i < id.length; i += 1) sum += id.charCodeAt(i);
      idx = sum % DEADLINE_COLOR_CLASSES.length;
    } else {
      idx = Math.floor(Math.random() * DEADLINE_COLOR_CLASSES.length);
    }
    return DEADLINE_COLOR_CLASSES[idx];
  };

  const renderDateEvents = (date) => {
    const events = getEventsForDate(date);
    if (!events.length) return null;

    const maxVisible = 2;
    return (
      <div className="mt-2 flex w-full flex-col gap-1 text-left items-stretch">
        {events.slice(0, maxVisible).map((item) => {
          const itemDate = new Date(item.startDate);
          const itemEndDate = new Date(item.endDate);
          const colorClasses = getColorClassForItem(item);
          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                openEventDetails(item);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  openEventDetails(item);
                }
              }}
              className={`w-full cursor-pointer overflow-hidden rounded-md border px-3 py-2 text-[10px] font-semibold leading-tight transition ${colorClasses}`}
            >
              <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.04em]">
                <span className="truncate">{item.title}</span>
                <span className="shrink-0 text-[9px] font-medium opacity-90">
                  {`${itemDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} – ${itemEndDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}
                </span>
              </div>
            </div>
          );
        })}
        {events.length > maxVisible ? (
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            +{events.length - maxVisible} more
          </div>
        ) : null}
      </div>
    );
  };

  const renderEventList = (events, targetDate, maxVisible = 3) => {
    if (!events.length) return null;

    return (
      <div className="mt-3 flex w-full flex-col gap-2 text-left">
        {events.slice(0, maxVisible).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEventDetails(item);
            }}
            className={`w-full rounded-lg border px-3 py-2 text-left text-[11px] font-semibold transition ${getColorClassForItem(item)}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">{item.title}</span>
              <span className="shrink-0 text-[10px] opacity-90">
                {formatEventTime(item.startDate)}
              </span>
            </div>
          </button>
        ))}
        {events.length > maxVisible ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDayListDate(targetDate);
              setDayListEvents(events);
              setDayListOpen(true);
            }}
            className="w-full rounded-lg bg-slate-100 px-3 py-2 text-left text-[11px] font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            +{events.length - maxVisible} more
          </button>
        ) : null}
      </div>
    );
  };

  const fetchComplianceItems = async (start, end) => {
    try {
      setIsLoading(true);
      const { data } = await api.get(endpoints.compliance.list, {
        params: {
          from: start.toISOString(),
          to: end.toISOString(),
        },
      });

      if (!data?.error) {
        setComplianceItems(data.items || []);
      }
    } catch (error) {
      console.error("Failed to load compliance items:", error);
      SweetAlert.error(
        "Unable to load compliance items",
        "Please try again shortly.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComplianceItemById = async (id) => {
    try {
      const { data } = await api.get(endpoints.compliance.getById(id), {
        params: { includeDeleted: true },
      });
      if (!data?.error) return null;
      return data.item || null;
    } catch (error) {
      console.error("Failed to fetch compliance item by id:", error);
      return null;
    }
  };

  useEffect(() => {
    const start = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const end = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59,
    );
    fetchComplianceItems(start, end);
  }, [currentDate]);

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [
          usersResult,
          workgroupsResult,
          unitsResult,
          departmentsResult,
          complianceTitlesResult,
        ] = await Promise.allSettled([
          api.get(endpoints.users.getAll),
          api.get(endpoints.workgroups.getAll),
          api.get(endpoints.units.getAll),
          api.get(endpoints.departments.getAll),
          api.get(endpoints.complianceForms.titles.getAll),
        ]);

        setUsers(
          usersResult.status === "fulfilled"
            ? usersResult.value?.data?.users || []
            : [],
        );
        setWorkgroups(
          workgroupsResult.status === "fulfilled"
            ? workgroupsResult.value?.data?.workgroups || []
            : [],
        );
        setDepartments(
          departmentsResult.status === "fulfilled"
            ? departmentsResult.value?.data?.departments || []
            : [],
        );
        setUnits(
          unitsResult.status === "fulfilled"
            ? unitsResult.value?.data?.units || []
            : [],
        );
        setComplianceFormTitles(
          complianceTitlesResult.status === "fulfilled"
            ? complianceTitlesResult.value?.data?.data || []
            : [],
        );
      } catch (error) {
        console.error("Failed to load assignment reference data:", error);
      }
    };

    loadReferenceData();
  }, []);

  useEffect(() => {
    if (!assignedDropdownOpen) return undefined;
    const handleOutsideClick = (event) => {
      const isOverlayClick = event.target?.closest?.('[data-assigned-overlay="true"]');
      if (isOverlayClick) return;

      if (
        assignedDetailsRef.current &&
        !assignedDetailsRef.current.contains(event.target)
      ) {
        setAssignedDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [assignedDropdownOpen]);

  // Listen for refresh event from Header
  useEffect(() => {
    const handleRefresh = () => {
      const start = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const end = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
        23,
        59,
        59,
      );
      fetchComplianceItems(start, end);
    };

    window.addEventListener("app:refresh", handleRefresh);
    return () => window.removeEventListener("app:refresh", handleRefresh);
  }, [currentDate]);

  const handleDownloadFile = (
    complianceItemId,
    originalFilename,
    index = 0,
  ) => {
    if (!complianceItemId) return;

    const downloadUrl = `${api.defaults.baseURL}${endpoints.compliance.download(complianceItemId)}?index=${index}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = originalFilename || "file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isPdfFile = (fileName) => {
    if (!fileName) return false;
    return fileName.toLowerCase().endsWith(".pdf");
  };

  const getFileIcon = () => {
    return (
      <File className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
    );
  };

  const handleViewPdf = (fileUrl) => {
    if (!fileUrl) return;
    window.open(fileUrl, "_blank");
  };

  const openDeleteConfirmModal = () => {
    if (!selectedEvent?.id) return;
    if (!canModify(selectedEvent)) {
      SweetAlert.error(
        "Permission denied",
        "You can only delete items you created or if you have the calendar override permission.",
      );
      return;
    }

    setDeleteConfirmation("");
    setDeleteModalOpen(true);
  };

  const closeDeleteConfirmModal = () => {
    setDeleteModalOpen(false);
    setDeleteConfirmation("");
  };

  const handleDeleteCompliance = async () => {
    if (!selectedEvent?.id) return;
    if (!canModify(selectedEvent)) {
      SweetAlert.error(
        "Permission denied",
        "You can only delete items you created or if you have the calendar override permission.",
      );
      return;
    }

    if (deleteConfirmation.trim().toLowerCase() !== "delete") {
      return;
    }

    try {
      const { data } = await api.delete(
        endpoints.compliance.delete(selectedEvent.id),
      );
      if (data?.error) {
        SweetAlert.error(
          "Unable to delete compliance item",
          data.message || "Please try again.",
        );
        closeDeleteConfirmModal();
        return;
      }

      SweetAlert.success(
        "Deadline moved to records",
        "The deadline was removed from the calendar and can be restored from deleted records.",
      );
      closeDeleteConfirmModal();
      closeEventDetails();
      const start = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const end = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
        23,
        59,
        59,
      );
      fetchComplianceItems(start, end);
    } catch (error) {
      console.error("Failed to delete compliance item:", error);
      SweetAlert.error(
        "Unable to delete compliance item",
        "Please try again shortly.",
      );
      closeDeleteConfirmModal();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prevent saving updates when user cannot modify this item
    if (editingItemId && !canModify(selectedEvent)) {
      SweetAlert.error("Permission denied", "You cannot update this item.");
      return;
    }

    try {
      if (!formData.startDate || !formData.endDate) {
        SweetAlert.warning(
          "Missing dates",
          "Start date and end date are required.",
        );
        return;
      }

      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        SweetAlert.warning(
          "Invalid date range",
          "End date must be the same as or after start date.",
        );
        return;
      }

      const resolvedComplianceType = resolveComplianceTypeLabel();
      const resolvedDeadlineTitle = resolveDeadlineTitle();
      if (!resolvedDeadlineTitle) {
        SweetAlert.warning(
          "Missing compliance selection",
          "Select a compliance type before saving.",
        );
        return;
      }

      const payload = new FormData();
      payload.append("title", resolvedDeadlineTitle);
      payload.append("complianceType", resolvedComplianceType);
      payload.append("complianceTitleId", formData.complianceTitleId || "");
      payload.append("complianceFormId", formData.complianceFormId || "");
      payload.append(
        "assignedToUserIds",
        JSON.stringify(formData.assignedToUserIds || []),
      );
      payload.append(
        "assignedToWorkgroupIds",
        JSON.stringify(formData.assignedToWorkgroupIds || []),
      );
      payload.append(
        "assignedToDepartmentIds",
        JSON.stringify(formData.assignedToDepartmentIds || []),
      );
      payload.append(
        "assignedToUnitsIds",
        JSON.stringify(formData.assignedToUnitsIds || []),
      );
      const resolvedStatus = formData.status?.trim() ? formData.status : "No Submission";
      payload.append("status", resolvedStatus);
      payload.append("startDate", formData.startDate);
      payload.append("endDate", formData.endDate);
      payload.append("colorIndex", formData.colorIndex);

      const request = editingItemId
        ? api.put(endpoints.compliance.update(editingItemId), payload, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : api.post(endpoints.compliance.create, payload, {
            headers: { "Content-Type": "multipart/form-data" },
          });

      const { data } = await request;
      if (data?.error) {
        SweetAlert.error(
          "Unable to save compliance item",
          data.message || "Please try again.",
        );
        return;
      }

      SweetAlert.success(
        editingItemId ? "Compliance item updated" : "Compliance item saved",
        editingItemId
          ? "The calendar event was updated successfully."
          : "The calendar event was created successfully.",
      );
      setIsModalOpen(false);
      setSelectedDate(null);
      setEditingItemId(null);
      setFormData({
        title: "",
        startDate: "",
        endDate: "",
        complianceType: "",
        complianceTitleId: "",
        complianceFormId: "",
        assignedToUserIds: [],
        assignedToWorkgroupIds: [],
        assignedToDepartmentIds: [],
        assignedToUnitsIds: [],
        status: "No Submission",
        colorIndex: 0,
      });

      const start = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const end = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
        23,
        59,
        59,
      );
      fetchComplianceItems(start, end);
    } catch (error) {
      console.error("Failed to save compliance item:", error);
      SweetAlert.error(
        "Unable to save compliance item",
        "Please try again shortly.",
      );
    }
  };

  return (
    <div className="min-h-screen dark:bg-slate-900 text-gray-900 dark:text-gray-100 p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 2xl:p-10">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <p className="text-xs sm:text-sm md:text-base font-semibold uppercase tracking-[0.35em] text-emerald-500">
          Calendar
        </p>
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-700 dark:text-white mt-1">
          Compliance Calendar
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-gray-400">
          Manage your calendar events and schedule
        </p>
      </div>
      <hr className="border-gray-200 dark:border-slate-600 mb-4 sm:mb-6 md:mb-8" />
      <div className="max-w-4xl sm:max-w-5xl md:max-w-6xl lg:max-w-7xl xl:max-w-8xl 2xl:max-w-full mx-auto">
        {/* Header */}
        <CalendarHeader
          currentDate={currentDate}
          viewMode={viewMode}
          viewTitle={viewTitle}
          viewDateRange={viewDateRange}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          onViewModeChange={setViewMode}
        />

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
          {viewMode === "Month" ? (
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Day Headers - use flex row to ensure horizontal layout */}
                <div className="w-full border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950">
                  <div className="flex w-full">
                    {dayNames.map((dayName, idx) => (
                      <div
                        key={dayName}
                        className={`flex-1 p-1 sm:p-2 md:p-3 lg:p-4 text-center border-r border-gray-200 dark:border-slate-700 ${idx === dayNames.length - 1 ? "last:border-r-0" : ""}`}
                      >
                        <div className="text-xs sm:text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300">
                          {dayName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Week Rows */}
                {monthWeeks.map((weekCells, weekIdx) => {
                  const { visibleSegments, hiddenPerDay } =
                    getWeekEventSegments(weekCells);
                  return (
                    <div key={`week-${weekIdx}`} className="relative">
                      {/* Day cells */}
                      <div className="grid grid-cols-7">
                        {weekCells.map((cell, dayIdx) => (
                          <button
                            type="button"
                            key={`cell-${weekIdx}-${dayIdx}`}
                            onClick={() =>
                              openComplianceModal(
                                new Date(
                                  cell.date.getFullYear(),
                                  cell.date.getMonth(),
                                  cell.date.getDate(),
                                  9,
                                  0,
                                ),
                              )
                            }
                            className={`aspect-square p-1 sm:p-2 md:p-3 lg:p-4 border-r border-b border-gray-200 dark:border-slate-700 last:border-r-0 flex flex-col items-center text-left transition ${
                              !cell.isCurrentMonth
                                ? "bg-gray-50 dark:bg-slate-950/70 text-gray-400 dark:text-slate-600 hover:bg-gray-100 dark:hover:bg-slate-800/80"
                                : isToday(cell.day, true)
                                  ? "bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700/50"
                                  : "bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                            }`}
                          >
                            <span
                              className={`text-xs sm:text-sm md:text-base font-semibold ${
                                cell.isCurrentMonth && isToday(cell.day, true)
                                  ? "w-5 sm:w-6 md:w-7 h-5 sm:h-6 md:h-7 flex items-center justify-center rounded-full bg-green-400 text-gray-900 font-bold"
                                  : cell.isCurrentMonth
                                    ? "text-gray-900 dark:text-gray-200"
                                    : ""
                              }`}
                            >
                              {cell.day}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Merged event bars overlay */}
                      <div
                        className="pointer-events-none absolute inset-x-0 grid grid-cols-7"
                        style={{
                          top: "3rem",
                          gridAutoRows: `${LANE_HEIGHT_PX}px`,
                          rowGap: `${LANE_GAP_PX}px`,
                        }}
                      >
                        {visibleSegments.map((seg, segIdx) => (
                          <div
                            key={`${seg.item.id}-${weekIdx}-${segIdx}`}
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEventDetails(seg.item);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                openEventDetails(seg.item);
                              }
                            }}
                            style={{
                              gridColumn: `${seg.startCol + 1} / ${seg.endCol + 2}`,
                              gridRow: seg.lane + 1,
                            }}
                            className={`pointer-events-auto mx-0.5 flex items-center overflow-hidden truncate px-2 py-1 text-[10px] font-semibold leading-tight cursor-pointer transition ${getColorClassForItem(
                              seg.item,
                            )} ${seg.continuesBefore ? "rounded-l-none" : "rounded-l-md"} ${
                              seg.continuesAfter
                                ? "rounded-r-none"
                                : "rounded-r-md"
                            }`}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-[10px] font-semibold flex-shrink-0">
                                {formatEventTime(seg.item.startDate)}
                              </span>
                              <span className="truncate">{seg.item.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* "+N more" per day when a day has more items than visible lanes */}
                      <div
                        className="pointer-events-none absolute inset-x-0 grid grid-cols-7"
                        style={{
                          top: `calc(3rem + ${MAX_VISIBLE_LANES * (LANE_HEIGHT_PX + LANE_GAP_PX)}px)`,
                        }}
                      >
                        {hiddenPerDay.map((count, dayIdx) => (
                          <div key={`more-${weekIdx}-${dayIdx}`} className="px-2">
                            {count > 0 ? (
                              <button
                                type="button"
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const cellDate = weekCells[dayIdx].date;
                                  const events = getEventsForDate(cellDate);
                                  setDayListDate(cellDate);
                                  setDayListEvents(events);
                                  setDayListOpen(true);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const cellDate = weekCells[dayIdx].date;
                                    const events = getEventsForDate(cellDate);
                                    setDayListDate(cellDate);
                                    setDayListEvents(events);
                                    setDayListOpen(true);
                                  }
                                }}
                                className="pointer-events-auto w-full flex items-start justify-start h-5 rounded-md bg-slate-100 dark:bg-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-200 cursor-pointer hover:brightness-95 dark:hover:bg-slate-500 transition px-2 py-1"
                              >
                                +{count} more
                              </button>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : viewMode === "Week" ? (
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
              <div className="grid grid-cols-7 gap-0 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950">
                {dayNames.map((dayName) => (
                  <div
                    key={dayName}
                    className="p-1 sm:p-2 md:p-3 lg:p-4 text-center border-r border-gray-200 dark:border-slate-700 last:border-r-0"
                  >
                    <div className="text-xs sm:text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300">
                      {dayName}
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative">
                <div className="grid grid-cols-7">
                  {weekDays.map((date) => (
                    <div
                      key={date.toISOString()}
                      role="button"
                      tabIndex={0}
                      onClick={() => openComplianceModal(date)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openComplianceModal(date);
                        }
                      }}
                      className="min-h-28 sm:min-h-32 md:min-h-36 lg:min-h-40 xl:min-h-44 cursor-pointer border-r border-b border-gray-200 bg-white p-2 text-left transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-700/50 last:border-r-0"
                    >
                      <div className="flex flex-col items-start justify-start text-left">
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {date.getDate()}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                            {date.toLocaleDateString("en-US", {
                              month: "short",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="pointer-events-none absolute inset-x-0 grid grid-cols-7"
                  style={{
                    top: "3rem",
                    gridAutoRows: `${LANE_HEIGHT_PX}px`,
                    rowGap: `${LANE_GAP_PX}px`,
                  }}
                >
                  {(() => {
                    const weekCells = weekDays.map((date) => ({ date }));
                    const { visibleSegments, hiddenPerDay } =
                      getWeekEventSegments(weekCells);
                    return (
                      <>
                        {visibleSegments.map((seg, segIdx) => (
                          <div
                            key={`${seg.item.id}-${segIdx}`}
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEventDetails(seg.item);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                openEventDetails(seg.item);
                              }
                            }}
                            style={{
                              gridColumn: `${seg.startCol + 1} / ${seg.endCol + 2}`,
                              gridRow: seg.lane + 1,
                            }}
                            className={`pointer-events-auto mx-0.5 flex items-center overflow-hidden truncate px-2 py-1 text-[10px] font-semibold leading-tight cursor-pointer transition ${getColorClassForItem(seg.item)} ${seg.continuesBefore ? "rounded-l-none" : "rounded-l-md"} ${seg.continuesAfter ? "rounded-r-none" : "rounded-r-md"}`}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-[10px] font-semibold flex-shrink-0">
                                {formatEventTime(seg.item.startDate)}
                              </span>
                              <span className="truncate">{seg.item.title}</span>
                            </div>
                          </div>
                        ))}
                        {hiddenPerDay.map((count, dayIdx) =>
                          count > 0 ? (
                            <button
                              key={`more-week-${dayIdx}`}
                              type="button"
                              style={{
                                gridColumn: dayIdx + 1,
                                gridRow: MAX_VISIBLE_LANES + 1,
                              }}
                              className="pointer-events-auto mx-0.5 flex items-start justify-start h-5 rounded-md bg-slate-100 dark:bg-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-200 cursor-pointer hover:brightness-95 dark:hover:bg-slate-500 transition px-2 py-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                const cellDate = weekDays[dayIdx];
                                const events = getEventsForDate(cellDate);
                                setDayListDate(cellDate);
                                setDayListEvents(events);
                                setDayListOpen(true);
                              }}
                            >
                              +{count} more
                            </button>
                          ) : null,
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                <div className="mb-4">
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    {currentDate.toLocaleDateString("en-US", {
                      weekday: "long",
                    })}
                  </div>
                  <h2 className="mt-2 text-5xl font-semibold text-slate-900 dark:text-white">
                    {currentDate.getDate()}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {currentDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Compliance for this day
                  </h3>
                  <button
                    type="button"
                    onClick={() => openComplianceModal(currentDate)}
                    className="rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                  >
                    Add compliance
                  </button>
                </div>
                {(() => {
                  const dayEvents = getEventsForDate(currentDate);
                  if (!dayEvents.length) {
                    return (
                      <div className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        No compliance scheduled for this day.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {dayEvents.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => openEventDetails(item)}
                          className={`w-full rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${getColorClassForItem(item)}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate">{item.title}</span>
                            <span className="shrink-0 text-xs opacity-90">
                              {formatEventTime(item.startDate)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      <CalendarFormModal
        isOpen={isModalOpen}
        selectedDate={selectedDate}
        formData={formData}
        onClose={closeComplianceModal}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        users={users}
        currentUserId={user?.id}
        workgroups={workgroups}
        departments={departments}
        units={units}
        colorOptions={DEADLINE_COLOR_CLASSES}
        isEditMode={Boolean(editingItemId)}
        canModify={editingItemId ? canModify(selectedEvent) : true}
        complianceFormTitles={complianceFormTitles}
        title={
          editingItemId ? "Edit Compliance Deadline" : "Add Compliance Deadline"
        }
        submitLabel={editingItemId ? "Update compliance" : "Save compliance"}
      />

      <DayListModal
        isOpen={dayListOpen}
        date={dayListDate}
        events={dayListEvents}
        onClose={() => setDayListOpen(false)}
        onEventClick={(item) => {
          setDayListOpen(false);
          openEventDetails(item);
        }}
        getColorClassForItem={getColorClassForItem}
      />

      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4"
          onClick={closeDeleteConfirmModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.25)] dark:border-slate-700 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Delete deadline</h2>
              </div>
              <button
                type="button"
                onClick={closeDeleteConfirmModal}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                ×
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200">
                <X className="h-6 w-6" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                To confirm deletion of <span className="font-semibold">{selectedEvent?.title || "this deadline"}</span>, type <span className="font-semibold">delete</span> in the box below.
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
                onClick={closeDeleteConfirmModal}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCompliance}
                disabled={deleteConfirmation.trim().toLowerCase() !== "delete"}
                className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete deadline
              </button>
            </div>
          </div>
        </div>
      )}

      <EventDetailsModal
        isOpen={isDetailsOpen}
        event={selectedEvent}
        onClose={closeEventDetails}
        canModify={canModify}
        onEdit={openEditComplianceModal}
        onDelete={openDeleteConfirmModal}
        getCreatorLabel={getCreatorLabel}
        getAssignmentPreview={getAssignmentPreview}
        getAssignedItems={getAssignedItems}
        assignedDropdownOpen={assignedDropdownOpen}
        setAssignedDropdownOpen={setAssignedDropdownOpen}
        assignedDetailsRef={assignedDetailsRef}
        complianceTypeLabel={getEventComplianceTypeLabel(selectedEvent)}
        submissionForLabel={getEventSubmissionForLabel(selectedEvent)}
        specificSubmissionLabel={getEventSpecificSubmissionLabel(selectedEvent)}
      />
    </div>
  );
};

export default CalendarPage;
