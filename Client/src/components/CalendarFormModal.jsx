import React from "react";
import { X, ChevronDown } from "lucide-react";

const CalendarFormModal = ({
  isOpen,
  selectedDate,
  formData,
  onClose,
  onFormChange,
  onSubmit,
  colorOptions = [],
  isEditMode = false,
  title = "Add Compliance Deadline",
  submitLabel = "Save compliance",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-white/10 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.35)] dark:bg-slate-900">
        <div className="bg-emerald-900 px-5 py-5 text-white sm:px-6 sm:py-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-50/90">
                Compliance
              </p>
              <h2 className="mt-1 text-xl font-semibold sm:text-2xl">
                {title}
              </h2>
              <p className="mt-2 text-sm text-emerald-50/90">
                {selectedDate
                  ? selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select a date"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/15 p-2 transition hover:bg-white/25"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-5 sm:p-6">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Compliance type
                </label>
                <div className="relative">
                  <select
                    name="complianceType"
                    value={formData.complianceType}
                    onChange={onFormChange}
                    className="w-full appearance-none rounded-md border border-slate-200 bg-white pr-9 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900"
                  >
                    <option value="Audit">Audit</option>
                    <option value="Review">Review</option>
                    <option value="Training">Training</option>
                    <option value="Policy">Policy</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={onFormChange}
                  placeholder="Enter compliance title"
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Start date and time
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={onFormChange}
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  End date and time
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={onFormChange}
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={onFormChange}
                  rows="3"
                  placeholder="Add a short description"
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Color
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {colorOptions && colorOptions.length
                    ? colorOptions.map((cls, idx) => (
                        <button
                          key={`color-${idx}`}
                          type="button"
                          onClick={() => onFormChange({ target: { name: 'colorIndex', value: idx } })}
                          className={`h-8 w-8 rounded-full border-2 ${formData.colorIndex == idx ? 'ring-2 ring-emerald-400' : 'border-white/20'} ${cls.split(' ').slice(0,1).join(' ')}`}
                          title={`Color ${idx + 1}`}
                        />
                      ))
                    : null}
                </div>
              </div>

              

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Assigned
                </label>
                <input
                  type="text"
                  name="assigned"
                  value={formData.assigned}
                  onChange={onFormChange}
                  placeholder="Team member"
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Status
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={onFormChange}
                    className="w-full appearance-none rounded-md border border-slate-200 bg-white pr-9 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In progress">In progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarFormModal;
