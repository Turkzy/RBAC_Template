import React from "react";
import { X, Check, Loader2 } from "lucide-react";

const formatGroupName = (groupKey) =>
  groupKey
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const PermissionChecklist = ({ permissions, selectedIds, onToggle }) => {
  const groups = Object.entries(
    permissions.reduce((acc, permission) => {
      const [groupKey] = permission.name.split(".");
      acc[groupKey] = acc[groupKey] || [];
      acc[groupKey].push(permission);
      return acc;
    }, {})
  ).map(([groupKey, items]) => ({
    groupKey,
    label: formatGroupName(groupKey),
    items,
  }));

  const toggleGroup = (groupItems) => {
    const allSelected = groupItems.every((permission) => selectedIds.includes(permission.id));
    groupItems.forEach((permission) => {
      const selected = selectedIds.includes(permission.id);
      if (allSelected && selected) {
        onToggle(permission.id);
      } else if (!allSelected && !selected) {
        onToggle(permission.id);
      }
    });
  };

  if (permissions.length === 0) {
    return (
      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
        <p className="text-sm text-slate-400 dark:text-slate-500">
          No permissions available. Create one first.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-1 lg:grid-cols-2">
      {groups.map(({ groupKey, label, items }) => {
        const allSelected = items.every((permission) => selectedIds.includes(permission.id));
        return (
          <div key={groupKey} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                {label}
              </p>
              <button
                type="button"
                onClick={() => toggleGroup(items)}
                className="shrink-0 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {allSelected ? "Clear All" : "Select All"}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {items.map((permission) => {
                const checked = selectedIds.includes(permission.id);
                return (
                  <label
                    key={permission.id}
                    className={`flex items-center justify-between gap-3 px-3 py-3 rounded-lg border cursor-pointer transition-colors ${
                      checked
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(permission.id)}
                        className="accent-emerald-500 w-4 h-4 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                          {permission.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {permission.name}
                        </p>
                      </div>
                    </div>
                    {checked ? (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap shrink-0">
                        Selected
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AssignPermissionModal = ({
  role,
  permissions,
  selectedIds,
  onToggle,
  onClose,
  onSubmit,
  submitting,
}) => {
  if (!role) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
        <div
          className="w-full max-w-sm sm:max-w-2xl lg:max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 pointer-events-auto max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900">
            <h3 className="min-w-0 truncate font-semibold text-sm sm:text-base text-slate-800 dark:text-white">
              Assign Permissions — {role.name}
            </h3>
            <button
              onClick={onClose}
              className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={16} className="text-slate-500" />
            </button>
          </div>

          <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Permissions for this role
              </label>
              <PermissionChecklist
                permissions={permissions}
                selectedIds={selectedIds}
                onToggle={onToggle}
              />
            </div>
          </div>

          <div className="px-4 sm:px-6 pb-3 sm:pb-5 pt-3 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              disabled={submitting}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-60 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium transition-colors"
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              {submitting ? "Saving..." : "Save Assignments"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignPermissionModal;