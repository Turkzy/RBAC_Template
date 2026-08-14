import React from "react";
import { ChevronLeft, ChevronRight, Calendar, Search } from "lucide-react";

const CalendarHeader = ({
  currentDate,
  viewMode,
  viewTitle,
  viewDateRange,
  onPrev,
  onNext,
  onToday,
  onViewModeChange,
}) => (
  <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8 pr-0 sm:pr-4 lg:pr-8">
    <div className="flex-1 min-w-0 flex flex-row items-start sm:items-center gap-3 sm:gap-5 lg:gap-6">
      <div className="flex flex-col items-center rounded-lg overflow-hidden shadow-md w-[60px] sm:w-[70px] lg:w-[76px] flex-shrink-0">
        <div className="w-full bg-slate-600 dark:bg-slate-500 flex items-center justify-center py-1">
          <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
            {currentDate.toLocaleString("en-US", { month: "short" })}
          </span>
        </div>
        <div className="w-full bg-white dark:bg-slate-800 flex items-center justify-center py-1.5 sm:py-2">
          <span className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-600 dark:text-white">
            {currentDate.getDate()}
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <h1 className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-base sm:text-xl lg:text-2xl font-bold text-gray-600 dark:text-white">
          {viewTitle}
          <span className="inline-block bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-[10px] sm:text-xs lg:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-md font-medium">
            {viewMode} view
          </span>
        </h1>
        <p className="text-xs sm:text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1 truncate">
          {viewMode === "Day"
            ? viewDateRange.start
            : `${viewDateRange.start} – ${viewDateRange.end}`}
        </p>
      </div>
    </div>

    <div className="w-full lg:w-auto flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 lg:gap-4">
      <div className="w-full sm:w-[180px] md:w-[220px] relative order-1">
        <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Search"
          className="w-full pl-7 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-gray-400 dark:focus:border-slate-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      <div className="order-2 flex items-center gap-2 sm:gap-3 lg:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous"
            className="p-1.5 sm:p-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next"
            className="p-1.5 sm:p-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={onToday}
          className="px-3 py-1.5 sm:py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap flex-shrink-0"
        >
          Today
        </button>

        <div className="relative inline-flex flex-1 sm:flex-none">
          <select
            value={viewMode}
            onChange={(event) => onViewModeChange(event.target.value)}
            className="w-full sm:w-auto appearance-none rounded-lg border border-gray-200 bg-gray-100 pl-3 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 dark:focus:border-slate-500"
          >
            <option value="Month">Month view</option>
            <option value="Week">Week view</option>
            <option value="Day">Day view</option>
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-300">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default CalendarHeader;