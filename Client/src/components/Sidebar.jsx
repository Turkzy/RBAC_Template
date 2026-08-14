import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const SidebarContext = createContext();

const Sidebar = ({ children, isCollapsed, onBackdropClick }) => {
  const [expandedItems, setExpandedItems] = useState({});
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (isCollapsed) return;
    if (typeof window === "undefined" || window.innerWidth >= 1024) return;

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onBackdropClick?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCollapsed, onBackdropClick]);

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const contextValue = {
    expandedItems,
    toggleExpanded,
    isCollapsed,
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-900/40 sm:hidden transition-opacity duration-300 ${
          isCollapsed ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"
        }`}
      />

      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen z-40 overflow-y-auto overflow-x-hidden bg-white dark:bg-slate-900 
                    border-r border-slate-200 dark:border-slate-800 
                    shadow-xl select-none transition-all duration-300 ease-in-out
                    ${isCollapsed ? "w-0 -translate-x-full opacity-0 lg:w-16 lg:translate-x-0 lg:opacity-100" : "w-72 translate-x-0 opacity-100"}`}
      >
        <nav className="h-full flex flex-col">
          <SidebarContext.Provider value={contextValue}>
            <ul className="flex-1 px-2 sm:px-3 pt-20 pb-6">{children}</ul>
          </SidebarContext.Provider>
        </nav>
      </aside>
    </>
  );
};

export function SidebarItem({
  icon,
  text,
  active,
  notification,
  notificationCount,
  notificationColor = "bg-green-500",
  notificationSide = "right",
  onClick,
  dropdownIcon,
  children,
  expandable = false,
  itemId,
}) {
  const { expandedItems, toggleExpanded, isCollapsed } =
    useContext(SidebarContext);
  const isExpanded = expandedItems[itemId] || false;
  const expandedBadgePositionClass =
    notificationSide === "left"
      ? "left-2 top-1/2 -translate-y-1/2"
      : notificationSide === "upper-right"
        ? "right-2 top-1"
        : "right-2 top-1/2 -translate-y-1/2";
  const collapsedBadgePositionClass =
    notificationSide === "left" ? "-top-1 -left-1" : "-top-1 -right-1";

  const handleClick = () => {
    if (expandable && itemId && !isCollapsed) {
      toggleExpanded(itemId);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <li className="my-1">
      <div
        onClick={handleClick}
        className={`relative flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        } h-10 px-2 sm:px-3 font-medium rounded-md cursor-pointer transition-all duration-200 group 
    text-xs sm:text-sm
    ${
      active
        ? "text-green-600 bg-green-50 dark:bg-green-950/50"
        : "text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`}
        title={isCollapsed ? text : undefined}
      >
        <div className="flex items-center">
          <div
            className={`transition-colors ${
              active
                ? "text-green-600 dark:text-green-400"
                : "text-slate-600 dark:text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400"
            }`}
          >
            {icon}
          </div>

          {!isCollapsed && (
            <span className="ml-3 transition-all duration-300">{text}</span>
          )}
        </div>

        {!isCollapsed && dropdownIcon && (
          <div
            className={`ml-auto transition-transform duration-200 text-slate-500 dark:text-slate-400 ${
              expandable && isExpanded ? "rotate-180" : "rotate-0"
            }`}
          >
            {dropdownIcon}
          </div>
        )}

        {/* Notification - Expanded */}
        {notification && !isCollapsed && (
          <div className={`absolute ${expandedBadgePositionClass} flex items-center`}>
            <span
              className={`inline-flex items-center justify-center rounded-full ${notificationColor} text-white text-[10px] font-semibold transition-all duration-200 ${
                notificationCount > 0
                  ? "min-w-[18px] h-5 px-1"
                  : "w-3 h-3"
              }`}
            >
              {notificationCount > 0
                ? notificationCount > 99
                  ? "99+"
                  : notificationCount
                : ""}
            </span>
          </div>
        )}

        {/* Notification - Collapsed */}
        {notification && isCollapsed && (
          <div className={`absolute ${collapsedBadgePositionClass}`}>
            <span
              className={`inline-flex items-center justify-center rounded-full ${notificationColor} text-white text-[10px] font-semibold transition-all duration-200 ${
                notificationCount > 0
                  ? "min-w-[18px] h-5 px-1"
                  : "w-3 h-3"
              }`}
            >
              {notificationCount > 0
                ? notificationCount > 99
                  ? "99+"
                  : notificationCount
                : ""}
            </span>
          </div>
        )}
      </div>

      {/* Dropdown Children */}
      {expandable && children && !isCollapsed && (
        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ml-4 sm:ml-6 mt-1 space-y-1 ${
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-700">
            {children}
          </ul>
        </div>
      )}
    </li>
  );
}

export default Sidebar;