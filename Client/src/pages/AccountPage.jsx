import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  AlertCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  EllipsisVertical,
  Eye,
  UserX,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api, { endpoints, FILE_BASE_URL } from "../config/api.js";
import ViewProfilePage from "../components/ViewProfilePage.jsx";
import UserFormModal from "../components/UserFormModal.jsx";
import SweetAlert from "../components/SweetAlert.jsx";
import { PERMISSIONS } from "../utils/permissions.js";
import { useAuth } from "../context/AuthContext.jsx";

const getUserInitials = (user) => {
  if (user?.firstName && user?.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  if (user?.username) return user.username[0].toUpperCase();
  if (user?.email) return user.email[0].toUpperCase();
  return "U";
};

const UserAvatar = ({ user }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [user?.imageUrl]);

  if (user?.imageUrl && !imageError) {
    return (
      <img
        src={`${FILE_BASE_URL}/userimages/${user.imageUrl}`}
        alt={user.fullName || user.username}
        className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-semibold">
      {getUserInitials(user)}
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange, inFooter = false }) => {
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
        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
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

const AccountPage = () => {
  const PAGE_SIZE = 10;
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [workgroups, setWorkgroups] = useState([]);
  const [units, setUnits] = useState([]);
  const [departments, setDepartments] = useState([]);
  const { hasPermission } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [selectedUser, setSelectedUser] = useState(null);

  // Add/Edit modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [formModalMode, setFormModalMode] = useState("add"); // "add" | "edit"
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(endpoints.users.getAll);
      setUsers(response.data.users || []);
    } catch (err) {
      console.error("Fetch users error:", err);
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get(endpoints.roles.getAll);
      setRoles(response.data.roles || []);
    } catch (err) {
      console.error("Fetch roles error:", err);
      // Non-fatal: the Add/Edit modal will just show an empty role list
    }
  };

  const fetchWorkgroups = async () => {
    try {
      const response = await api.get(endpoints.workgroups.getAll);
      setWorkgroups(response.data.workgroups || []);
    } catch (err) {
      console.error("Fetch workgroups error:", err);
      // Non-fatal: the Add/Edit modal will just show an empty workgroup list
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await api.get(endpoints.units.getAll);
      setUnits(response.data.units || []);
    } catch (err) {
      console.error("Fetch units error:", err);
      // Non-fatal: the Add/Edit modal will just show an empty units list
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get(endpoints.departments.getAll);
      setDepartments(response.data.departments || []);
    } catch (err) {
      console.error("Fetch departments error:", err);
      // Non-fatal: the Add/Edit modal will just show an empty department list
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchWorkgroups();
    fetchUnits();
    fetchDepartments();
  }, []);

  useEffect(() => {
    const handleRefresh = (event) => {
      if (event.detail?.pathname && event.detail.pathname !== location.pathname) return;
      if (location.pathname !== "/admin/account") return;

      fetchUsers();
      fetchRoles();
      fetchWorkgroups();
      fetchUnits();
      fetchDepartments();
    };

    window.addEventListener("app:refresh", handleRefresh);
    return () => window.removeEventListener("app:refresh", handleRefresh);
  }, [location.pathname]);

  const toggleMenu = (id, e) => {
    if (menuOpen && openMenuId === id) {
      setMenuOpen(false);
      setOpenMenuId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.top,
      right: window.innerWidth - rect.left + 8,
    });
    setOpenMenuId(id);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setOpenMenuId(null);
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

  // ── ADD ──────────────────────────────────────
  const handleAddUser = () => {
    setFormModalMode("add");
    setEditingUser(null);
    setShowFormModal(true);
  };

  // ── VIEW ─────────────────────────────────────
  const handleView = (id) => {
    const user = users.find((u) => u.id === id);
    setSelectedUser(user);
    closeMenu();
  };

  // ── EDIT ─────────────────────────────────────
  const handleEdit = (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    setFormModalMode("edit");
    setEditingUser(user);
    setShowFormModal(true);
    closeMenu();
  };

  // Called by UserFormModal after a successful create/update
  const handleFormSuccess = (savedUser, mode) => {
    if (mode === "add") {
      setUsers((prev) => [savedUser, ...prev]);
    } else {
      setUsers((prev) => prev.map((u) => (u.id === savedUser.id ? savedUser : u)));
    }
  };

  // ── DEACTIVATE / ACTIVATE ────────────────────
  const handleDeactivate = async (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    closeMenu();

    const activating = user.status !== "Active";
    const newStatus = activating ? "Active" : "Inactive";

    const result = await SweetAlert.confirm(
      activating ? "Activate this user?" : "Deactivate this user?",
      activating
        ? `${user.username} will regain access to the system.`
        : `${user.username} will lose access to the system.`,
      activating ? "Yes, activate" : "Yes, deactivate"
    );
    if (!result.isConfirmed) return;

    try {
      const response = await api.put(endpoints.users.update(id), { status: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: response.data.user.status } : u))
      );
      SweetAlert.toast.success(activating ? "User activated" : "User deactivated");
    } catch (err) {
      SweetAlert.error("Failed", err.response?.data?.message || "Failed to update status.");
    }
  };

  // ── DELETE ───────────────────────────────────
  const handleDelete = async (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    closeMenu();

    const result = await SweetAlert.confirmDelete(user.username);
    if (!result.isConfirmed) return;

    try {
      await api.delete(endpoints.users.delete(id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
      SweetAlert.toast.success("User deleted");
    } catch (err) {
      SweetAlert.error("Failed", err.response?.data?.message || "Failed to delete user.");
    }
  };

  const formatLastLogin = (dateStr) => {
    if (!dateStr) return "Never";
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const uniqueRoles = [...new Set(users.map((u) => u.role).filter(Boolean))];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  const totalFilteredUsers = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredUsers / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="rounded-lg select-none">
      {/* If a user is selected, show the profile page instead of the table */}
      {selectedUser ? (
        <ViewProfilePage
          user={selectedUser}
          onBack={() => setSelectedUser(null)}
          onUserUpdate={(updatedUser) => {
            setSelectedUser(updatedUser);
            setUsers((prev) =>
              prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
            );
          }}
        />
      ) : (
        <>
          {/* Header */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.35em] text-emerald-500">
                Admin Tool
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-700 dark:text-white mt-1">
                Manage Account
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                Manage users, roles, and account status
              </p>
            </div>
          </div>

          {/* Search + Filter + Add Button */}
          <div className="mb-6 flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-center sm:justify-end">
              <div className="relative w-full sm:w-auto">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by name, username, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="relative w-full sm:w-auto">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-9 py-2 text-sm text-slate-900 dark:text-white"
                >
                  <option value="">All Roles</option>
                  {uniqueRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>

              {hasPermission(PERMISSIONS.ACCOUNTS_CREATE) && (
                <button
                  onClick={handleAddUser}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-sm font-medium text-white transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  Add User
                </button>
              )}
            </div>
          </div>


          {/* Loading */}
          {loading && (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <div className="animate-spin rounded-full h-6 w-6 border-4 border-emerald-500 border-t-transparent mx-auto mb-3" />
              Loading users...
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 py-6 px-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle size={18} />
              <span className="flex-1">{error}</span>
              <button
                onClick={fetchUsers}
                className="text-sm underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-green">
                  <table className="min-w-full text-sm bg-white dark:bg-slate-900">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <th className="px-5 py-3 text-left whitespace-nowrap">Profile</th>
                        <th className="px-5 py-3 text-left whitespace-nowrap">Name</th>
                        <th className="px-5 py-3 text-left whitespace-nowrap">Username</th>
                        <th className="px-5 py-3 text-left whitespace-nowrap">Role</th>
                        <th className="px-5 py-3 text-left whitespace-nowrap">Workgroup</th>
                        <th className="px-5 py-3 text-left whitespace-nowrap">Status</th>
                        <th className="px-5 py-3 text-left whitespace-nowrap">Last Login</th>
                        <th className="px-5 py-3 text-center whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800/40 divide-y divide-slate-200 dark:divide-slate-700">
                      {paginatedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-slate-500">
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        paginatedUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                          >
                            <td className="px-5 py-3.5 whitespace-nowrap align-top">
                              <UserAvatar user={user} />
                            </td>
                            <td className="px-5 py-3.5 text-xs sm:text-sm align-top">
                              <div className="font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap overflow-hidden text-ellipsis">
                                {user.fullName || "—"}
                              </div>
                              <div className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
                                {user.email}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 align-top">
                              <span className="block max-w-full whitespace-nowrap overflow-hidden text-ellipsis">{user.username}</span>
                            </td>
                            <td className="px-5 py-3.5 text-xs sm:text-sm align-top">
                              <span className="inline-flex max-w-full px-3 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">
                                {user.role || "—"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 align-top">
                              <span className="block max-w-full whitespace-nowrap overflow-hidden text-ellipsis">{(typeof user.workgroup === "object"
                                ? user.workgroup?.workgroupName
                                : user.workgroup) || "—"}</span>
                            </td>
                            <td className="px-5 py-3.5 text-xs sm:text-sm align-top">
                              <span
                                className={`inline-flex max-w-full px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap overflow-hidden text-ellipsis ${user.status === "Active"
                                    ? "bg-green-100 text-green-700 dark:bg-green-600 dark:text-white"
                                    : "bg-red-100 text-red-700 dark:bg-red-600 dark:text-white"
                                  }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 align-top">
                              <span className="block max-w-full whitespace-nowrap overflow-hidden text-ellipsis">{formatLastLogin(user.lastLogin)}</span>
                            </td>
                            <td className="px-5 py-3.5 text-center whitespace-nowrap align-top">
                              <button
                                type="button"
                                onClick={(e) => toggleMenu(user.id, e)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700 transition"
                                aria-label="Open actions"
                              >
                                <EllipsisVertical size={15} className="pointer-events-none" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="border-t border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-950/30">
                      <tr>
                        <td colSpan={8} className="px-5 py-3">
                          <div className="flex flex-row items-center justify-between gap-3">
                            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                              {totalFilteredUsers === 0 ? (
                                <span>Showing 0 of 0 users</span>
                              ) : (
                                <span>
                                  Showing {(currentPage - 1) * PAGE_SIZE + 1}-
                                  {Math.min(currentPage * PAGE_SIZE, totalFilteredUsers)} of {totalFilteredUsers} users
                                </span>
                              )}
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
                </div>
              </div>
            </>
          )}

          {/* Fixed dropdown */}
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeMenu} />
              <div
                className="fixed z-50 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1"
                style={{ top: menuPos.top, right: menuPos.right }}
              >
                <button
                  onClick={() => handleView(openMenuId)}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                >
                  <Eye size={15} /> View Profile
                </button>
                {hasPermission(PERMISSIONS.ACCOUNTS_UPDATE) && (
                  <button
                    onClick={() => handleEdit(openMenuId)}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                  >
                    <Edit size={15} /> Edit User
                  </button>
                )}
                {hasPermission(PERMISSIONS.ACCOUNTS_UPDATE) && (
                  <button
                    onClick={() => handleDeactivate(openMenuId)}
                    className="w-full px-4 py-2.5 text-left text-sm text-yellow-600 dark:text-yellow-400 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                  >
                    <UserX size={15} />
                    {users.find((u) => u.id === openMenuId)?.status === "Active"
                      ? "Deactivate"
                      : "Activate"}
                  </button>
                )}
                {hasPermission(PERMISSIONS.ACCOUNTS_DELETE) && (
                  <button
                    onClick={() => handleDelete(openMenuId)}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                  >
                    <Trash2 size={15} /> Remove User
                  </button>
                )}
              </div>
            </>
          )}

        </>
      )}

      {/* Add/Edit User Modal */}
      {showFormModal && (
        <UserFormModal
          mode={formModalMode}
          user={editingUser}
          roles={roles}
          workgroups={workgroups}
          units={units}
          departments={departments}
          onClose={() => setShowFormModal(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default AccountPage;