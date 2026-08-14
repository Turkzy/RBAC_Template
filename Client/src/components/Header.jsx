import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BellRing,
  Sun,
  Moon,
  Menu,
  LogOut,
  UserCircle,
  ChevronLeft,
  RefreshCw,
  X,
  Check,
  MoreHorizontal,
  Info,
} from "lucide-react";
import api, { endpoints } from "../config/api";
import logo from "../assets/ndc_logo.png";
import { FILE_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext.jsx";
import useComplianceNotificationStream from "../hooks/useComplianceNotificationStream.js";

const Header = ({ isSidebarCollapsed, onProfileSettings, onToggleSidebar }) => {
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userMenuClosing, setUserMenuClosing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationClosing, setNotificationClosing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showManualDownloadPopover, setShowManualDownloadPopover] = useState(false);
  const [manualDownloadProgress, setManualDownloadProgress] = useState(0);
  const [manualDownloadStatus, setManualDownloadStatus] = useState("Preparing download...");
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(null);
  const [notificationActionError, setNotificationActionError] = useState(null);
  const [activeNotificationMenuId, setActiveNotificationMenuId] = useState(null);
  const [activeNotificationMenuStyle, setActiveNotificationMenuStyle] = useState(null);
  const notificationButtonRef = useRef(null);
  const notificationPopoverRef = useRef(null);
  const userMenuButtonRef = useRef(null);
  const userMenuRef = useRef(null);
  const currentUserId = Number(user?.id || 0);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    setDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Reset image error state whenever the user (or their avatar) changes
  useEffect(() => {
    setImageError(false);
  }, [user?.imageUrl]);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) return user.firstName[0].toUpperCase();
    if (user.username) return user.username[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return "U";
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    return user.username || user.email || "User";
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    navigate("/logout");
  };

  const handleProfileSettings = () => {
    setUserMenuClosing(false);
    setShowUserMenu(false);
    if (onProfileSettings) onProfileSettings();
  };

  const closeNotifications = () => {
    if (!showNotifications) return;
    setNotificationClosing(true);
    window.setTimeout(() => {
      setShowNotifications(false);
      setNotificationClosing(false);
    }, 180);
  };

  const closeUserMenu = () => {
    if (!showUserMenu) return;
    setUserMenuClosing(true);
    window.setTimeout(() => {
      setShowUserMenu(false);
      setUserMenuClosing(false);
    }, 180);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const handleDownloadManual = async () => {
    setShowManualDownloadPopover(true);
    setManualDownloadProgress(12);
    setManualDownloadStatus("Checking user manual...");

    try {
      const base = import.meta?.env?.BASE_URL || '/';
      const filename = 'CMS USER MANUAL.pdf';
      const candidates = [
        `${base}${filename}`,
        `${base}assets/${filename}`,
        `/${filename}`,
        `/assets/${filename}`,
      ].map((p) => encodeURI(p));

      setManualDownloadProgress(30);
      setManualDownloadStatus("Looking for the file...");

      let foundUrl = null;
      for (const url of candidates) {
        try {
          const resp = await fetch(url, { method: 'HEAD' });
          if (resp.ok) {
            foundUrl = url;
            break;
          }
        } catch (e) {
          // ignore network errors for this probe
        }
      }

      setManualDownloadProgress(65);
      setManualDownloadStatus("Preparing download...");

      const finalUrl = foundUrl || encodeURI(`${base}${filename}`);

      const a = document.createElement('a');
      a.href = finalUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = '';
      document.body.appendChild(a);
      a.click();
      a.remove();

      setManualDownloadProgress(100);
      setManualDownloadStatus("Download started");
      window.setTimeout(() => {
        setShowManualDownloadPopover(false);
        setManualDownloadProgress(0);
      }, 1200);
    } catch (err) {
      console.error('Failed to download manual', err);
      setManualDownloadProgress(100);
      setManualDownloadStatus("Failed to start download");
      window.setTimeout(() => {
        setShowManualDownloadPopover(false);
        setManualDownloadProgress(0);
      }, 1800);

      try {
        const base = import.meta?.env?.BASE_URL || '/';
        window.open(`${base}CMS%20USER%20MANUAL.pdf`, '_blank');
      } catch {}
    }
  };

  const fetchNotifications = async () => {
    setNotifLoading(true);
    setNotifError(null);
    setNotificationActionError(null);
    try {
      const today = new Date();
      const resp = await api.get(endpoints.compliance.list, { params: { from: today.toISOString(), unread: true } });
      const loadedItems = resp?.data?.items || [];
      setNotifications(loadedItems);
      return loadedItems;
    } catch (err) {
      setNotifError(err.message || "Failed to load");
      setNotifications([]);
      return [];
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    if (showNotifications) fetchNotifications();
  }, [showNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!showNotifications) {
      setNotificationActionError(null);
    }
  }, [showNotifications]);

  useComplianceNotificationStream(() => {
    fetchNotifications();
  }, Boolean(user));

  useEffect(() => {
    if (!showNotifications) {
      setActiveNotificationMenuId(null);
      setActiveNotificationMenuStyle(null);
    }
  }, [showNotifications]);

  useEffect(() => {
    if (!showNotifications && !showUserMenu) return undefined;

    const handleClickOutside = (event) => {
      const target = event.target;

      if (
        (showNotifications || notificationClosing) &&
        notificationPopoverRef.current &&
        notificationButtonRef.current &&
        !notificationPopoverRef.current.contains(target) &&
        !notificationButtonRef.current.contains(target)
      ) {
        closeNotifications();
        setActiveNotificationMenuId(null);
      }

      if (
        (showUserMenu || userMenuClosing) &&
        userMenuRef.current &&
        userMenuButtonRef.current &&
        !userMenuRef.current.contains(target) &&
        !userMenuButtonRef.current.contains(target)
      ) {
        closeUserMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications, showUserMenu]);

  // --- Notification helpers -------------------------------------------------

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

  const getDueSubtitleClass = (endDate) => {
    const due = new Date(endDate);
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const dueMid = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const nowMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((dueMid - nowMid) / msPerDay);

    if (diffDays <= 0) {
      return "text-red-600 dark:text-red-400";
    }

    if (diffDays === 1) {
      return "text-orange-600 dark:text-orange-400";
    }

    return "text-amber-600 dark:text-amber-400";
  };

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

  const getDeadlineColorClass = (item) => {
    if (!item) return "bg-emerald-600";

    const ci = item.colorIndex;
    if (ci === 0 || ci) {
      const i = Number(ci) % DEADLINE_COLOR_CLASSES.length;
      return DEADLINE_COLOR_CLASSES[i].split(" ")[0];
    }

    const id = item.id;
    let idx = 0;
    if (typeof id === "number") {
      idx = Math.abs(id) % DEADLINE_COLOR_CLASSES.length;
    } else if (typeof id === "string") {
      let sum = 0;
      for (let i = 0; i < id.length; i += 1) sum += id.charCodeAt(i);
      idx = sum % DEADLINE_COLOR_CLASSES.length;
    } else {
      idx = Math.floor(Math.random() * DEADLINE_COLOR_CLASSES.length);
    }
    return DEADLINE_COLOR_CLASSES[idx].split(" ")[0];
  };

  const urgencyStyles = {
    overdue: {
      dot: "bg-red-500",
      chip: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      bar: "bg-red-500",
      label: "text-red-600 dark:text-red-400",
    },
    today: {
      dot: "bg-amber-500",
      chip: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      bar: "bg-amber-500",
      label: "text-amber-600 dark:text-amber-400",
    },
    soon: {
      dot: "bg-amber-500",
      chip: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      bar: "bg-amber-500",
      label: "text-amber-600 dark:text-amber-400",
    },
    upcoming: {
      dot: "bg-emerald-500",
      chip: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      bar: "bg-emerald-500",
      label: "text-slate-500 dark:text-slate-400",
    },
  };

  const getUserFullName = (person) => {
    if (!person) return "User";
    const fullName = [person.firstName, person.middleName, person.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return fullName || person.username || person.email || "User";
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
      const submitterName = getUserFullName(item?.submitter);
      return {
        section: "Submissions",
        subtitle: `${submitterName} submitted document(s)`,
        subtitleClass: "text-sky-600 dark:text-sky-400",
        route: "/documentmanagement",
        indicatorClass: "bg-sky-500",
      };
    }

    const isSubmitterDecisionAlert =
      currentUserId > 0 &&
      Number(item?.submittedBy) === currentUserId &&
      (status === "Approved" || status === "Rejected");

    if (isSubmitterDecisionAlert) {
      const decisionText = status === "Approved" ? "Submission approved" : "Submission rejected";
      return {
        section: "Review updates",
        subtitle: decisionText,
        subtitleClass:
          status === "Approved"
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-rose-600 dark:text-rose-400",
        route: "/submitted-documents",
        indicatorClass: status === "Approved" ? "bg-emerald-500" : "bg-rose-500",
      };
    }

    const urgency = getUrgency(item?.endDate);
    const deadlineSection =
      urgency === "overdue"
        ? "Overdue"
        : urgency === "today" || urgency === "soon"
          ? "Due soon"
          : "Upcoming";

    return {
      section: deadlineSection,
      subtitle: formatRelativeDue(item?.endDate),
      subtitleClass: getDueSubtitleClass(item?.endDate),
      route: "/calendar",
      indicatorClass: getDeadlineColorClass(item),
    };
  };

  const unreadNotifications = notifications.filter((item) => item.read !== true);
  const visibleUnreadNotifications = unreadNotifications;

  const groupedNotifications = unreadNotifications.reduce((groups, item) => {
    const meta = getNotificationMeta(item);
    const key = meta.section;
    if (!groups[key]) groups[key] = [];
    groups[key].push({ ...item, meta });
    return groups;
  }, {});

  const sectionOrder = ["Submissions", "Review updates", "Overdue", "Due soon", "Upcoming"];
  const unreadCount = unreadNotifications.length;

  const markAllNotificationsRead = async () => {
    try {
      await api.patch(endpoints.compliance.markAllRead);
      setNotificationActionError(null);
      await fetchNotifications();
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Failed to mark all notifications read";
      setNotificationActionError(message);
      console.error("Failed to mark all notifications read:", err);
    }
  };

  const openNotificationMenu = (notificationId, anchorRect) => {
    if (!anchorRect) return;

    const menuWidth = 176;
    const menuHeight = 86;
    const gap = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const fitsBelow = anchorRect.bottom + gap + menuHeight <= viewportHeight;
    const top = fitsBelow
      ? anchorRect.bottom + gap
      : Math.max(gap, anchorRect.top - gap - menuHeight);
    const left = Math.min(
      Math.max(gap, anchorRect.right - menuWidth),
      viewportWidth - menuWidth - gap,
    );

    setActiveNotificationMenuId(notificationId);
    setActiveNotificationMenuStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      width: `${menuWidth}px`,
      zIndex: 80,
    });
  };

  const closeNotificationMenu = () => {
    setActiveNotificationMenuId(null);
    setActiveNotificationMenuStyle(null);
  };

  const markNotificationRead = async (id) => {
    try {
      const markReadPath = endpoints?.compliance?.markRead?.(id);
      if (!markReadPath || typeof markReadPath !== "string") {
        throw new Error("Invalid mark-read endpoint path");
      }

      const resp = await api.patch(markReadPath);
      if (resp?.data?.error) {
        throw new Error(resp?.data?.message || "Server rejected the read update");
      }

      setNotificationActionError(null);
      closeNotificationMenu();

      const refreshedItems = await fetchNotifications();
      const stillUnread = refreshedItems.some(
        (item) => Number(item?.id) === Number(id) && item.read !== true,
      );

      if (stillUnread) {
        setNotificationActionError("The server did not persist the read state for this notification.");
        return false;
      }

      return true;
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Failed to mark notification read";
      setNotificationActionError(message);
      console.error("Failed to mark notification read:", err);
      return false;
    }
  };

  const deleteNotification = async (id) => {
    try {
      const deletePath = typeof endpoints?.compliance?.deleteNotification === "function"
        ? endpoints.compliance.deleteNotification(id)
        : endpoints?.compliance?.deleteNotification;

      if (!deletePath || typeof deletePath !== "string") {
        throw new Error("Invalid delete notification endpoint path");
      }

      const resp = await api.delete(deletePath);
      if (resp?.data?.error) {
        throw new Error(resp?.data?.message || "Server rejected the notification delete");
      }

      setNotificationActionError(null);
      closeNotificationMenu();
      await fetchNotifications();
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Failed to delete notification";
      setNotificationActionError(message);
      console.error("Failed to delete notification:", err);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full h-16 z-50 bg-white dark:bg-gray-900 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-800 select-none transition-colors">
      <div className="flex items-center justify-between gap-1 px-1.5 py-2 sm:gap-2 sm:px-4 sm:py-3 h-16">
        {/* Left Section: Toggle Button + Logo/Title grouped together */}
        <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0 sm:p-2"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <Menu size={18} className="text-gray-700 dark:text-gray-300 sm:w-5 sm:h-5" />
            ) : (
              <ChevronLeft
                size={18}
                className="text-gray-700 dark:text-gray-300 sm:w-5 sm:h-5"
              />
            )}
          </button>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src={logo}
              alt="NDC Logo"
              className="h-8 w-auto object-contain flex-shrink-0 sm:h-10 lg:h-14"
            />
            <div className="hidden sm:block min-w-0">
              <h2 className="text-sm md:text-base lg:text-lg font-tahoma text-gray-800 dark:text-white truncate">
                NDC CMS
              </h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-tahoma truncate">
                Compliance Monitoring System
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 min-w-0">
          <div className="relative">
            <button
              onClick={handleDownloadManual}
              className="rounded-xl p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 sm:p-2.5"
              title="Download User Manual"
              aria-label="User Manual"
            >
              <Info 
                size={16} 
                className={"text-gray-600 dark:text-gray-300 sm:w-[18px] sm:h-[18px]"}
              />
            </button>

            {showManualDownloadPopover && (
              <div className="absolute right-0 top-full z-[70] mt-2 w-[220px] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Download
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {manualDownloadProgress}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-300"
                    style={{ width: `${manualDownloadProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                  {manualDownloadStatus}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleRefresh}
            className="rounded-xl p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 sm:p-2.5"
            title="Refresh page"
            aria-label="Refresh page"
            disabled={isRefreshing}
          >
            <RefreshCw 
              size={18} 
              className={`text-gray-600 dark:text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-xl p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 sm:p-2.5"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun size={18} className="text-yellow-500 sm:w-5 sm:h-5" />
            ) : (
              <Moon size={18} className="text-gray-600 dark:text-gray-300 sm:w-5 sm:h-5" />
            )}
          </button>
          {/* Notification */}
          <button
            ref={notificationButtonRef}
            onClick={() => {
              if (showNotifications) {
                closeNotifications();
              } else {
                setNotificationClosing(false);
                setShowNotifications(true);
              }
            }}
            className="relative rounded-xl p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 sm:p-2.5"
            aria-label="Notifications"
            title="Notifications"
            aria-expanded={showNotifications}
          >
            <BellRing size={18} className="text-gray-600 dark:text-gray-300 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-semibold leading-4 text-center ring-1 ring-white dark:ring-gray-900 sm:min-w-[16px] sm:text-[10px] sm:ring-2">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {(showNotifications || notificationClosing) && (
            <>
              <div
                className={`absolute top-full z-50 mt-2 right-2 sm:right-4 ${notificationClosing ? "animate-[fadeOutUp_0.18s_ease-in_forwards]" : "animate-[fadeInUp_0.18s_ease-out]"}`}
                ref={notificationPopoverRef}
              >
                <div className="w-[92vw] max-w-[400px] rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Notifications
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {unreadCount > 0
                          ? `${unreadCount} alert${unreadCount === 1 ? "" : "s"}`
                          : "You're all caught up"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      
                      
                      <button
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => fetchNotifications()}
                        title="Refresh notifications"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                        onClick={markAllNotificationsRead}
                        title="Mark all read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                        onClick={closeNotifications}
                        aria-label="Close notifications"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="max-h-[420px] overflow-y-auto">
                    {notificationActionError && (
                      <div className="mx-4 mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                        {notificationActionError}
                      </div>
                    )}

                    {notifLoading ? (
                      <div className="p-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Loading notifications…
                      </div>
                    ) : notifError ? (
                      <div className="p-6 text-center text-sm text-red-500">
                        {notifError}
                      </div>
                    ) : visibleUnreadNotifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="mx-auto mb-3 w-11 h-11 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="text-sm font-medium text-gray-700 dark:text-slate-200">
                          Nothing due right now
                        </div>
                        <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                          New deadlines will show up here.
                        </div>
                      </div>
                    ) : (
                      sectionOrder
                        .filter((section) => groupedNotifications[section]?.length)
                        .map((section) => (
                          <div key={section}>
                            <div className="sticky top-0 px-4 pt-3 pb-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
                              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                                {section}
                              </span>
                            </div>
                            <ul>
                              {groupedNotifications[section].map((it) => {
                                const meta = it.meta || getNotificationMeta(it);
                                const isMenuOpen = activeNotificationMenuId === it.id;
                                return (
                                  <li key={it.id} className="px-2">
                                    <div className="relative flex items-center gap-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800/70 transition-colors p-2">
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          const success = await markNotificationRead(it.id);
                                          if (!success) return;
                                          setShowNotifications(false);
                                          if (meta.route === "/calendar") {
                                            navigate(meta.route, {
                                              state: { openDetailsForComplianceId: it.id },
                                            });
                                          } else {
                                            navigate(meta.route);
                                          }
                                        }}
                                        className="min-w-0 flex-1 text-left"
                                      >
                                        <div className="flex items-start gap-3">
                                          <span className={`mt-0.5 w-1 self-stretch rounded-full ${meta.indicatorClass}`} />
                                          <div className="min-w-0">
                                            <div className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                                              {it.title}
                                            </div>
                                            <div className={`text-xs font-medium mt-0.5 ${meta.subtitleClass}`}>
                                              {meta.subtitle}
                                            </div>
                                          </div>
                                        </div>
                                      </button>

                                      <div className="relative flex-shrink-0">
                                        <button
                                          type="button"
                                          aria-label="Notification options"
                                          className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            const buttonRect = event.currentTarget.getBoundingClientRect();

                                            if (activeNotificationMenuId === it.id) {
                                              closeNotificationMenu();
                                              return;
                                            }

                                            openNotificationMenu(it.id, buttonRect);
                                          }}
                                        >
                                          <MoreHorizontal className="w-4 h-4" />
                                        </button>

                                        {isMenuOpen && (
                                          <div
                                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden"
                                            style={activeNotificationMenuStyle || undefined}
                                          >
                                            <button
                                              type="button"
                                              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                              onClick={async (event) => {
                                                event.stopPropagation();
                                                await markNotificationRead(it.id);
                                              }}
                                            >
                                              Mark as read
                                            </button>
                                            <button
                                              type="button"
                                              className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                                              onClick={async (event) => {
                                                event.stopPropagation();
                                                await deleteNotification(it.id);
                                              }}
                                            >
                                              Delete notification
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Footer */}
                  {visibleUnreadNotifications.length > 0 && (
                    <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-950/40">
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-xs font-medium text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                      >
                        Mark all read
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNotifications(false);
                          navigate("/notification");
                        }}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors"
                      >
                        View all
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          

          {/* User Menu */}
          <div className="relative">
            <button
              ref={userMenuButtonRef}
              onClick={() => {
                if (showUserMenu) {
                  closeUserMenu();
                } else {
                  setUserMenuClosing(false);
                  setShowUserMenu(true);
                }
              }}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label="User menu"
            >
              {user?.imageUrl && !imageError ? (
                <img
                  src={`${FILE_BASE_URL}/userimages/${user.imageUrl}`}
                  alt="Profile"
                  className="h-8 w-8 rounded-full border-2 border-green-500 object-cover sm:h-9 sm:w-9"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white ring-2 ring-green-400 ring-offset-2 ring-offset-white dark:bg-green-500 dark:ring-offset-gray-900 sm:h-9 sm:w-9">
                  {getUserInitials()}
                </div>
              )}
            </button>

            {/* Dropdown */}
            {(showUserMenu || userMenuClosing) && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={closeUserMenu}
                />
                <div ref={userMenuRef} className={`absolute right-0 mt-2 w-[90vw] max-w-[14rem] sm:w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden py-1 ${userMenuClosing ? "animate-[fadeOutUp_0.18s_ease-in_forwards]" : "animate-[fadeInUp_0.18s_ease-out]"}`}>
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getUserDisplayName()}
                    </p>
                    {user?.email && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    )}
                  </div>

                  <div className="p-2">
                    <button
                      onClick={handleProfileSettings}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <UserCircle className="w-5 h-5" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;