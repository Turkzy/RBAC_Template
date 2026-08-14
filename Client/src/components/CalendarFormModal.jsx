import React, { useEffect, useRef, useState } from "react";
import { X, ChevronDown, Check, Palette } from "lucide-react";

const CalendarFormModal = ({
  isOpen,
  selectedDate,
  formData,
  onClose,
  onFormChange,
  onSubmit,
  users = [],
  workgroups = [],
  departments = [],
  units = [],
  complianceFormTitles = [],
  colorOptions = [],
  isEditMode = false,
  title = "Add Compliance Deadline",
  submitLabel = "Save compliance",
  canModify = true,
  currentUserId = null,
}) => {
  const isEditLocked = isEditMode && !canModify;

  const [dropdownOpen, setDropdownOpen] = useState({
    assignedTo: false,
    colorPicker: false,
  });

  const [searchTerms, setSearchTerms] = useState({
    assignedTo: "",
  });

  const dropdownSectionRef = useRef(null);
  const colorScrollRef = useRef(null);
  const colorPickerRef = useRef(null);
  const dropdownRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      setDropdownOpen((prev) => {
        const next = { ...prev };
        Object.keys(prev).forEach((field) => {
          if (!prev[field]) return;
          if (field === "colorPicker") {
            const insideColor =
              colorPickerRef.current &&
              colorPickerRef.current.contains(event.target);
            if (!insideColor) next[field] = false;
            return;
          }
          const ref = dropdownRefs.current[field];
          const inside = ref && ref.contains(event.target);
          if (!inside) next[field] = false;
        });
        return next;
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getOptionLabel = (items, id, labelKeys) => {
    const match = Array.isArray(items)
      ? items.find((item) => String(item.id) === String(id))
      : null;
    if (!match) return `#${id}`;
    return (
      labelKeys.reduce((label, key) => {
        if (label) return label;
        return match[key] || "";
      }, "") || `#${id}`
    );
  };

  const updateFieldValue = (name, value) => {
    onFormChange({ target: { name, value } });
  };

  const handleStartDateTimeChange = (event) => {
    const nextStart = event.target.value;
    const currentEnd = formData.endDate || "";

    const shouldSyncEnd =
      !currentEnd ||
      (nextStart &&
        currentEnd &&
        new Date(currentEnd) < new Date(nextStart));

    updateFieldValue("startDate", nextStart);

    if (shouldSyncEnd) {
      updateFieldValue("endDate", nextStart);
    }
  };

  const handleEndDateTimeChange = (event) => {
    const nextEnd = event.target.value;
    const currentStart = formData.startDate || "";

    if (currentStart && nextEnd && new Date(nextEnd) < new Date(currentStart)) {
      updateFieldValue("startDate", nextEnd);
    }

    updateFieldValue("endDate", nextEnd);
  };

  const SPECIFIC_SUBMISSION_SEPARATOR = " / ";

  const getNormalizedNodeLabel = (nodeOrLabel) =>
    String(nodeOrLabel?.formName ?? nodeOrLabel ?? "").trim();

  const normalizeSpecificSubmissionPath = (selectedRootForm, rawValue) => {
    const value = String(rawValue || "").trim();
    const rootLabel = getNormalizedNodeLabel(selectedRootForm);
    if (!selectedRootForm || !value || value === rootLabel) {
      return "";
    }

    const legacyPrefix = `${rootLabel}${SPECIFIC_SUBMISSION_SEPARATOR}`;
    return value.startsWith(legacyPrefix)
      ? value.slice(legacyPrefix.length)
      : value;
  };

  const formatSpecificSubmissionOptionLabel = (option) => {
    if (!option) return "";
    const label = String(option.label || "");
    const truncatedLabel =
      label.length > 80 ? `${label.slice(0, 80)}…` : label;
    return `${option.depth > 0 ? `${"  ".repeat(option.depth)}- ` : ""}${truncatedLabel}`;
  };

  const selectedTitle = Array.isArray(complianceFormTitles)
    ? complianceFormTitles.find(
        (title) => String(title.id) === String(formData.complianceTitleId),
      )
    : null;

  const topLevelForms = Array.isArray(selectedTitle?.ComplianceForms)
    ? selectedTitle.ComplianceForms
    : [];

  const buildNestedSubmissionOptions = (
    nodes = [],
    parentPath = "",
    rootFormId = null,
    depth = 0,
    rootLabel = "",
  ) => {
    return nodes.flatMap((node) => {
      const currentPath = parentPath
        ? `${parentPath} / ${node.formName}`
        : node.formName;
      const fullPath = rootLabel
        ? `${rootLabel}${SPECIFIC_SUBMISSION_SEPARATOR}${currentPath}`
        : currentPath;
      const currentOption = {
        id: String(node.id),
        rootFormId: String(rootFormId ?? node.id),
        label: node.formName,
        path: currentPath,
        fullPath,
        depth,
      };

      const childOptions = Array.isArray(node.ComplianceSubForms)
        ? buildNestedSubmissionOptions(
            node.ComplianceSubForms,
            currentPath,
            rootFormId ?? node.id,
            depth + 1,
            rootLabel,
          )
        : [];

      return [currentOption, ...childOptions];
    });
  };

  const allSubmissionOptions = buildNestedSubmissionOptions(topLevelForms);
  const directSelectedForm = topLevelForms.find(
    (form) => String(form.id) === String(formData.complianceFormId),
  );
  const selectedSubmissionContext = directSelectedForm
    ? null
    : allSubmissionOptions.find(
        (option) => String(option.id) === String(formData.complianceFormId),
      );
  const selectedRootFormId = directSelectedForm
    ? String(directSelectedForm.id)
    : selectedSubmissionContext?.rootFormId ||
      String(formData.complianceFormId || "");
  const selectedForm =
    directSelectedForm ||
    topLevelForms.find(
      (form) => String(form.id) === String(selectedRootFormId),
    ) ||
    null;
  const normalizedSpecificSubmissionPath = normalizeSpecificSubmissionPath(
    selectedForm,
    formData.complianceType,
  );
  const nestedSubmissionOptions = selectedForm
    ? buildNestedSubmissionOptions(
        selectedForm.ComplianceSubForms,
        "",
        selectedForm.id,
        0,
        selectedForm.formName,
      )
    : [];
  const hasNestedSubmissionOptions = nestedSubmissionOptions.length > 0;
  const selectedSpecificSubmissionPath = normalizedSpecificSubmissionPath
    ? `${selectedForm.formName}${SPECIFIC_SUBMISSION_SEPARATOR}${normalizedSpecificSubmissionPath}`
    : selectedForm?.formName || "";

  const toggleDropdown = (fieldName) => {
    setDropdownOpen((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const toggleAssignment = (fieldName, id) => {
    const selected = Array.isArray(formData[fieldName])
      ? [...formData[fieldName]]
      : [];
    const exists = selected.some((item) => String(item) === String(id));
    const nextValue = exists
      ? selected.filter((item) => String(item) !== String(id))
      : [...selected, id];
    updateFieldValue(fieldName, nextValue);
  };

  const normalizedCurrentUserId = currentUserId == null || currentUserId === undefined
  ? null
  : String(currentUserId);

  const assignedToGroups = [
    {
    fieldName: "assignedToUserIds",
    label: "Users",
    items: Array.isArray(users)
      ? users.filter((user) => {
          const userId = String(user.id ?? user.userId ?? user._id ?? "");
          return !normalizedCurrentUserId || userId !== normalizedCurrentUserId;
        })
      : [],
    labelKeys: ["fullName", "username", "email"],
  },
    {
      fieldName: "assignedToWorkgroupIds",
      label: "Workgroups",
      items: workgroups,
      labelKeys: ["workgroupName", "name"],
    },
    {
      fieldName: "assignedToDepartmentIds",
      label: "Departments",
      items: departments,
      labelKeys: ["departmentName", "name"],
    },
    {
      fieldName: "assignedToUnitsIds",
      label: "Units",
      items: units,
      labelKeys: ["UnitName", "name"],
    },
  ];

  const renderAssignedToDropdown = () => {
    const searchTerm = (searchTerms.assignedTo || "").toLowerCase();

    const totalSelected = assignedToGroups.reduce(
      (sum, group) =>
        sum +
        (Array.isArray(formData[group.fieldName])
          ? formData[group.fieldName].length
          : 0),
      0,
    );

    const groupsWithMatches = assignedToGroups.map((group) => {
      const baseItems = Array.isArray(group.items) ? group.items : [];
      const filteredItems = !searchTerm
        ? baseItems
        : baseItems.filter((item) => {
            const idMatch = String(item.id).toLowerCase().includes(searchTerm);
            const labelMatch = group.labelKeys.some((k) =>
              String(item[k] || "")
                .toLowerCase()
                .includes(searchTerm),
            );
            return idMatch || labelMatch;
          });
      return { ...group, filteredItems };
    });

    const hasAnyResults = groupsWithMatches.some(
      (g) => g.filteredItems.length > 0,
    );

    const clearAll = () => {
      setSearchTerms((s) => ({ ...s, assignedTo: "" }));
      assignedToGroups.forEach((group) =>
        updateFieldValue(group.fieldName, []),
      );
    };

    return (
      <div
        className="relative"
        ref={(el) => {
          dropdownRefs.current.assignedTo = el;
        }}
      >
        <div className="relative">
          <input
            type="text"
            value={searchTerms.assignedTo || ""}
            onFocus={() => setDropdownOpen((p) => ({ ...p, assignedTo: true }))}
            onChange={(e) => {
              const v = e.target.value;
              setSearchTerms((s) => ({ ...s, assignedTo: v }));
              setDropdownOpen((p) => ({ ...p, assignedTo: true }));
            }}
            placeholder={
              totalSelected > 0
                ? `${totalSelected} Selected`
                : "Search users, workgroups, departments, units..."
            }
            className="w-full rounded-md border border-slate-200 bg-white pr-16 sm:pr-10 pl-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400"
          />
          {totalSelected > 0 && (
            <button
              type="button"
              onClick={clearAll}
              title="Clear selection"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 items-center gap-1.5 sm:gap-2 rounded-md bg-white/50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 px-2"
            >
              <X className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600 whitespace-nowrap">
                Clear
              </span>
            </button>
          )}
        </div>

        {dropdownOpen.assignedTo && (
          <div className="absolute left-0 right-0 z-20 mt-1 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {hasAnyResults ? (
              groupsWithMatches.map((group) =>
                group.filteredItems.length ? (
                  <div key={group.fieldName}>
                    <div className="sticky top-0 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {group.label}
                    </div>
                    {group.filteredItems.map((item) => {
                      const id = item.id;
                      const selectedIds = Array.isArray(
                        formData[group.fieldName],
                      )
                        ? formData[group.fieldName]
                        : [];
                      const checked = selectedIds.some(
                        (itemId) => String(itemId) === String(id),
                      );
                      return (
                        <label
                          key={`${group.fieldName}-${id}`}
                          className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggleAssignment(group.fieldName, id)
                            }
                            disabled={isEditLocked}
                            className="h-4 w-4 shrink-0 rounded border-slate-300 accent-emerald-500 checked:bg-emerald-500 checked:border-emerald-500 focus:ring-emerald-500 disabled:opacity-60"
                          />
                          <span className="flex-1 min-w-0 truncate">
                            {getOptionLabel(group.items, id, group.labelKeys)}
                          </span>
                          {checked && (
                            <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                ) : null,
              )
            ) : (
              <div className="p-3 text-xs text-slate-500 dark:text-slate-400">
                No results.
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const scrollColorPicker = (dir = 1) => {
    const el = colorScrollRef.current;
    if (!el) return;
    const amount = Math.max(120, Math.floor(el.clientWidth * 0.6));
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  const renderColorPicker = () => {
    const selectedIndex = Number(formData.colorIndex ?? 0);

    return (
      <div ref={colorPickerRef} className="relative">
        <button
          type="button"
          onClick={() => toggleDropdown("colorPicker")}
          disabled={isEditLocked}
          className="flex h-12 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm text-slate-900 shadow-sm outline-none transition hover:border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900"
          aria-expanded={dropdownOpen.colorPicker}
        >
          <span className="flex items-center gap-2 truncate">
            <span
              className={`inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-slate-300 ${colorOptions?.[selectedIndex]?.split(" ")[0] || "bg-slate-500"}`}
            />
            <span className="truncate">
              {colorOptions?.length
                ? `Color ${selectedIndex + 1}`
                : "Select color"}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>

        {dropdownOpen.colorPicker && (
          <div className="absolute left-0 right-0 z-20 mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <div className="relative">
              <div
                ref={colorScrollRef}
                className="no-scrollbar mx-2 overflow-x-auto py-2"
              >
                <div className="flex gap-2 px-1">
                  {colorOptions && colorOptions.length
                    ? colorOptions.map((cls, idx) => {
                        const bgClass = cls.split(" ")[0];
                        const selected = idx === selectedIndex;
                        return (
                          <button
                            key={`color-${idx}`}
                            type="button"
                            onClick={() => updateFieldValue("colorIndex", idx)}
                            disabled={isEditLocked}
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition ${bgClass} ${selected ? "ring-2 ring-emerald-300 border-emerald-400" : "border-white/20 hover:scale-105"} ${isEditLocked ? "opacity-60" : ""}`}
                            title={`Color ${idx + 1}`}
                          />
                        );
                      })
                    : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-lg border border-white/10 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.35)] dark:bg-slate-900">
        <div className="bg-emerald-900 px-4 py-4 text-white sm:px-6 sm:py-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-50/90">
                Compliance
              </p>
              <h2 className="mt-1 text-lg sm:text-2xl font-semibold break-words">
                {title}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-emerald-50/90">
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
              className="shrink-0 rounded-full bg-white/15 p-2 transition hover:bg-white/25"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="max-h-[calc(90vh-8rem)] space-y-4 overflow-y-auto p-4 sm:p-6"
        >
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Details
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Compliance Type
                </label>
                <div className="relative">
                  <select
                    name="complianceTitleId"
                    value={formData.complianceTitleId || ""}
                    onChange={(event) => {
                      const nextTitleId = event.target.value;
                      onFormChange({
                        target: {
                          name: "complianceTitleId",
                          value: nextTitleId,
                        },
                      });
                      onFormChange({
                        target: { name: "complianceFormId", value: "" },
                      });
                      onFormChange({
                        target: { name: "complianceType", value: "" },
                      });
                    }}
                    disabled={isEditLocked}
                    className="w-full appearance-none rounded-md border border-slate-200 bg-white pr-9 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900 truncate"
                  >
                    <option value="">Select title</option>
                    {Array.isArray(complianceFormTitles) &&
                      complianceFormTitles.map((title) => (
                        <option
                          key={title.id}
                          value={title.id}
                          title={title.title}
                        >
                          {title.title && title.title.length > 60
                            ? `${title.title.slice(0, 60)}…`
                            : title.title}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {selectedTitle && topLevelForms.length > 0 ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Submission For
                    </label>
                    <div className="relative">
                      <select
                        name="complianceFormId"
                        value={selectedRootFormId || ""}
                        onChange={(event) => {
                          const nextFormId = event.target.value;
                          onFormChange({
                            target: {
                              name: "complianceFormId",
                              value: nextFormId,
                            },
                          });
                          onFormChange({
                            target: { name: "complianceType", value: "" },
                          });
                        }}
                        disabled={isEditLocked || topLevelForms.length === 0}
                        className="w-full appearance-none rounded-md border border-slate-200 bg-white pr-9 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900 truncate"
                      >
                        <option value="">
                          {topLevelForms.length > 0
                            ? "Select top-level item"
                            : "No submission available"}
                        </option>
                        {topLevelForms.map((form) => (
                          <option
                            key={form.id}
                            value={form.id}
                            title={form.formName}
                          >
                            {form.formName.length > 80
                              ? `${form.formName.slice(0, 80)}…`
                              : form.formName}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>

                    {topLevelForms.length === 0 && (
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        This compliance type has no submission options yet.
                      </p>
                    )}
                  </div>

                  {topLevelForms.length > 0 && hasNestedSubmissionOptions ? (
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Specific Submission
                      </label>
                      <div className="relative">
                        <select
                          name="complianceType"
                          value={normalizedSpecificSubmissionPath}
                          onChange={(event) =>
                            updateFieldValue(
                              "complianceType",
                              event.target.value,
                            )
                          }
                          disabled={isEditLocked}
                          className="w-full appearance-none rounded-md border border-slate-200 bg-white pr-9 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900 truncate"
                        >
                          <option value="">Select specific submission</option>
                          {nestedSubmissionOptions.map((option) => (
                            <option
                              key={option.id}
                              value={option.path}
                              title={option.fullPath}
                            >
                              {formatSpecificSubmissionOptionLabel(option)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 break-words">
                        {normalizedSpecificSubmissionPath
                          ? selectedSpecificSubmissionPath
                          : `Selected path: ${selectedForm.formName}`}
                      </p>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Schedule
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Start date and time
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleStartDateTimeChange}
                  disabled={isEditLocked}
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
                  onChange={handleEndDateTimeChange}
                  min={formData.startDate || ""}
                  disabled={isEditLocked}
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900"
                  required
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Appearance
            </p>
            {renderColorPicker()}
          </div>

          <div
            className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40"
            ref={dropdownSectionRef}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Assignment
            </p>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Assigned to (optional)
            </label>
            {renderAssignedToDropdown()}
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Leave all fields blank, the creator will still be notified of the
              deadline, and it will be treated as their own deadline.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Status
            </p>
            <div className="relative">
              <select
                name="status"
                value={formData.status}
                onChange={onFormChange}
                disabled={isEditLocked}
                className="w-full appearance-none rounded-md border border-slate-200 bg-white pr-9 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-emerald-900"
              >
                <option value="Compliant">Compliant</option>
                <option value="Under Evaluation">Under Evaluation</option>
                <option value="No Submission">No Submission</option>
                <option value="Non-Compliant">Non-Compliant</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEditLocked}
              className={`w-full sm:w-auto rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition ${isEditLocked ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700"}`}
            >
              {isEditLocked ? "You don't have permission" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarFormModal;