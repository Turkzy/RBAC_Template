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
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 sm:hidden pointer-events-none"
        />
      )}

      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen z-40 bg-white dark:bg-slate-900 
                    border-r border-slate-200 dark:border-slate-800 
                    shadow-xl select-none transition-all duration-300 ease-in-out 
                    ${isCollapsed ? "w-16" : "w-72"}`}
      >
        <nav className="h-full flex flex-col">
          <SidebarContext.Provider value={contextValue}>
            <ul className="flex-1 px-2 sm:px-3 pt-20">{children}</ul>
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
  onClick,
  dropdownIcon,
  children,
  expandable = false,
  itemId,
}) {
  const { expandedItems, toggleExpanded, isCollapsed } =
    useContext(SidebarContext);
  const isExpanded = expandedItems[itemId] || false;

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
          <div className="absolute right-2 flex items-center">
            <span
              className={`w-3 h-3 rounded-full ${notificationColor} animate-pulse`}
            ></span>
            {notificationCount > 0 && (
              <span
                className={`ml-1 text-xs bg-green-500 text-white rounded-full px-1.5 py-0.5`}
              >
                {notificationCount}
              </span>
            )}
          </div>
        )}

        {/* Notification - Collapsed */}
        {notification && isCollapsed && (
          <div className="absolute -top-1 -right-1">
            <span
              className={`w-3 h-3 rounded-full ${notificationColor} animate-pulse`}
            ></span>
            {notificationCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 text-xs bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]`}
              >
                {notificationCount}
              </span>
            )}
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