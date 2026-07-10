import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  X,
} from "lucide-react";
import CalendarFormModal from "../components/CalendarFormModal";
import SweetAlert from "../components/SweetAlert";
import api, { endpoints } from "../config/api";

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 8)); // July 8, 2026
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState("Month");
  const [complianceItems, setComplianceItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    description: "",
    complianceType: "Audit",
    assigned: "",
    status: "Pending",
    colorIndex: 0,
  });
  const [dayListOpen, setDayListOpen] = useState(false);
  const [dayListDate, setDayListDate] = useState(null);
  const [dayListEvents, setDayListEvents] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);

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
    date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day),
    day,
    isCurrentMonth: false,
  })),
  ...currentMonthDays.map((day) => ({
    date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
    day,
    isCurrentMonth: true,
  })),
  ...nextMonthDays.map((day) => ({
    date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day),
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

// Builds merged event bars (with lane assignment) for a single week row
const getWeekEventSegments = (weekCells) => {
  const normalizedCells = weekCells.map((cell) => (cell && cell.date ? cell.date : cell));
  const weekStart = normalizedCells[0];
  const weekEnd = normalizedCells[normalizedCells.length - 1];
  const normStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
  const normEnd = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate());

  const segments = complianceItems
    .map((item) => {
      const rawStart = new Date(item.startDate);
      const rawEnd = new Date(item.endDate);
      const itemStart = new Date(rawStart.getFullYear(), rawStart.getMonth(), rawStart.getDate());
      const itemEnd = new Date(rawEnd.getFullYear(), rawEnd.getMonth(), rawEnd.getDate());

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
    let lane = laneEnds.findIndex((occupiedEnd) => seg.startCol > occupiedEnd);
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
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i),
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

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
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
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    } catch (e) {
      return "";
    }
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
      description: "",
      complianceType: "Audit",
      assigned: "",
      status: "Pending",
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

  const openEditComplianceModal = (event) => {
    if (!event) return;

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
      description: event.description || "",
      complianceType: event.complianceType || "Audit",
      assigned: event.assigned || "",
      status: event.status || "Pending",
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
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return complianceItems.filter((item) => {
    const rawStart = new Date(item.startDate);
    const rawEnd = new Date(item.endDate);
    const itemStart = new Date(rawStart.getFullYear(), rawStart.getMonth(), rawStart.getDate());
    const itemEnd = new Date(rawEnd.getFullYear(), rawEnd.getMonth(), rawEnd.getDate());
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

  // Ten distinct color classes for deadlines/events
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
      SweetAlert.error("Unable to load compliance items", "Please try again shortly.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
    fetchComplianceItems(start, end);
  }, [currentDate]);

  // Listen for refresh event from Header
  useEffect(() => {
    const handleRefresh = () => {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      fetchComplianceItems(start, end);
    };

    window.addEventListener("app:refresh", handleRefresh);
    return () => window.removeEventListener("app:refresh", handleRefresh);
  }, [currentDate]);

  const handleDeleteCompliance = async () => {
    if (!selectedEvent?.id) return;

    const result = await SweetAlert.confirmDelete(selectedEvent.title || "this compliance item");
    if (!result.isConfirmed) return;

    try {
      const { data } = await api.delete(endpoints.compliance.delete(selectedEvent.id));
      if (data?.error) {
        SweetAlert.error("Unable to delete compliance item", data.message || "Please try again.");
        return;
      }

      SweetAlert.success("Compliance item deleted", "The calendar event was removed successfully.");
      closeEventDetails();
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      fetchComplianceItems(start, end);
    } catch (error) {
      console.error("Failed to delete compliance item:", error);
      SweetAlert.error("Unable to delete compliance item", "Please try again shortly.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (!formData.startDate || !formData.endDate) {
        SweetAlert.warning("Missing dates", "Start date and end date are required.");
        return;
      }

      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        SweetAlert.warning("Invalid date range", "End date must be the same as or after start date.");
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        complianceType: formData.complianceType,
        assigned: formData.assigned,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
        colorIndex: formData.colorIndex,
      };

      const request = editingItemId
        ? api.put(endpoints.compliance.update(editingItemId), payload)
        : api.post(endpoints.compliance.create, payload);

      const { data } = await request;
      if (data?.error) {
        SweetAlert.error("Unable to save compliance item", data.message || "Please try again.");
        return;
      }

      SweetAlert.success(
        editingItemId ? "Compliance item updated" : "Compliance item saved",
        editingItemId
          ? "The calendar event was updated successfully."
          : "The calendar event was created successfully."
      );
      setIsModalOpen(false);
      setSelectedDate(null);
      setEditingItemId(null);
      setFormData({
        title: "",
        startDate: "",
        endDate: "",
        description: "",
        complianceType: "Audit",
        assigned: "",
        status: "Pending",
        colorIndex: 0,
      });

      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      fetchComplianceItems(start, end);
    } catch (error) {
      console.error("Failed to save compliance item:", error);
      SweetAlert.error("Unable to save compliance item", "Please try again shortly.");
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
        {/* Top Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6 md:mb-8">
          {/* Left: Date Display */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="flex flex-col items-center rounded-lg overflow-hidden shadow-md min-w-[70px] sm:min-w-[70px]">
              {/* Month band */}
              <div className="w-full bg-red-600 dark:bg-slate-500 flex items-center justify-center py-1">
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                  {currentDate.toLocaleString("en-US", { month: "short" })}
                </span>
              </div>

              {/* Date body */}
              <div className="w-full bg-white dark:bg-slate-800 flex items-center justify-center py-2">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-600 dark:text-white">
                  {currentDate.getDate()}
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-600 dark:text-white">
                {viewTitle}
                <span className="ml-1 sm:ml-2 inline-block bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md font-medium">
                  {viewMode} view
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                {viewMode === "Day"
                  ? viewDateRange.start
                  : `${viewDateRange.start} – ${viewDateRange.end}`}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="w-full sm:w-auto flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none md:flex-1 lg:flex-none">
              <Search className="absolute left-2 sm:left-3 top-2 sm:top-2.5 w-3 sm:w-4 h-3 sm:h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-7 sm:pl-9 pr-2 sm:pr-3 py-1 sm:py-2 text-xs sm:text-sm bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-gray-400 dark:focus:border-slate-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Navigation */}
            <button
              onClick={handlePrev}
              className="p-1 sm:p-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition"
            >
              <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 sm:p-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition"
            >
              <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>

            {/* Today Button */}
            <button
              onClick={handleToday}
              className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap"
            >
              Today
            </button>

            {/* View Mode Selector */}
            <div className="relative inline-flex">
              <select
                value={viewMode}
                onChange={(event) => setViewMode(event.target.value)}
                className="appearance-none rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 pr-8 text-xs sm:text-sm font-medium text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 dark:focus:border-slate-500"
              >
                <option value="Month">Month view</option>
                <option value="Week">Week view</option>
                <option value="Day">Day view</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-300">
                <Calendar className="w-3 h-3" />
              </span>
            </div>

          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
          {viewMode === "Month" ? (
            <>
              {/* Day Headers - use flex row to ensure horizontal layout */}
              <div className="w-full border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950">
                <div className="flex w-full">
                  {dayNames.map((dayName, idx) => (
                    <div
                      key={dayName}
                      className={`flex-1 p-1 sm:p-2 md:p-3 lg:p-4 text-center border-r border-gray-200 dark:border-slate-700 ${idx === dayNames.length - 1 ? 'last:border-r-0' : ''}`}
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
                const { visibleSegments, hiddenPerDay } = getWeekEventSegments(weekCells);
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
                              new Date(cell.date.getFullYear(), cell.date.getMonth(), cell.date.getDate(), 9, 0)
                            )
                          }
                          className={`min-h-28 sm:min-h-32 md:min-h-36 lg:min-h-40 xl:min-h-44 p-1 sm:p-2 md:p-3 lg:p-4 border-r border-b border-gray-200 dark:border-slate-700 last:border-r-0 flex flex-col items-center text-left transition ${
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
                            seg.item
                          )} ${seg.continuesBefore ? "rounded-l-none" : "rounded-l-md"} ${
                            seg.continuesAfter ? "rounded-r-none" : "rounded-r-md"
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
                                if (e.key === 'Enter' || e.key === ' ') {
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
            </>
          ) : viewMode === "Week" ? (
            <>
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
                            {date.toLocaleDateString("en-US", { month: "short" })}
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
                    const { visibleSegments, hiddenPerDay } = getWeekEventSegments(weekCells);
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
                        {hiddenPerDay.map((count, dayIdx) => (
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
                          ) : null
                        ))}
                      </>
                    );
                  })()}
                </div>
              </div>
            </>
          ) : (
            <div className="p-6">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                <div className="mb-4">
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
                  </div>
                  <h2 className="mt-2 text-5xl font-semibold text-slate-900 dark:text-white">
                    {currentDate.getDate()}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
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
        colorOptions={DEADLINE_COLOR_CLASSES}
        isEditMode={Boolean(editingItemId)}
        title={editingItemId ? "Edit Compliance Deadline" : "Add Compliance Deadline"}
        submitLabel={editingItemId ? "Update compliance" : "Save compliance"}
      />

      {dayListOpen && dayListDate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-white/10 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.35)] dark:bg-slate-900">
            <div className="bg-emerald-900 px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-50/90">List of Compliance</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    {dayListDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDayListOpen(false)}
                    className="rounded-full bg-white/15 p-2 transition hover:bg-white/25 text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-2 p-4 sm:p-5">
              {dayListEvents.length ? (
                dayListEvents.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setDayListOpen(false);
                      openEventDetails(item);
                    }}
                    className={`w-full text-left rounded-md px-3 py-4 min-h-[60px] flex items-center ${getColorClassForItem(item)}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="truncate font-semibold">{item.title}</div>
                      <div className="text-[11px] opacity-90">
                        {new Date(item.startDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-sm text-slate-500">No events</div>
              )}
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-end">
              <button
                type="button"
                onClick={() => setDayListOpen(false)}
                className="rounded-md bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white px-4 py-2 text-sm hover:bg-gray-300 dark:hover:bg-slate-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isDetailsOpen && selectedEvent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-white/10 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.35)] dark:bg-slate-900">
            <div className="bg-emerald-900 px-5 py-5 text-white sm:px-6 sm:py-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-50/90">
                    Compliance details
                  </p>
                  <h2 className="mt-1 text-xl font-semibold sm:text-2xl">
                    {selectedEvent.title}
                  </h2>
                  <p className="mt-2 text-sm text-emerald-50/90">
                    {`${new Date(selectedEvent.startDate).toLocaleString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })} –> ${new Date(selectedEvent.endDate).toLocaleString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeEventDetails}
                    className="rounded-full bg-white/15 p-2 transition hover:bg-white/25 text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5 sm:p-6 dark:bg-slate-950">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                   <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Type
                  </p>
                  <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                    {selectedEvent.complianceType}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Status
                  </p>
                  <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                    {selectedEvent.status}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Assigned
                  </p>
                  <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                    {selectedEvent.assigned || "Unassigned"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold   text-slate-500 dark:text-slate-400">
                  Description
                </p>
                <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  {selectedEvent.description || "No description provided."}
                </p>
              </div>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => openEditComplianceModal(selectedEvent)}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDeleteCompliance}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={closeEventDetails}
                className="rounded-md bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white px-4 py-2 text-sm hover:bg-gray-300 dark:hover:bg-slate-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CalendarPage;
