import React, { useState, useEffect, useLayoutEffect } from "react";
import api, { endpoints } from "../config/api.js";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar, { SidebarItem } from "./Sidebar.jsx";
import Header from "./Header.jsx";
import {
  LayoutDashboard,
  Settings,
  FileChartColumnIncreasing,
  Bell,
  CalendarFold,
  FileCog,
  ChevronDown,
  Shield,
  Users,
  Logs,
  SlidersHorizontal,
  BellDot,
  Building2,
  FileStack,
  FileChartPie,
  FileInput,
  Folders,
  Archive,
} from "lucide-react";
import { PERMISSIONS } from "../utils/permissions.js";
import { useAuth } from "../context/AuthContext.jsx";
import useComplianceNotificationStream from "../hooks/useComplianceNotificationStream.js";

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [revisionCount, setRevisionCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const { user, authStatus, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isSuperAdmin = () => {
    const roleName = (user?.role || "").toString().trim().toLowerCase();
    return roleName === "super admin" || roleName.includes("super");
  };

  useLayoutEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
    }
  }, []);

  const fetchPendingApprovalCount = async () => {
    try {
      const currentUserId = Number(user?.id || 0);
      const [allResp, unreadResp] = await Promise.all([
        api.get(endpoints.compliance.list),
        api.get(endpoints.compliance.list, {
          params: {
            unread: true,
            from: new Date().toISOString(),
          },
        }),
      ]);

      const items = allResp?.data?.items || [];
      const unreadItems = unreadResp?.data?.items || [];

      const pendingItems = (items || []).filter(
        (item) =>
          String(item?.submissionStatus || "Pending Review") === "Pending Review" &&
          Array.isArray(item.fileUrls) &&
          item.fileUrls.length > 0,
      );
      setPendingApprovalCount(pendingItems.length);

      const revisionItems = (items || []).filter(
        (item) =>
          String(item?.submissionStatus || "Pending Review") === "Rejected" &&
          Number(item?.submittedBy) === currentUserId,
      );
      setRevisionCount(revisionItems.length);
      setUnreadNotificationCount(unreadItems.length);
    } catch (error) {
      console.error("Failed to fetch pending approval count:", error);
      setPendingApprovalCount(0);
      setRevisionCount(0);
      setUnreadNotificationCount(0);
    }
  };

  useEffect(() => {
    if (!user) {
      setPendingApprovalCount(0);
      return;
    }

    fetchPendingApprovalCount();
  }, [user]);

  useComplianceNotificationStream(() => {
    fetchPendingApprovalCount();
  }, Boolean(user) && authStatus !== "checking");

  const adminItems = [
        {
      permissions: [PERMISSIONS.ORGANIZATION_MANAGE],
      text: "Organization",
      icon: <Building2 className="w-4 h-4" />,
      path: "/admin/organization",
    },
    {
      permissions: [PERMISSIONS.ROLES_MANAGE, PERMISSIONS.PERMISSIONS_MANAGE],
      text: "Access Settings",
      icon: <Shield className="w-4 h-4" />,
      path: "/admin/access-settings",
    },
    {
      permissions: [PERMISSIONS.ACCOUNTS_MANAGE],
      text: "Account Management",
      icon: <Users className="w-4 h-4" />,
      path: "/admin/account",
    },
    {
      permissions: [PERMISSIONS.NOTIFICATIONS_RULES_MANAGE],
      text: "Notification Rules",
      icon: <BellDot className="w-4 h-4" />,
      path: "/admin/notification-rules",
    }
  ];

  const visibleAdminItems = adminItems.filter((item) =>
    isSuperAdmin() || item.permissions.some((perm) => hasPermission(perm)),
  );

  const canManageDocuments = isSuperAdmin() || hasPermission(PERMISSIONS.DOCUMENTS_MANAGE);
  const canSubmitDocuments = isSuperAdmin() || hasPermission(PERMISSIONS.SUBMIT_DOCUMENTS);
  const canAccessDocumentsMenu = canManageDocuments || canSubmitDocuments;
  const canManageCompliance = isSuperAdmin() || hasPermission(PERMISSIONS.COMPLIANCE_MANAGE);
  const documentsBadgeCount =
    (canManageDocuments ? pendingApprovalCount : 0) +
    (canSubmitDocuments ? revisionCount : 0);

  const canAccessAdminTool = isSuperAdmin() || visibleAdminItems.length > 0;

  useEffect(() => {
    if (
      location.pathname.includes("/admin/") &&
      !canAccessAdminTool // ← Now checks any admin permission
    ) {
      navigate("/", { replace: true });
    }
  }, [user, location.pathname, canAccessAdminTool, navigate]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setIsSidebarCollapsed(true);
    }
  };

  // Replace your current isActive function with this:
  const isActive = (path) => {
    if (!path) return false;

    // Root path
    if (path === "/") {
      return location.pathname === "/" || location.pathname === "";
    }

    const cleanPath = (p) => p.replace(/\/$/, ""); // remove trailing slash

    const current = cleanPath(location.pathname + location.hash);
    const target = cleanPath(path.startsWith("/") ? path : "/" + path);

    return current === target || current.startsWith(target + "/");
  };

  if (authStatus === "checking") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-950">
      <Header
        onToggleSidebar={toggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
        onProfileSettings={() => navigate("/profile-settings")}
      />

      <Sidebar isCollapsed={isSidebarCollapsed} onBackdropClick={toggleSidebar}>
        <SidebarItem
          icon={<LayoutDashboard className="w-5 h-5" />}
          text="Dashboard"
          active={isActive("/")}
          onClick={() => handleNavigate("/")}
        />
        <SidebarItem
          icon={<FileChartColumnIncreasing className="w-5 h-5" />}
          text="Compliance"
          active={isActive("compliance") || isActive("compliance/manage") || isActive("compliance/status")}
          expandable={true}
          itemId="compliance"
          dropdownIcon={<ChevronDown className="w-4 h-4" />}
        >
          {canManageCompliance && (
            <SidebarItem
              icon={<FileCog className="w-4 h-4" />}
              text="Manage Compliance"
              active={isActive("compliance/manage")}
              onClick={() => handleNavigate("/compliance/manage")}
            />
          )}
          <SidebarItem
            icon={<FileChartPie className="w-4 h-4" />}
            text="Compliance Status"
            active={isActive("compliance/status")}
            onClick={() => handleNavigate("/compliance/status")}
          />
        </SidebarItem>
        {canAccessDocumentsMenu && (
          <SidebarItem
            icon={<Folders className="w-5 h-5" />}
            text="Documents"
            active={isActive("documentmanagement") || isActive("submitted-documents")}
            notification={documentsBadgeCount > 0}
            notificationCount={0}
            notificationColor="bg-red-500"
            notificationSide="upper-right"
            expandable={true}
            itemId="documents"
            dropdownIcon={<ChevronDown className="w-4 h-4" />}
          >
            {canManageDocuments && (
              <SidebarItem
                icon={<FileStack className="w-4 h-4" />}
                text="Document Management"
                active={isActive("documentmanagement")}
                onClick={() => handleNavigate("/documentmanagement")}
                notification={pendingApprovalCount > 0}
                notificationCount={pendingApprovalCount}
                notificationColor="bg-red-500"
              />
            )}
            {canSubmitDocuments && (
              <SidebarItem
                icon={<FileInput className="w-4 h-4" />}
                text="Submitted Documents"
                active={isActive("submitted-documents")}
                onClick={() => handleNavigate("/submitted-documents")}
                notification={revisionCount > 0}
                notificationCount={revisionCount}
                notificationColor="bg-red-500"
              />
            )}
          </SidebarItem>
        )}
        <SidebarItem
          icon={<CalendarFold className="w-5 h-5" />}
          text="Calendar"
          active={isActive("calendar")}
          onClick={() => handleNavigate("/calendar")}
        />
        <SidebarItem
          icon={<Bell className="w-5 h-5" />}
          text="Notification"
          active={isActive("notification")}
          onClick={() => handleNavigate("/notification")}
          notification={unreadNotificationCount > 0}
          notificationCount={unreadNotificationCount}
          notificationColor="bg-red-500"
        />
        {hasPermission(PERMISSIONS.SYSTEM_SETTINGS_MANAGE) && (
          <SidebarItem
            icon={<SlidersHorizontal className="w-5 h-5" />}
            text="System Settings"
            active={isActive("system-settings")}
            onClick={() => handleNavigate("/system-settings")}
          />
        )}

        {hasPermission(PERMISSIONS.AUDIT_LOGS_VIEW) && (
          <SidebarItem
            icon={<FileCog className="w-5 h-5" />}
            text="Audit"
            active={isActive("audit")}
            expandable={true}
            itemId="audit"
            dropdownIcon={<ChevronDown className="w-4 h-4" />}
          >
            <SidebarItem
              icon={<Logs className="w-4 h-4" />}
              text="Activity Logs"
              active={isActive("audit/activity-logs")}
              onClick={() => handleNavigate("/audit/activity-logs")}
            />
            <SidebarItem
              icon={<Archive className="w-4 h-4" />}
              text="Records"
              active={isActive("audit/records")}
              onClick={() => handleNavigate("/audit/records")}
            />
          </SidebarItem>
        )}

        {/* Improved Admin Tool Section */}
        {canAccessAdminTool && (
          <SidebarItem
            icon={<Settings className="w-5 h-5" />}
            text="Admin Tool"
            active={
              isActive("admin/account") || isActive("admin/access-settings") || isActive("admin/notification-rules")
            }
            expandable={true}
            itemId="admin"
            dropdownIcon={<ChevronDown className="w-4 h-4" />}
          >
            {visibleAdminItems.map((item) => (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                text={item.text}
                active={isActive(item.path)}
                onClick={() => handleNavigate(item.path)}
              />
            ))}
          </SidebarItem>
        )}
      </Sidebar>

      {/* Main Content Area */}
      <div
        className={`flex-1 min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-0 lg:ml-16" : "md:ml-72 lg:ml-72"
        }`}
      >
        <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 pt-24 [&_*]:scroll-mt-24">
          <div key={location.pathname} className="page-transition">
            <Outlet />
          </div>
        </main>

        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 select-none">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-2 items-center text-center sm:flex-row sm:items-center sm:justify-between sm:text-left text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <span>
              © 2026 National Development Company. All rights reserved.
            </span>
            <span className="text-slate-500 dark:text-slate-500 font-medium">
              Developed by{" "}
              <a
                href="https://turkzydev.vercel.app"
                className="font-medium text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                TurkzyDev
              </a>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;