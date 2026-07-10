import React, { useState, useEffect, useLayoutEffect } from "react";
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
  Files,
  ChevronDown,
  Shield,
  Users,
  Logs,
  SlidersHorizontal,
} from "lucide-react";
import { PERMISSIONS } from "../utils/permissions.js";
import { useAuth } from "../context/AuthContext.jsx";

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user, authStatus, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isSuperAdmin = () => {
    const roleName = (user?.role || "").toString().trim().toLowerCase();
    return roleName === "super admin" || roleName.includes("super");
  };

  useLayoutEffect(() => {
    if (window.innerWidth < 640) {
      setIsSidebarCollapsed(true);
    }
  }, []);

  const adminItems = [
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
  ];

  const visibleAdminItems = adminItems.filter((item) =>
    isSuperAdmin() || item.permissions.some((perm) => hasPermission(perm)),
  );

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

    const current = cleanPath(location.pathname);
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
          active={isActive("compliance")}
          onClick={() => handleNavigate("/compliance")}
        />
        <SidebarItem
          icon={<CalendarFold className="w-5 h-5" />}
          text="Calendar"
          active={isActive("calendar")}
          onClick={() => handleNavigate("/calendar")}
        />
        {hasPermission(PERMISSIONS.DOCUMENTS_MANAGE) && (
          <SidebarItem
            icon={<Files className="w-5 h-5" />}
            text="Document Management"
            active={isActive("documentmanagement")}
            onClick={() => handleNavigate("/documentmanagement")}
          />
        )}
        <SidebarItem
          icon={<Bell className="w-5 h-5" />}
          text="Notification"
          active={isActive("notification")}
          onClick={() => handleNavigate("/notification")}
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
          </SidebarItem>
        )}

        {/* Improved Admin Tool Section */}
        {canAccessAdminTool && (
          <SidebarItem
            icon={<Settings className="w-5 h-5" />}
            text="Admin Tool"
            active={
              isActive("admin/account") || isActive("admin/access-settings")
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
                active={isActive(item.path)} // ← Most important
                onClick={() => handleNavigate(item.path)}
              />
            ))}
          </SidebarItem>
        )}
      </Sidebar>

      {/* Main Content Area */}
      <div
        className={`flex-1 min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? "sm:ml-16 lg:ml-16" : "lg:ml-72"
        }`}
      >
        <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 pt-24 [&_*]:scroll-mt-24">
          <Outlet />
        </main>

        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 select-none">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-2 items-center text-center sm:flex-row sm:items-center sm:justify-between sm:text-left text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <span>
              © 2026 National Development Company. All rights reserved.
            </span>
            <span className="text-slate-500 dark:text-slate-500 font-medium">
              Developed by{" "}
              <a
                href="https://johnalbertsison.vercel.app/"
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
