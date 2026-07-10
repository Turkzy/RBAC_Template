import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import logo from "../assets/ndc_logo.png";
import { FILE_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext.jsx";

const Header = ({ isSidebarCollapsed, onProfileSettings, onToggleSidebar }) => {
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
    setShowUserMenu(false);
    if (onProfileSettings) onProfileSettings();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.dispatchEvent(
      new CustomEvent("app:refresh", {
        detail: { pathname: location.pathname },
      })
    );
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <header className="fixed top-0 left-0 w-full h-16 z-50 bg-white dark:bg-gray-900 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-800 select-none transition-colors">
      <div className="flex items-center justify-between px-2 sm:px-4 py-3 h-16 gap-2">
        {/* Left Section: Toggle Button + Logo/Title grouped together */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <Menu size={20} className="text-gray-700 dark:text-gray-300" />
            ) : (
              <ChevronLeft
                size={20}
                className="text-gray-700 dark:text-gray-300"
              />
            )}
          </button>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src={logo}
              alt="NDC Logo"
              className="h-10 sm:h-12 lg:h-14 w-auto object-contain flex-shrink-0"
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
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            title="Refresh current page"
            aria-label="Refresh current page"
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
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-gray-600 dark:text-gray-300" />
            )}
          </button>
          {/* Notification */}
          <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
            <BellRing size={20} className="text-gray-600 dark:text-gray-300" />
          </button>

          

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label="User menu"
            >
              {user?.imageUrl && !imageError ? (
                <img
                  src={`${FILE_BASE_URL}/userimages/${user.imageUrl}`}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover border-2 border-green-500"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-green-400">
                  {getUserInitials()}
                </div>
              )}
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden py-1">
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