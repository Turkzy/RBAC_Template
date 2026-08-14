import React from "react";
import { X } from "lucide-react";

const DayListModal = ({
  isOpen,
  date,
  events = [],
  onClose,
  onEventClick,
  getColorClassForItem,
}) => {
  if (!isOpen || !date) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-lg border border-white/10 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.35)] dark:bg-slate-900">
        <div className="bg-emerald-900 px-4 py-4 sm:px-6 sm:py-5 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-50/90">List of Compliance</p>
              <h3 className="mt-1 text-base sm:text-lg font-semibold text-white truncate">
                {date.toLocaleDateString("en-US", {
                  month: "long",
                  day: "2-digit",
                  year: "numeric",
                })}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full bg-white/15 p-2 transition hover:bg-white/25 text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="space-y-2 p-4 sm:p-5 overflow-y-auto">
          {events.length ? (
            events.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onEventClick(item)}
                className={`w-full text-left rounded-md px-3 py-4 min-h-[60px] flex items-center ${getColorClassForItem(item)}`}
              >
                <div className="flex items-center justify-between gap-3 w-full min-w-0">
                  <div className="min-w-0 truncate font-semibold">{item.title}</div>
                  <div className="shrink-0 text-[11px] opacity-90 whitespace-nowrap">
                    {new Date(item.startDate).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-sm text-slate-500">No events</div>
          )}
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-md bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white px-4 py-2 text-sm hover:bg-gray-300 dark:hover:bg-slate-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayListModal;