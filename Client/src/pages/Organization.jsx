import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  EllipsisVertical,
  KeyRound,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import api, { endpoints } from "../config/api.js";
import SweetAlert from "../components/SweetAlert.jsx";
import { PERMISSIONS } from "../utils/permissions.js";
import { useAuth } from "../context/AuthContext.jsx";

const tabs = [
  { key: "workgroups", label: "Workgroups", placeholder: "Search workgroups" },
  {
    key: "departments",
    label: "Departments",
    placeholder: "Search departments",
  },
  { key: "units", label: "Units", placeholder: "Search units" },
];

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const [goToPageInput, setGoToPageInput] = useState("");

  const handleGoToPage = () => {
    const num = parseInt(goToPageInput, 10);
    if (num >= 1 && num <= totalPages) {
      onPageChange(num);
      setGoToPageInput("");
    }
  };

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const showStart = currentPage <= 3;
    const showEnd = currentPage >= totalPages - 2;
    const pages = new Set([1, totalPages]);

    if (showStart) {
      pages.add(2);
      pages.add(3);
      pages.add(4);
    }

    if (showEnd) {
      pages.add(totalPages - 3);
      pages.add(totalPages - 2);
      pages.add(totalPages - 1);
    }

    if (!showStart && !showEnd) {
      pages.add(currentPage - 1);
      pages.add(currentPage);
      pages.add(currentPage + 1);
    }

    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    let prev = 0;

    for (const p of sorted) {
      if (p - prev > 1) result.push("ellipsis");
      result.push(p);
      prev = p;
    }

    return result;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`flex flex-row flex-nowrap items-center justify-end gap-1 sm:gap-2 lg:gap-3 font-montserrat text-xs sm:text-sm overflow-x-auto scrollbar-green ${
        inFooter ? "" : "mt-3 sm:mt-4"
      }`}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((p, idx) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-500 dark:text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 px-1.5 sm:px-2 rounded-md text-xs sm:text-sm font-medium transition ${
                p === currentPage
                  ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600"
                  : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {p}
            </button>
          ),
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-gray-200 dark:border-slate-700 whitespace-nowrap shrink-0">
        <span className="text-[10px] sm:text-sm text-gray-500 dark:text-slate-400">Go to page</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={goToPageInput}
          onChange={(e) => setGoToPageInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
          placeholder=""
          className="w-11 sm:w-14 px-1.5 sm:px-2 py-1 text-[11px] sm:text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
        />
        <button
          onClick={handleGoToPage}
          className="px-2 sm:px-3 py-1 text-[11px] sm:text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition"
        >
          Go
        </button>
      </div>
    </div>
  );
};

