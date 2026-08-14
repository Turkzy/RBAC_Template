import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Layers3,
  Users,
} from "lucide-react";
import ApexCharts from "apexcharts";
import api, { endpoints, FILE_BASE_URL } from "../config/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const DEFAULT_METRICS = [
  {
    label: "Total submissions",
    value: 0,
    icon: FileText,
    accent: "from-emerald-500 to-green-500",
    text: "No compliance items loaded",
  },
  {
    label: "Pending review",
    value: 0,
    icon: Clock3,
    accent: "from-amber-500 to-yellow-500",
    text: "Waiting for action",
  },
  {
    label: "Approved",
    value: 0,
    icon: CheckCircle2,
    accent: "from-sky-500 to-cyan-500",
    text: "Completed and cleared",
  },
  {
    label: "Needs revision",
    value: 0,
    icon: AlertTriangle,
    accent: "from-rose-500 to-red-500",
    text: "Requires follow-up",
  },
];

const DashboardPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [imageError, setImageError] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );
  const lineChartRef = useRef(null);
  const donutChartRef = useRef(null);
  const radialChartRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDarkMode(root.classList.contains("dark"));
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(endpoints.compliance.list, {
        params: { includeDeleted: true },
      });
      const allItems = Array.isArray(data?.items) ? data.items : [];
      setItems(allItems);
    } catch (error) {
      console.error("Failed to load dashboard analytics:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const availableYears = useMemo(() => {
    const years = new Set();
    const currentYear = new Date().getFullYear();

    items.forEach((item) => {
      const dateValue =
        item?.createdAt || item?.submittedAt || item?.dateSubmitted || item?.startDate || item?.endDate;
      if (!dateValue) return;

      const parsedDate = new Date(dateValue);
      if (!Number.isNaN(parsedDate.getTime())) {
        years.add(parsedDate.getFullYear());
      }
    });

    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const dateValue =
        item?.createdAt || item?.submittedAt || item?.dateSubmitted || item?.startDate || item?.endDate;
      if (!dateValue) return false;

      const parsedDate = new Date(dateValue);
      return !Number.isNaN(parsedDate.getTime()) && parsedDate.getFullYear() === Number(selectedYear);
    });
  }, [items, selectedYear]);

  const stats = useMemo(() => {
    const total = filteredItems.length;
    const approved = filteredItems.filter(
      (item) =>
        String(item?.submissionStatus || "Pending Review") === "Approved",
    ).length;
    const pending = filteredItems.filter(
      (item) =>
        String(item?.submissionStatus || "Pending Review") === "Pending Review",
    ).length;
    const rejected = filteredItems.filter(
      (item) =>
        String(item?.submissionStatus || "Pending Review") === "Rejected",
    ).length;
    const compliant = approved; // Compliant items (Approved status)
    const completionRate = total ? Math.round((approved / total) * 100) : 0;
    const complianceRate = total ? Math.round((compliant / total) * 100) : 0;

    return {
      total,
      approved,
      pending,
      rejected,
      compliant,
      completionRate,
      complianceRate,
    };
  }, [filteredItems]);

  const pendingStatusList = useMemo(() => {
    const counts = {
      "No Submission": 0,
      "Under Evaluation": 0,
    };

    filteredItems.forEach((item) => {
      const status = String(
        item?.submissionStatus || item?.status || "Pending Review",
      );

      if (status === "No Submission" || status === "no submission") {
        counts["No Submission"] += 1;
      }

      if (
        status === "Under Evaluation" ||
        status === "under evaluation" ||
        status === "In Progress" ||
        status === "in progress"
      ) {
        counts["Under Evaluation"] += 1;
      }
    });

    return [
      { name: "No Submission", value: counts["No Submission"] },
      { name: "Under Evaluation", value: counts["Under Evaluation"] },
    ];
  }, [filteredItems]);

  const monthlyTrend = useMemo(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const counts = new Array(6).fill(0);
    const current = new Date(Number(selectedYear), 0, 1);

    filteredItems.forEach((item) => {
      const createdAt =
        item?.createdAt || item?.submittedAt || item?.dateSubmitted;
      if (!createdAt) return;

      const date = new Date(createdAt);
      if (Number.isNaN(date.getTime())) return;

      const diffMonths =
        (current.getFullYear() - date.getFullYear()) * 12 +
        (current.getMonth() - date.getMonth());
      if (diffMonths >= 0 && diffMonths < 6) {
        counts[5 - diffMonths] += 1;
      }
    });

    return {
      labels: Array.from({ length: 6 }, (_, idx) => {
        const date = new Date(
          current.getFullYear(),
          current.getMonth() - (5 - idx),
          1,
        );
        return monthNames[date.getMonth()];
      }),
      values: counts,
    };
  }, [filteredItems]);

  const statusBreakdown = useMemo(() => {
    const statusMap = {
      Approved: 0,
      "Pending Review": 0,
      Rejected: 0,
    };

    filteredItems.forEach((item) => {
      const status = String(item?.submissionStatus || "Pending Review");
      if (statusMap[status] !== undefined) {
        statusMap[status] += 1;
      }
    });

    return [
      { name: "Approved", value: statusMap.Approved, color: "#10b981" },
      {
        name: "Pending Review",
        value: statusMap["Pending Review"],
        color: "#f59e0b",
      },
      { name: "Rejected", value: statusMap.Rejected, color: "#ef4444" },
    ];
  }, [filteredItems]);

  const departmentLoad = useMemo(() => {
    const counts = {};

    filteredItems.forEach((item) => {
      const department =
        item?.department || item?.workgroup || item?.unit || "General";
      counts[department] = (counts[department] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [filteredItems]);

  const dashboardCards = useMemo(() => {
    const cardList = [
      {
        label: "Total submissions",
        value: stats.total,
        icon: FileText,
        accent: "from-emerald-500 to-green-500",
        text: `${stats.completionRate}% approval completion`,
      },
      {
        label: "Pending review",
        value: stats.pending,
        icon: Clock3,
        accent: "from-amber-500 to-yellow-500",
        text: "Needs follow-up from reviewers",
      },
      {
        label: "Approved",
        value: stats.approved,
        icon: CheckCircle2,
        accent: "from-sky-500 to-cyan-500",
        text: "Completed and cleared",
      },
      {
        label: "Needs revision",
        value: stats.rejected,
        icon: AlertTriangle,
        accent: "from-rose-500 to-red-500",
        text: "Returned for corrections",
      },
    ];

    return cardList;
  }, [stats]);

  useEffect(() => {
    if (!loading) {
      const charts = [];
      const labelNameColor = isDarkMode ? "#f1f5f9" : "#1e293b";
      const labelValueColor = isDarkMode ? "#e0f2fe" : "#1e293b";

      const lineChart = new ApexCharts(lineChartRef.current, {
        chart: {
          type: "bar",
          height: 380,
          width: "100%",
          toolbar: { show: false },
          foreColor: "#64748b",
          background: "transparent",
        },
        series: [{ name: "Submissions", data: monthlyTrend.values }],
        plotOptions: {
          bar: {
            borderRadius: 8,
            horizontal: false,
            columnWidth: "60%",
            dataLabels: {
              position: "top",
            },
          },
        },
        fill: {
          type: "gradient",
          gradient: {
            shade: "light",
            type: "vertical",
            shadeIntensity: 0.3,
            gradientToColors: ["#3b82f6"],
            opacityFrom: 1,
            opacityTo: 0.7,
            stops: [0, 100],
          },
        },
        grid: { borderColor: "#e2e8f0", strokeDashArray: 4 },
        xaxis: {
          categories: monthlyTrend.labels,
          labels: {
            style: { colors: "#64748b", fontSize: "13px", fontWeight: 600 },
          },
        },
        yaxis: {
          labels: { style: { colors: "#64748b" } },
          title: { text: "Count" },
        },
        tooltip: { theme: "light" },
        colors: ["#0ea5e9"],
        dataLabels: {
          enabled: true,
          style: { colors: ["#0ea5e9"], fontSize: "12px", fontWeight: 600 },
          formatter: (value) => (value > 0 ? value : ""),
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: { height: 300 },
              xaxis: {
                labels: {
                  style: { fontSize: "10px" },
                  rotate: -45,
                },
              },
              dataLabels: { enabled: false },
            },
          },
        ],
      });
      lineChart.render();
      charts.push(lineChart);

      const legendLabelColor = isDarkMode ? "#cbd5e1" : "#64748b";
      const trackBgColor = isDarkMode ? "#334155" : "#e2e8f0";

      const donutChart = new ApexCharts(donutChartRef.current, {
        chart: {
          type: "radialBar",
          height: 320,
          toolbar: { show: false },
          background: "transparent",
          foreColor: legendLabelColor,
        },
        series: statusBreakdown.map((item) => item.value),
        labels: statusBreakdown.map((item) => item.name),
        colors: statusBreakdown.map((item) => item.color),
        legend: {
          position: "bottom",
          fontSize: "13px",
          fontWeight: 600,
          labels: { 
            colors: legendLabelColor,
            useSeriesColors: false,
          },
          markers: {
            size: 8,
            radius: 2,
          },
          itemMargin: {
            horizontal: 12,
            vertical: 8,
          },
          formatter: (val) => `<span style="color: ${legendLabelColor}; font-weight: 600;">${val}</span>`,
        },
        plotOptions: {
          radialBar: {
            size: undefined,
            inverseOrder: false,
            hollow: {
              margin: 5,
              size: "30%",
              background: "transparent",
            },
            track: {
              show: true,
              background: trackBgColor,
              strokeWidth: "7%",
              opacity: 0.6,
              margin: 5,
            },
            dataLabels: {
              showOn: "always",
              name: {
                show: true,
                fontSize: "13px",
                fontWeight: 700,
                color: labelNameColor,
                offsetY: -10,
              },
              value: {
                show: true,
                fontSize: "16px",
                fontWeight: 700,
                color: labelValueColor,
                offsetY: 8,
                formatter: (val) => `${val}%`,
              },
              total: {
                show: true,
                label: "Total",
                fontSize: "14px",
                fontWeight: 600,
                color: legendLabelColor,
              },
            },
          },
        },
        fill: {
          type: "gradient",
          gradient: {
            shade: isDarkMode ? "dark" : "light",
            type: "vertical",
            shadeIntensity: 0.2,
            stops: [0, 100],
          },
        },
        stroke: {
          lineCap: "round",
        },
        tooltip: {
          theme: isDarkMode ? "dark" : "light",
        },
      });
      donutChart.render();
      charts.push(donutChart);

      const radialChart = new ApexCharts(radialChartRef.current, {
        chart: {
          type: "radialBar",
          height: 260,
          toolbar: { show: false },
          background: "transparent",
          foreColor: "#64748b",
        },
        series: [stats.complianceRate],
        labels: ["Compliant"],
        colors: ["#f59e0b"],
        plotOptions: {
          radialBar: {
            startAngle: -135,
            endAngle: 225,
            hollow: { size: "58%" },
            dataLabels: {
              name: {
                show: true,
                color: "#64748b",
                fontSize: "14px",
              },
              value: {
                show: true,
                fontSize: "24px",
                fontWeight: 700,
                formatter: (value) => `${value}%`,
                color: "#f59e0b",
              },
            },
          },
        },
        fill: {
          type: "gradient",
          gradient: {
            shade: "dark",
            gradientToColors: ["#d97706"],
            stops: [0, 100],
          },
        },
        states: {
          hover: {
            filter: {
              type: "none",
            },
          },
          active: {
            filter: {
              type: "none",
            },
          },
        },
      });
      radialChart.render();
      charts.push(radialChart);

      return () => charts.forEach((chart) => chart.destroy());
    }
  }, [loading, monthlyTrend, stats.complianceRate, statusBreakdown, isDarkMode]);

  const monthGrid = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const daysInMonth = lastDay.getDate();
    const totalCells = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7;

    const cells = [];

    for (let i = 0; i < startingDayOfWeek; i += 1) {
      cells.push({
        day: prevMonthLastDay - startingDayOfWeek + i + 1,
        date: new Date(
          year,
          month - 1,
          prevMonthLastDay - startingDayOfWeek + i + 1,
        ),
        currentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({
        day,
        date: new Date(year, month, day),
        currentMonth: true,
      });
    }

    const remaining = totalCells - cells.length;
    for (let day = 1; day <= remaining; day += 1) {
      cells.push({
        day,
        date: new Date(year, month + 1, day),
        currentMonth: false,
      });
    }

    return cells;
  }, [calendarDate]);

  const calendarEvents = useMemo(() => {
    const monthStart = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      1,
    );
    const monthEnd = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    return filteredItems.filter((item) => {
      const start = item?.startDate ? new Date(item.startDate) : null;
      const end = item?.endDate ? new Date(item.endDate) : null;
      if (
        !start ||
        !end ||
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
      )
        return false;
      return start <= monthEnd && end >= monthStart;
    });
  }, [calendarDate, filteredItems]);

  const getCalendarEventsForDate = (date) => {
    if (!date) return [];
    const normalized = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    return calendarEvents.filter((item) => {
      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      const normalizedStart = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
      );
      const normalizedEnd = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate(),
      );
      return normalizedStart <= normalized && normalizedEnd >= normalized;
    });
  };

  const monthLabel = calendarDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const profileName =
    user?.name || user?.fullName || user?.username || "Compliance Team";
  const profileRole =
    user?.role || user?.position || user?.department || "User";
  const profileEmail = user?.email || "No email provided";
  const profileInitials = profileName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const profileImageSrc = user?.imageUrl
    ? `${FILE_BASE_URL}/userimages/${user.imageUrl}`
    : "";

  const highlightMessage = useMemo(() => {
    const name = user?.name || user?.fullName || "Team";
    return `Welcome back, ${name}. Here is the current compliance performance.`;
  }, [user]);

  const metricCards = dashboardCards.map((card) => {
    const Icon = card.icon;
    return (
      <div
        key={card.label}
        className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {card.label}
            </p>
            <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {card.value}
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {card.text}
            </p>
          </div>
          <div
            className={`rounded-xl bg-gradient-to-br ${card.accent} p-3 text-white shadow-sm`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">
            dashboard overview
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-600 dark:text-white sm:text-3xl">
            Compliance Analytics
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {highlightMessage}
          </p>
        </div>
        <div className="relative">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[0.8fr_1.4fr_1.4fr] xl:grid-cols-[0.8fr_1.4fr_1.4fr] xl:items-stretch">
        <div className="">
  <div className="flex h-full items-center justify-center gap-4">
    <div className="relative">
      {profileImageSrc && !imageError ? (
        <img
          src={profileImageSrc}
          alt={profileName}
          className="h-60 w-60 rounded-2xl border-2 border-emerald-500 object-cover shadow-sm dark:border-emerald-400 sm:h-60 sm:w-60 lg:h-72 lg:w-72"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-60 w-60 items-center justify-center rounded-2xl border-2 border-emerald-500 bg-slate-200 text-2xl font-bold text-slate-500 shadow-sm dark:border-emerald-400 dark:bg-slate-700 dark:text-slate-300 sm:h-60 sm:w-60 sm:text-2xl lg:h-72 lg:w-72 lg:text-3xl">
          {profileInitials}
        </div>
      )}
    </div>
  </div>
</div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Compliance Rate
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {stats.compliant} of {stats.total} deadlines compliant
              </p>
            </div>
          </div>
          <div className="mx-auto flex w-full justify-center">
            <div ref={radialChartRef} className="w-full min-h-[260px]" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm sm:p-5">
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
              Status overview
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full table-auto text-left text-sm">
              <colgroup>
                <col className="w-[65%]" />
                <col className="w-[35%]" />
              </colgroup>
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/70">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Compliance Title
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-4 text-center text-slate-500 dark:text-slate-400"
                    >
                      No compliance items
                    </td>
                  </tr>
                ) : (
                  filteredItems.slice(0, 5).map((item, index) => {
                    const status = String(item?.submissionStatus || "Pending Review");
                    const statusColor =
                      status === "Approved"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : status === "Rejected"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";

                    return (
                      <tr
                        key={item.id || index}
                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <td
                          className="max-w-[0] truncate px-4 py-3 text-slate-700 dark:text-slate-200"
                          title={item.title || "Untitled"}
                        >
                          {item.title || "Untitled"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`inline-flex min-w-[88px] justify-end whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {DEFAULT_METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 animate-pulse"
              >
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-3 h-8 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-3 h-3 w-32 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="mt-4 flex justify-end">
                  <Icon className="h-5 w-5 text-slate-200 dark:text-slate-700" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm xl:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Submission trend
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Last 6 months of compliance submissions
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Activity className="h-3.5 w-3.5" />
              Live overview
            </div>
          </div>
          <div ref={lineChartRef} className="w-full min-w-0 overflow-hidden" />
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm xl:col-span-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Calendar
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {monthLabel}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() =>
                  setCalendarDate(
                    new Date(
                      calendarDate.getFullYear(),
                      calendarDate.getMonth() - 1,
                      1,
                    ),
                  )
                }
                className="rounded-full p-1 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCalendarDate(
                    new Date(
                      calendarDate.getFullYear(),
                      calendarDate.getMonth() + 1,
                      1,
                    ),
                  )
                }
                className="rounded-full p-1 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthGrid.map((cell, index) => {
              const cellEvents = getCalendarEventsForDate(cell.date);
              const isTodayCell =
                cell.currentMonth &&
                cell.date.getDate() === new Date().getDate() &&
                cell.date.getMonth() === new Date().getMonth() &&
                cell.date.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={`${cell.date.toISOString()}-${index}`}
                  className={`min-h-[42px] rounded-lg border p-1 text-center ${
                    cell.currentMonth
                      ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                      : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-600"
                  } ${isTodayCell ? "ring-1 ring-emerald-400" : ""}`}
                >
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    {cell.day}
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    {cellEvents.slice(0, 2).map((event, eventIndex) => (
                      <span
                        key={`${event.id}-${eventIndex}`}
                        className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
              <CalendarDays className="h-4 w-4 text-emerald-600" />
              Upcoming items
            </div>
            <div className="mt-2 space-y-1">
              {calendarEvents.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                  <span className="flex-shrink-0 whitespace-nowrap text-[10px] text-slate-500 dark:text-slate-400">
                    {new Date(item.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))}
              {!calendarEvents.length && (
                <div className="text-slate-500 dark:text-slate-400">
                  No compliance items scheduled in this month.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
              Status distribution
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Current approval pipeline
            </p>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center">
            <div className="flex flex-col gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-emerald-500 border-2 border-emerald-600 shadow-sm dark:border-emerald-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">Approved</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-amber-500 border-2 border-amber-600 shadow-sm dark:border-amber-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">Pending Review</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-red-500 border-2 border-red-600 shadow-sm dark:border-red-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">Rejected</span>
              </div>
            </div>
            <div className="flex-1 w-full min-h-[200px] sm:min-h-[250px]" ref={donutChartRef} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
              Operational insight
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Immediate dashboard summary
            </p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 sm:p-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                <Layers3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                Total active records
              </div>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 sm:p-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-600 flex-shrink-0" />
                Approval efficiency
              </div>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {stats.completionRate}%
              </p>
            </div>
            <div className="rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 sm:p-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-600 flex-shrink-0" />
                Follow-up items
              </div>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {stats.rejected}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;