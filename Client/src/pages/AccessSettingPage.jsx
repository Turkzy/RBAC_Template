import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  KeyRound,
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  EllipsisVertical,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import api, { endpoints } from "../config/api.js";
import SweetAlert from "../components/SweetAlert.jsx";
import RoleFormModal from "../components/RoleFormModal.jsx";
import PermissionFormModal from "../components/PermissionFormModal.jsx";
import AssignPermissionModal from "../components/AssignPermissionModal.jsx";

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, onSubmit, submitting, submitLabel = "Save", children }) => (
  <>
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    />
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
      <div
        className="w-full max-w-sm sm:max-w-2xl lg:max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>
        <div className="px-4 sm:px-6 pb-3 sm:pb-5 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium transition-colors"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            {submitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  </>
);

const Field = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    <input
      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
      {...props}
    />
  </div>
);

// Reusable checkbox list used by the "Assign Permission" modal
const PermissionChecklist = ({ permissions, selectedIds, onToggle }) => {
  const formatGroupName = (groupKey) =>
    groupKey
      .split(/[_-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

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
    <div className="grid grid-cols-1 gap-4 max-h-72 overflow-y-auto pr-1 sm:grid-cols-2">
      {groups.map(({ groupKey, label, items }) => {
        const allSelected = items.every((permission) => selectedIds.includes(permission.id));
        return (
          <div key={groupKey} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                {label} Permission
              </p>
              <button
                type="button"
                onClick={() => toggleGroup(items)}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {allSelected ? "Clear All" : "Select All"}
              </button>
            </div>
            <div className="space-y-2">
              {items.map((p) => {
                const checked = selectedIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                      checked
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(p.id)}
                      className="accent-emerald-500 w-4 h-4"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {p.label}
                      </p>
                      <p className="text-xs font-mono text-slate-400 dark:text-slate-500">
                        {p.name}
                      </p>
                    </div>
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

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const [goToPageInput, setGoToPageInput] = useState("");

  const handleGoToPage = () => {
    const num = parseInt(goToPageInput, 10);
    if (num >= 1 && num <= totalPages) {
      onPageChange(num);
      setGoToPageInput("");
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const showStart = currentPage <= 3;
    const showEnd = currentPage >= totalPages - 2;
    const pages = new Set([1, totalPages]);
    if (showStart) {
      [1, 2, 3, 4].forEach((p) => p <= totalPages && pages.add(p));
    }
    if (showEnd) {
      [totalPages - 3, totalPages - 2, totalPages - 1, totalPages].forEach(
        (p) => p >= 1 && pages.add(p),
      );
    }
    if (!showStart && !showEnd) {
      [currentPage - 1, currentPage, currentPage + 1].forEach(
        (p) => p >= 1 && p <= totalPages && pages.add(p),
      );
    }
    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    let prev = 0;
    for (const p of sorted) {
      if (p > prev + 1) result.push("ellipsis");
      result.push(p);
      prev = p;
    }
    return result;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center sm:justify-end gap-2 sm:gap-3 mt-3 sm:mt-4 font-montserrat text-xs sm:text-sm">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((p, idx) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] h-8 px-2 rounded-md text-sm font-medium transition ${
                p === currentPage
                  ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600"
                  : "text-gray-600 hover:bg-gray-100"
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
        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
        <span className="text-sm text-gray-500">Go to page</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={goToPageInput}
          onChange={(e) => setGoToPageInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
          placeholder=""
          className="w-14 px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
        />
        <button
          onClick={handleGoToPage}
          className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
        >
          Go
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AccessSettingPage = () => {
  const [activeTab, setActiveTab] = useState("roles");
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Dropdown state (fixed-position, same pattern as AccountPage) ──────────
  // Track both the id AND which table the menu belongs to, so permission
  // and role menus (which can share the same numeric id) never collide.
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openMenuType, setOpenMenuType] = useState(null); // "permission" | "role"
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  const toggleMenu = (type, id, e) => {
    if (menuOpen && openMenuId === id && openMenuType === type) {
      setMenuOpen(false);
      setOpenMenuId(null);
      setOpenMenuType(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.top,
      right: window.innerWidth - rect.left + 8,
    });
    setOpenMenuId(id);
    setOpenMenuType(type);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setOpenMenuId(null);
    setOpenMenuType(null);
  };

  // Fixed-position menu can't track its anchor button while the page moves,
  // so just close it as soon as any scrolling happens (capture=true also
  // catches scroll on inner scrollable containers, e.g. the table wrapper).
  useEffect(() => {
    if (!menuOpen) return;
    const handleScroll = () => closeMenu();
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [menuOpen]);

  // ── Fetch data ─────────────────────────────────────────────────────────────
  const fetchPermissions = async () => {
    const response = await api.get(endpoints.rbac.permissions.getAll);
    setPermissions(response.data.permissions || []);
  };

  const fetchRoles = async () => {
    const response = await api.get(endpoints.rbac.roles.getAll);
    setRoles(
      (response.data.roles || []).map((r) => ({
        ...r,
        Permissions: r.Permissions || [],
      }))
    );
  };

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchPermissions(), fetchRoles()]);
    } catch (err) {
      console.error("Fetch access settings error:", err);
      setError(err.response?.data?.message || "Failed to load access settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ── Permission modal state ────────────────────────────────────────────────
  const [permModal, setPermModal] = useState(null);
  const [selectedPerm, setSelectedPerm] = useState(null);

  // ── Role modal state ──────────────────────────────────────────────────────
  const [roleModal, setRoleModal] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  // ── Assign Permission modal state (role-specific) ────────────────────────
  const [assignRole, setAssignRole] = useState(null);
  const [assignPermissionIds, setAssignPermissionIds] = useState([]);
  const [savingAssign, setSavingAssign] = useState(false);

  // ── Permission handlers ───────────────────────────────────────────────────
  const openAddPerm = () => {
    setSelectedPerm(null);
    setPermModal("add");
  };
  const openEditPerm = (p) => {
    setSelectedPerm(p);
    setPermModal("edit");
    closeMenu();
  };

  const handlePermissionFormSuccess = (permission, mode) => {
    if (mode === "add") {
      setPermissions((prev) => [...prev, permission]);
    } else {
      setPermissions((prev) =>
        prev.map((p) => (p.id === permission.id ? permission : p))
      );
      setRoles((prev) =>
        prev.map((r) => ({
          ...r,
          Permissions: r.Permissions.map((p) =>
            p.id === permission.id ? permission : p
          ),
        }))
      );
    }
    setPermModal(null);
    setSelectedPerm(null);
  };
  const deletePerm = async (id) => {
    const perm = permissions.find((p) => p.id === id);
    closeMenu();
    const result = await SweetAlert.confirmDelete(perm?.label || "this permission");
    if (!result.isConfirmed) return;

    try {
      await api.delete(endpoints.rbac.permissions.delete(id));
      setPermissions((prev) => prev.filter((p) => p.id !== id));
      // The backend also removes it from any roles it was assigned to
      setRoles((prev) =>
        prev.map((r) => ({
          ...r,
          Permissions: r.Permissions.filter((p) => p.id !== id),
        }))
      );
      SweetAlert.toast.success("Permission deleted");
    } catch (err) {
      SweetAlert.toast.error(err.response?.data?.message || "Failed to delete permission.");
    }
  };

  // ── Role handlers ─────────────────────────────────────────────────────────
  const openAddRole = () => {
    setSelectedRole(null);
    setRoleModal("add");
  };
  const openEditRole = (r) => {
    setSelectedRole(r);
    setRoleModal("edit");
    closeMenu();
  };

  const handleRoleFormSuccess = (role, mode) => {
    if (mode === "add") {
      setRoles((prev) => [...prev, { ...role, Permissions: [] }]);
    } else {
      setRoles((prev) =>
        prev.map((r) => (r.id === role.id ? { ...r, name: role.name } : r))
      );
    }
    setRoleModal(null);
    setSelectedRole(null);
  };
  const deleteRole = async (id) => {
    const role = roles.find((r) => r.id === id);
    closeMenu();
    const result = await SweetAlert.confirmDelete(role?.name || "this role");
    if (!result.isConfirmed) return;

    try {
      await api.delete(endpoints.rbac.roles.delete(id));
      setRoles((prev) => prev.filter((r) => r.id !== id));
      SweetAlert.toast.success("Role deleted");
    } catch (err) {
      SweetAlert.toast.error(err.response?.data?.message || "Failed to delete role.");
    }
  };

  // ── Assign Permission handlers (role-specific) ───────────────────────────
  const openAssignPerm = (r) => {
    setAssignRole(r);
    setAssignPermissionIds(r.Permissions.map((p) => p.id));
    closeMenu();
  };
  const toggleAssignPerm = (id) => {
    setAssignPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const saveAssignPerm = async () => {
    if (!assignRole) return;
    setSavingAssign(true);

    const existingIds = assignRole.Permissions.map((p) => p.id);
    const toAdd = assignPermissionIds.filter((id) => !existingIds.includes(id));
    const toRemove = existingIds.filter((id) => !assignPermissionIds.includes(id));

    try {
      if (toAdd.length > 0) {
        await api.post(endpoints.rbac.rolePermission.assign, {
          roleId: assignRole.id,
          permissionIds: toAdd,
        });
      }
      // The remove endpoint only accepts one permissionId at a time
      for (const permissionId of toRemove) {
        await api.delete(endpoints.rbac.rolePermission.remove, {
          data: { roleId: assignRole.id, permissionId },
        });
      }

      const updatedPermissions = permissions.filter((p) =>
        assignPermissionIds.includes(p.id)
      );
      setRoles((prev) =>
        prev.map((r) =>
          r.id === assignRole.id ? { ...r, Permissions: updatedPermissions } : r
        )
      );
      SweetAlert.toast.success("Role permissions updated");
      setAssignRole(null);
    } catch (err) {
      SweetAlert.toast.error(
        err.response?.data?.message || "Failed to update role permissions."
      );
    } finally {
      setSavingAssign(false);
    }
  };

  const tabs = [
    { id: "roles", label: "Roles", icon: <ShieldCheck size={15} /> },
    { id: "permissions", label: "Permissions", icon: <KeyRound size={15} /> },
  ];

  // ── Permission search + pagination state ─────────────────────────────────
  const [permissionSearch, setPermissionSearch] = useState("");
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  const filteredPermissions = permissions.filter((permission) => {
    const search = permissionSearch.trim().toLowerCase();
    if (!search) return true;
    return (
      permission.label?.toLowerCase().includes(search) ||
      permission.name?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredPermissions.length / PAGE_SIZE));

  // Keep the current page in range whenever the filtered data changes.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  useEffect(() => {
    setPage(1);
  }, [permissionSearch]);

  const paginatedPermissions = filteredPermissions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <div className="rounded-lg p-6 select-none">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-500">
            Admin Tool
          </p>
          <h1 className="text-3xl font-semibold text-slate-700 dark:text-white mt-1">
            Access Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-gray-400">
            Manage roles, permissions, and access control
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          title="Refresh"
          disabled={loading}
        >
          <RefreshCw
            size={18}
            className={`text-white ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Legend Counts */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="px-5 py-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Permission Rules
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <KeyRound className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{permissions.length}</div>
        </div>

        <div className="px-5 py-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Roles Configured
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-semibold text-blue-600 dark:text-blue-400">{roles.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "text-emerald-500 border-emerald-500"
                : "text-slate-500 dark:text-slate-400 border-transparent hover:text-emerald-500 dark:hover:text-emerald-400"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-emerald-500" />
          Loading access settings...
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400 py-6 px-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-6">
          <AlertCircle size={18} />
          <span className="flex-1">{error}</span>
          <button onClick={fetchAll} className="text-sm underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>  
          {/* ── Permissions Tab ─────────────────────────────────────────────── */}
          {activeTab === "permissions" && (
            <div>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">
                    Manage Permissions
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Search and manage permission rules.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-80">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                      placeholder="Search permissions..."
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                  <button
                    onClick={openAddPerm}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
                  >
                    <Plus size={15} /> Add Permission
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto scrollbar-green">
                <table className="min-w-full text-sm bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="px-5 py-3 text-left">#</th>
                      <th className="px-5 py-3 text-left">Label</th>
                      <th className="px-5 py-3 text-left">Permission Key</th>
                      <th className="px-5 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {permissions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-slate-400 dark:text-slate-500">
                          No permissions found.
                        </td>
                      </tr>
                    ) : (
                      paginatedPermissions.map((p, i) => (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                        >
                          <td className="px-5 py-3.5 text-slate-400 dark:text-slate-500 tabular-nums">
                            {(page - 1) * PAGE_SIZE + i + 1}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-200 whitespace-normal break-words sm:whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              <KeyRound size={13} className="text-emerald-500" />
                              {p.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 whitespace-normal break-words sm:whitespace-nowrap">
                            <span className="px-2 py-0.5 font-mono text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 break-all">
                              {p.name}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <button
                              onClick={(e) => toggleMenu("permission", p.id, e)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                            >
                              <EllipsisVertical size={15} className="text-slate-400 dark:text-slate-500" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}

          {/* ── Roles Tab ────────────────────────────────────────────────────── */}
          {activeTab === "roles" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  Manage Roles
                </h2>
                <button
                  onClick={openAddRole}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
                >
                  <Plus size={15} /> Add Role
                </button>
              </div>
              <div className="overflow-x-auto scrollbar-green">
                <table className="min-w-full text-sm bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="px-5 py-3 text-left">#</th>
                      <th className="px-5 py-3 text-left">Role Name</th>
                      <th className="px-5 py-3 text-left">Permissions COUNT</th>
                      <th className="px-5 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {roles.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-slate-400 dark:text-slate-500">
                          No roles found.
                        </td>
                      </tr>
                    ) : (
                      roles.map((r, i) => (
                        <tr
                          key={r.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                        >
                          <td className="px-5 py-3.5 text-slate-400 dark:text-slate-500 tabular-nums">
                            {i + 1}
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-slate-700 dark:text-slate-200 whitespace-normal break-words sm:whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              <ShieldCheck size={14} className="text-blue-500" />
                              {r.name}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 whitespace-normal break-words sm:whitespace-nowrap">
                            <span
                              title={
                                r.Permissions.length > 0
                                  ? r.Permissions.map((p) => p.label).join(", ")
                                  : "No permissions assigned"
                              }
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${
                                r.Permissions.length > 0
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                  : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              <KeyRound size={12} />
                              {r.Permissions.length}{" "}
                              {r.Permissions.length === 1 ? "Permission" : "Permissions"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <button
                              onClick={(e) => toggleMenu("role", r.id, e)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                            >
                              <EllipsisVertical size={15} className="text-slate-400 dark:text-slate-500" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* DROPDOWN FOR PERMISSION */}
      {menuOpen && openMenuType === "permission" && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} />
          <div
            className="fixed z-50 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            <button
              onClick={() =>
                openEditPerm(permissions.find((p) => p.id === openMenuId))
              }
              className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
            >
              <Edit size={15} /> Edit Permission
            </button>
            <button
              onClick={() => deletePerm(openMenuId)}
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
            >
              <Trash2 size={15} /> Delete Permission
            </button>
          </div>
        </>
      )}

      {/* DROPDOWN FOR ROLES */}
      {menuOpen && openMenuType === "role" && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} />
          <div
            className="fixed z-50 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
             <button
              onClick={() =>
                openAssignPerm(roles.find((r) => r.id === openMenuId))
              }
              className="w-full px-4 py-2.5 text-left text-sm text-yellow-700 dark:text-yellow-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
            >
              <KeyRound size={15} /> Assign Permission
            </button>
            <button
              onClick={() =>
                openEditRole(roles.find((r) => r.id === openMenuId))
              }
              className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
            >
              <Edit size={15} /> Edit Role
            </button>
           
            <button
              onClick={() => deleteRole(openMenuId)}
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
            >
              <Trash2 size={15} /> Delete Role
            </button>
          </div>
        </>
      )}

      {/* ── Permission Modal (Add / Edit) ────────────────────────────────────── */}
      {permModal && (
        <PermissionFormModal
          mode={permModal}
          permission={selectedPerm}
          onClose={() => {
            setPermModal(null);
            setSelectedPerm(null);
          }}
          onSuccess={handlePermissionFormSuccess}
        />
      )}

      {/* ── Role Modal (Add / Edit name) ─────────────────────────────────────── */}
      {roleModal && (
        <RoleFormModal
          mode={roleModal}
          role={selectedRole}
          onClose={() => {
            setRoleModal(null);
            setSelectedRole(null);
          }}
          onSuccess={handleRoleFormSuccess}
        />
      )}

      {/* ── Assign Permission Modal (role-specific) ──────────────────────────── */}
      {assignRole && (
        <AssignPermissionModal
          role={assignRole}
          permissions={permissions}
          selectedIds={assignPermissionIds}
          onToggle={toggleAssignPerm}
          onClose={() => setAssignRole(null)}
          onSubmit={saveAssignPerm}
          submitting={savingAssign}
        />
      )}
    </div>
  );
};

export default AccessSettingPage;