const OrganizationPage = () => {
  const PAGE_SIZE = 5;
  const { hasPermission } = useAuth();
  const canCreateOrganization =
    hasPermission(PERMISSIONS.ORGANIZATION_CREATE);
  const canUpdateOrganization =
    hasPermission(PERMISSIONS.ORGANIZATION_UPDATE);
  const canDeleteOrganization =
    hasPermission(PERMISSIONS.ORGANIZATION_DELETE);

  const [activeTab, setActiveTab] = useState("workgroups");
  const [workgroups, setWorkgroups] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [actionMenuId, setActionMenuId] = useState(null);
  const [actionMenuPos, setActionMenuPos] = useState({ top: 0, right: 0 });
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    id: null,
    name: "",
    workgroupIds: [],
    departmentIds: [],
  });

  const toggleActionMenu = (id, e) => {
    if (actionMenuOpen && actionMenuId === id) {
      setActionMenuOpen(false);
      setActionMenuId(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setActionMenuPos({
      top: rect.top,
      right: window.innerWidth - rect.left + 8,
    });
    setActionMenuId(id);
    setActionMenuOpen(true);
  };

  const closeActionMenu = () => {
    setActionMenuOpen(false);
    setActionMenuId(null);
  };

  useEffect(() => {
    if (!actionMenuOpen) return;
    const handleScroll = () => closeActionMenu();
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [actionMenuOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workgroupsResponse, departmentsResponse, unitsResponse] =
        await Promise.all([
          api.get(endpoints.workgroups.getAll),
          api.get(endpoints.departments.getAll),
          api.get(endpoints.units.getAll),
        ]);

      setWorkgroups(workgroupsResponse.data.workgroups || []);
      setDepartments(departmentsResponse.data.departments || []);
      setUnits(unitsResponse.data.units || []);
    } catch (error) {
      console.error("Failed to load organization data:", error);
      SweetAlert.error("Load failed", "Unable to load organization data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentTab = tabs.find((tab) => tab.key === activeTab) || tabs[0];

  const visibleItems = useMemo(() => {
    if (activeTab === "departments") {
      return departments;
    }

    if (activeTab === "units") {
      return units;
    }

    return workgroups;
  }, [activeTab, departments, units, workgroups]);

  const totalItems = visibleItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = visibleItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const resetForm = () => {
    setForm({ id: null, name: "", workgroupIds: [], departmentIds: [] });
    setOpenDropdown(null);
  };

  const handleEdit = (item) => {
    if (activeTab === "workgroups") {
      setForm({
        id: item.id,
        name: item.workgroupName || "",
        workgroupIds: [],
        departmentIds: [],
      });
      return;
    }

    if (activeTab === "departments") {
      const selectedWorkgroupIds = item.workgroups?.length
        ? item.workgroups.map((entry) => String(entry.id))
        : item.workgroupId || item.workgroup?.id
          ? [String(item.workgroupId || item.workgroup?.id)]
          : [];

      setForm({
        id: item.id,
        name: item.departmentName || "",
        workgroupIds: selectedWorkgroupIds,
        departmentIds: [],
      });
      return;
    }

    const selectedDepartmentIds = item.assignedDepartments?.length
      ? item.assignedDepartments.map((entry) => String(entry.id))
      : item.departmentId || item.department?.id
        ? [String(item.departmentId || item.department?.id)]
        : [];

    setForm({
      id: item.id,
      name: item.UnitName || "",
      workgroupIds: [],
      departmentIds: selectedDepartmentIds,
    });
  };

  const handleDelete = async (item) => {
    if (!canDeleteOrganization) {
      SweetAlert.error(
        "Unauthorized",
        "You do not have permission to delete organization entries.",
      );
      return;
    }

    const result = await SweetAlert.confirmDelete(
      activeTab === "workgroups"
        ? item.workgroupName || "this workgroup"
        : activeTab === "departments"
          ? item.departmentName || "this department"
          : item.UnitName || "this unit",
    );

    if (!result.isConfirmed) return;

    try {
      if (activeTab === "workgroups") {
        await api.delete(endpoints.workgroups.delete(item.id));
      } else if (activeTab === "departments") {
        await api.delete(endpoints.departments.delete(item.id));
      } else {
        await api.delete(endpoints.units.delete(item.id));
      }

      await fetchData();
      SweetAlert.toast.success("Deleted successfully");
    } catch (error) {
      SweetAlert.error(
        "Delete failed",
        error.response?.data?.message || "Unable to delete the selected item.",
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.id) {
      if (!canUpdateOrganization) {
        SweetAlert.error(
          "Unauthorized",
          "You do not have permission to update organization entries.",
        );
        return;
      }
    } else if (!canCreateOrganization) {
      SweetAlert.error(
        "Unauthorized",
        "You do not have permission to create organization entries.",
      );
      return;
    }

    const trimmedName = form.name.trim();
    if (!trimmedName) {
      SweetAlert.error("Missing name", "Please enter a name before saving.");
      return;
    }

    const payload =
      activeTab === "workgroups"
        ? { workgroupName: trimmedName }
        : activeTab === "departments"
          ? {
              departmentName: trimmedName,
              workgroupIds: form.workgroupIds,
            }
          : { UnitName: trimmedName, departmentIds: form.departmentIds };

    try {
      setSubmitting(true);

      if (form.id) {
        if (activeTab === "workgroups") {
          await api.put(endpoints.workgroups.update(form.id), payload);
        } else if (activeTab === "departments") {
          await api.put(endpoints.departments.update(form.id), payload);
        } else {
          await api.put(endpoints.units.update(form.id), payload);
        }
        SweetAlert.toast.success("Updated successfully");
      } else if (activeTab === "workgroups") {
        await api.post(endpoints.workgroups.create, payload);
        SweetAlert.toast.success("Workgroup created");
      } else if (activeTab === "departments") {
        await api.post(endpoints.departments.create, payload);
        SweetAlert.toast.success("Department created");
      } else {
        await api.post(endpoints.units.create, payload);
        SweetAlert.toast.success("Unit created");
      }

      await fetchData();
      resetForm();
    } catch (error) {
      SweetAlert.error(
        "Save failed",
        error.response?.data?.message || "Unable to save the selected item.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg select-none">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-500">
            Admin Tool
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-700 dark:text-white">
            Organization
          </h1>
          <p className="text-sm text-slate-500 dark:text-gray-400">
            Manage workgroups, departments, and units
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Workgroups
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Building2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {workgroups.length}
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Departments
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Building2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-blue-600 dark:text-blue-400">
            {departments.length}
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Units
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <Building2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-amber-600 dark:text-amber-400">
            {units.length}
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              resetForm();
            }}
            className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-sm font-semibold transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-emerald-500 text-emerald-500"
                : "border-transparent text-slate-500 hover:text-emerald-500 dark:text-slate-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.4fr]">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto scrollbar-green">
            {loading ? (
              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Loading organization data...
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                No {currentTab.label.toLowerCase()} found.
              </div>
            ) : (
              <table className="min-w-[640px] w-full text-sm bg-white dark:bg-slate-900">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-400">
                    <th className="px-5 py-3 whitespace-nowrap">#</th>
                    <th className="px-5 py-3 whitespace-nowrap">Name</th>
                    {activeTab === "departments" && (
                      <th className="px-5 py-3 whitespace-nowrap">Workgroup</th>
                    )}
                    {activeTab === "units" && (
                      <th className="px-5 py-3 whitespace-nowrap">Department</th>
                    )}
                    <th className="px-5 py-3 text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800/40 divide-y divide-slate-200 dark:divide-slate-700">
                  {paginatedItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-xs sm:text-sm text-slate-400 tabular-nums whitespace-nowrap align-top">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="px-5 py-3.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 align-top break-words">
                        {activeTab === "workgroups"
                          ? item.workgroupName
                          : activeTab === "departments"
                            ? item.departmentName
                            : item.UnitName}
                      </td>
                      {activeTab === "departments" && (
                        <td className="px-5 py-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 align-top break-words">
                          {item.workgroups?.length
                            ? item.workgroups.map((entry) => entry.workgroupName).join(", ")
                            : item.workgroup?.workgroupName || "Unassigned"}
                        </td>
                      )}
                      {activeTab === "units" && (
                        <td className="px-5 py-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 align-top break-words">
                          {item.assignedDepartments?.length
                            ? item.assignedDepartments.map((entry) => entry.departmentName).join(", ")
                            : item.department?.departmentName || "Unassigned"}
                        </td>
                      )}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap align-top">
                        <div className="relative flex justify-center">
                          <button
                            type="button"
                            onClick={(e) => toggleActionMenu(item.id, e)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700 transition"
                              aria-label="Open actions"
                            >
                              <EllipsisVertical size={15} className="pointer-events-none" />
                          </button>
                          {actionMenuOpen && actionMenuId === item.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={closeActionMenu} />
                              <div
                                style={{ top: actionMenuPos.top, right: actionMenuPos.right }}
                                className="fixed z-50 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1"
                              >
                                {canUpdateOrganization && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      closeActionMenu();
                                      handleEdit(item);
                                    }}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                    Edit
                                  </button>
                                )}
                                {canDeleteOrganization && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      closeActionMenu();
                                      handleDelete(item);
                                    }}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 dark:text-rose-300 dark:hover:bg-slate-700"
                                  >
                                    <Trash2 className="h-4 w-4 text-rose-600" />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-950/30">
                  <tr>
                    <td
                      colSpan={activeTab === "workgroups" ? 4 : 5}
                      className="px-5 py-3"
                    >
                      <div className="flex flex-row items-center justify-between gap-3">
                        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          <span>
                            Showing {(currentPage - 1) * PAGE_SIZE + 1}-
                            {Math.min(currentPage * PAGE_SIZE, totalItems)} of {totalItems} {currentTab.label.toLowerCase()}
                          </span>
                        </div>
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setPage}
                          inFooter={true}
                        />
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>

        {(canCreateOrganization || canUpdateOrganization) ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                  {form.id
                    ? `Edit ${currentTab.label.slice(0, -1)}`
                    : `Create ${currentTab.label.slice(0, -1)}`}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {form.id ? "Update details below." : "Add a new entry below."}
                </p>
              </div>
              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder={
                    activeTab === "workgroups"
                      ? "Enter workgroup name"
                      : activeTab === "departments"
                        ? "Enter department name"
                        : "Enter unit name"
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>

              {activeTab === "departments" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Workgroups
                </label>
                <div className="relative w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === "workgroups" ? null : "workgroups")}
                    className="relative w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pr-9 py-2.5 text-left text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <span>
                      {form.workgroupIds.length > 0
                        ? `${form.workgroupIds.length} selected`
                        : "Select workgroups"}
                    </span>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </button>

                  {openDropdown === "workgroups" && (
                    <div className="absolute z-10 mt-2 max-h-40 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                      {workgroups.length === 0 ? (
                        <p className="px-2 py-1 text-sm text-slate-500 dark:text-slate-400">No workgroups available.</p>
                      ) : (
                        workgroups.map((item) => {
                          const checked = form.workgroupIds.includes(String(item.id));
                          return (
                            <label
                              key={item.id}
                              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setForm((prev) => {
                                    const nextValues = checked
                                      ? prev.workgroupIds.filter((value) => value !== String(item.id))
                                      : [...prev.workgroupIds, String(item.id)];
                                    return { ...prev, workgroupIds: nextValues };
                                  });
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span>{item.workgroupName}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

              {activeTab === "units" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Departments
                  </label>
                  <div className="relative w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === "departments" ? null : "departments")}
                      className="relative w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pr-9 py-2.5 text-left text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <span>
                        {form.departmentIds.length > 0
                          ? `${form.departmentIds.length} selected`
                          : "Select departments"}
                      </span>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    </button>

                    {openDropdown === "departments" && (
                      <div className="absolute z-10 mt-2 max-h-40 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                        {departments.length === 0 ? (
                          <p className="px-2 py-1 text-sm text-slate-500 dark:text-slate-400">No departments available.</p>
                        ) : (
                          departments.map((item) => {
                            const checked = form.departmentIds.includes(String(item.id));
                            return (
                              <label
                                key={item.id}
                                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    setForm((prev) => {
                                      const nextValues = checked
                                        ? prev.departmentIds.filter((value) => value !== String(item.id))
                                        : [...prev.departmentIds, String(item.id)];
                                      return { ...prev, departmentIds: nextValues };
                                    });
                                  }}
                                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span>{item.departmentName}</span>
                              </label>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                {submitting ? "Saving..." : form.id ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                Clear
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            You do not have permission to manage organization entries.
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationPage;
