import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Mail,
  User,
  ShieldCheck,
  Clock,
  CircleCheck,
  CircleX,
  KeyRound,
  Building2,
  Users,
  Camera,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Activity,
  LogIn,
  LogOut,
  PenSquare,
  PlusCircle,
  Power,
  UserX as UserXIcon,
  Calendar
} from "lucide-react";
import { FILE_BASE_URL } from "../config/api";
import api, { endpoints } from "../config/api";
import SweetAlert from "./SweetAlert";
import { useAuth } from "../context/AuthContext";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const MAX_IMAGE_SIZE = 5_000_000; // 5MB — keep in sync with server/services/fileService.js

const Pagination = ({ currentPage, totalPages, onPageChange, inFooter = false }) => {
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

  if (totalPages <= 1) return null;

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

const ViewProfilePage = ({
  user,
  onBack,
  onBackLabel = "Back to Manage Account",
  editable = true,
  onUserUpdate,
  onCurrentUserUpdate,
}) => {
  const { user: currentUser } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [settingsForm, setSettingsForm] = useState({
    firstName: user?.firstName || "",
    middleName: user?.middleName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    username: user?.username || "",
    workgroupId: user?.workgroup?.id || user?.workgroupId || "",
    unitsId: user?.units?.id || user?.unitsId || "",
    position: user?.position || "",
    address: user?.address || "",
    birthdate: user?.birthdate || "",
    DepartmentId: user?.DepartmentId || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [twoFactorSaving, setTwoFactorSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [workgroups, setWorkgroups] = useState([]);
  const [units, setUnits] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLogsLoading, setActivityLogsLoading] = useState(false);
  const [activitySearch, setActivitySearch] = useState("");
  const [activityActionFilter, setActivityActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalCount, setActivityTotalCount] = useState(0);
  const [activityPageSize] = useState(10);
  const fileInputRef = useRef(null);
  const dateFilterRef = useRef(null);

  useEffect(() => {
    setImageError(false);
  }, [user?.imageUrl]);

  useEffect(() => {
    setSettingsForm({
      firstName: user?.firstName || "",
      middleName: user?.middleName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      username: user?.username || "",
      workgroupId: user?.workgroup?.id || user?.workgroupId || "",
      unitsId: user?.units?.id || user?.unitsId || "",
      position: user?.position || "",
      address: user?.address || "",
      birthdate: user?.birthdate || "",
      DepartmentId: user?.DepartmentId || "",
    });
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setFormError("");
    setPasswordError("");
    setIsDirty(false);
  }, [user]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [workgroupsResponse, unitsResponse, departmentsResponse] =
          await Promise.all([
            api.get(endpoints.workgroups.getAll),
            api.get(endpoints.units.getAll),
            api.get(endpoints.departments.getAll),
          ]);
        setWorkgroups(workgroupsResponse.data.workgroups || []);
        setUnits(unitsResponse.data.units || []);
        setDepartments(departmentsResponse.data.departments || []);
      } catch (err) {
        console.error("Failed to load workgroups, units, or departments:", err);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target)) {
        setShowDateFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setActivityPage(1);
  }, [user?.id, activitySearch, activityActionFilter, startDate, endDate]);

  useEffect(() => {
    let isMounted = true;

    const fetchUserActivityLogs = async () => {
      if (!user?.id) return;

      setActivityLogsLoading(true);
      try {
        const response = await api.get(endpoints.activityLogs.getAll, {
          params: {
            page: activityPage,
            limit: activityPageSize,
            userId: user.id,
            ...(activitySearch ? { q: activitySearch } : {}),
            ...(activityActionFilter ? { action: activityActionFilter } : {}),
            ...(startDate ? { from: startDate } : {}),
            ...(endDate ? { to: endDate } : {}),
          },
        });

        if (isMounted) {
          setActivityLogs(response.data.rows || []);
          setActivityTotalCount(response.data.count || 0);
          setActivityPage(response.data.page || activityPage);
        }
      } catch (err) {
        console.error("Failed to load user activity logs:", err);
        if (isMounted) {
          setActivityLogs([]);
          setActivityTotalCount(0);
        }
      } finally {
        if (isMounted) {
          setActivityLogsLoading(false);
        }
      }
    };

    fetchUserActivityLogs();

    return () => {
      isMounted = false;
    };
  }, [user?.id, activityPage, activityPageSize, activitySearch, activityActionFilter, startDate, endDate]);

  if (!user) return null;

  const formatLastLogin = (dateStr) => {
    if (!dateStr) return "Never logged in";
    return new Date(dateStr).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getApiErrorMessage = (err) => {
    const details = err.response?.data?.details;
    if (Array.isArray(details) && details.length > 0) {
      return details.map((item) => item.message).join(". ");
    }
    return err.response?.data?.message || err.message || "An error occurred.";
  };

  const passwordValidationRules = [
    {
      key: "length",
      label: "Password must be at least 8 characters long.",
      test: (value) => value.length >= 8,
    },
    {
      key: "uppercase",
      label: "Password must contain at least one uppercase letter.",
      test: (value) => /[A-Z]/.test(value),
    },
    {
      key: "lowercase",
      label: "Password must contain at least one lowercase letter.",
      test: (value) => /[a-z]/.test(value),
    },
    {
      key: "number",
      label: "Password must contain at least one number.",
      test: (value) => /[0-9]/.test(value),
    },
    {
      key: "special",
      label: "Password must contain at least one special character.",
      test: (value) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/\?]/.test(value),
    },
  ];

  const getPasswordValidationStatus = (value) => {
    return passwordValidationRules.map((rule) => ({
      ...rule,
      valid: rule.test(value),
    }));
  };

  const passwordValidationStatus = getPasswordValidationStatus(passwordForm.newPassword);
  const unmetPasswordValidationRules = passwordValidationStatus.filter(
    (rule) => !rule.valid,
  );

  // Check if user has a specific permission (fine-grained RBAC)
  const hasPermission = (permissionName) => {
    return currentUser?.permissionDetails?.some(p => p.name === permissionName);
  };

  // High-level access check combining ownership, role, and permissions
  const canAccessSettings = () => {
    // Always allow viewing own profile settings
    if (currentUser?.id === user?.id) return true;
    // Only Super Admin or users with accounts.update permission can view other users' settings
    if (currentUser?.role === "Super Admin") return true;
    return hasPermission("accounts_profile.manage");
  };

  // Check if user can edit the profile photo
  const canEditUserPhoto = () => {
    // Allow if viewing own profile
    if (currentUser?.id === user?.id) return true;
    // Only Super Admin can edit other users' photos
    if (currentUser?.role === "Super Admin") return true;
    return hasPermission("accounts.update")
  };

  const getActivityBadgeConfig = (action, metadata) => {
    const normalizedAction = (action || "").toLowerCase().replace(/[_-]/g, " ").trim();
    const isCompliance = metadata?.entity === "compliance";

    if (normalizedAction === "login") {
      return {
        label: "Login",
        icon: <LogIn className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
      };
    }
    if (normalizedAction === "logout") {
      return {
        label: "Logout",
        icon: <LogOut className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
      };
    }
    if (normalizedAction === "login failed" || normalizedAction === "failed login") {
      return {
        label: "Login Failed",
        icon: <AlertCircle className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
      };
    }
    if (normalizedAction === "create" || normalizedAction === "create compliance") {
      return {
        label: isCompliance ? "Create Compliance" : "Create",
        icon: <PlusCircle className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
      };
    }
    if (normalizedAction === "update" || normalizedAction === "update compliance") {
      return {
        label: isCompliance ? "Update Compliance" : "Update",
        icon: <PenSquare className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
      };
    }
    if (normalizedAction === "assign") {
      return {
        label: "Assign Permission",
        icon: <KeyRound className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
      };
    }
    if (normalizedAction === "remove") {
      return {
        label: "Remove Permission",
        icon: <Trash2 className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
      };
    }
    if (normalizedAction === "activate") {
      return {
        label: "Activate",
        icon: <Power className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
      };
    }
    if (normalizedAction === "deactivate") {
      return {
        label: "Deactivate",
        icon: <UserXIcon className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300",
      };
    }
    if (normalizedAction === "delete" || normalizedAction.includes("delete compliance")) {
      return {
        label: isCompliance ? "Delete Compliance" : "Delete",
        icon: <Trash2 className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
      };
    }
    if (normalizedAction === "password reset" || normalizedAction === "passwordreset" || normalizedAction === "password reset completed") {
      return {
        label: "Password Reset",
        icon: <KeyRound className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
      };
    }
    if (normalizedAction === "password reset requested" || normalizedAction === "password resetrequest" || normalizedAction === "passwordreset requested") {
      return {
        label: "Password Reset Requested",
        icon: <KeyRound className="h-3.5 w-3.5" />,
        className: "inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300",
      };
    }

    return {
      label: (action || "Activity").replace(/_/g, " "),
      icon: null,
      className: "inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    };
  };

  const activityTotalPages = Math.max(1, Math.ceil(activityTotalCount / activityPageSize));
  const activityStartRecord = activityTotalCount === 0 ? 0 : (activityPage - 1) * activityPageSize + 1;
  const activityEndRecord = activityTotalCount === 0 ? 0 : Math.min(activityPage * activityPageSize, activityTotalCount);

  const goToActivityPage = (nextPage) => {
    if (nextPage < 1 || nextPage > activityTotalPages) return;
    setActivityPage(nextPage);
  };

  const getUserInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.username) return user.username[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return "U";
  };

  const handleAvatarClick = () => {
    if (!editable || uploading || !canEditUserPhoto()) return;
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = async () => {
    if (!editable || uploading || !user.imageUrl || !canEditUserPhoto()) return;

    const result = await SweetAlert.confirm(
      "Remove profile photo",
      "Are you sure you want to remove your profile photo?",
      "Remove",
      "Cancel",
    );
    if (!result.isConfirmed) return;

    setUploading(true);
    try {
      const response = await api.put(endpoints.users.update(user.id), {
        removeImage: true,
      });
      setImageError(false);
      SweetAlert.toast.success("Profile photo removed");
      onUserUpdate?.(response.data.user);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to remove profile photo.";
      SweetAlert.toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    // Allow picking the same file again later
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      SweetAlert.toast.error("Only JPG, JPEG, and PNG files are allowed.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      SweetAlert.toast.error(
        `File too large. Maximum size is ${MAX_IMAGE_SIZE / 1_000_000}MB`,
      );
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const response = await api.put(
        endpoints.users.update(user.id),
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setImageError(false);
      SweetAlert.toast.success("Profile photo updated");
      onUserUpdate?.(response.data.user);
      onCurrentUserUpdate?.(response.data.user);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update profile photo.";
      SweetAlert.toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettingsForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setFormError("");
  };

  const handleSaveSettings = async () => {
    if (!editable || saving) return;

    if (
      !settingsForm.firstName.trim() ||
      !settingsForm.lastName.trim() ||
      !settingsForm.email.trim()
    ) {
      setFormError("First name, last name, and email are required.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(settingsForm.email)) {
      setFormError("Please enter a valid email format (e.g., user@example.com).");
      return;
    }

    const payload = {
      firstName: settingsForm.firstName,
      middleName: settingsForm.middleName,
      lastName: settingsForm.lastName,
      email: settingsForm.email,
      username: settingsForm.username,
      workgroupId: settingsForm.workgroupId || null,
      unitsId: settingsForm.unitsId || null,
      position: settingsForm.position || null,
      address: settingsForm.address || null,
      birthdate: settingsForm.birthdate || null,
      DepartmentId: settingsForm.DepartmentId || null,
    };

    setSaving(true);
    setFormError("");

    try {
      const response = await api.put(endpoints.users.update(user.id), payload);
      setIsDirty(false);
      SweetAlert.toast.success("Profile updated successfully");
      onUserUpdate?.(response.data.user);
      onCurrentUserUpdate?.(response.data.user);
    } catch (err) {
      const message =
        getApiErrorMessage(err) || "Failed to save profile changes.";
      setFormError(message);
      SweetAlert.toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const toggleTwoFactor = async () => {
    setTwoFactorSaving(true);
    try {
      const response = await api.post(endpoints.users.setTwoFactor, { enabled: !user.twoFactorEnabled });
      SweetAlert.toast.success(`Two-factor ${response.data.user.twoFactorEnabled ? 'enabled' : 'disabled'}`);
      onUserUpdate?.(response.data.user);
      onCurrentUserUpdate?.(response.data.user);
    } catch (err) {
      SweetAlert.toast.error(err.response?.data?.message || 'Failed to update two-factor setting');
    } finally {
      setTwoFactorSaving(false);
    }
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordError("");
    if (field === "newPassword") {
      setShowPasswordValidation(value.length > 0);
    }
  };

  const handleNewPasswordBlur = () => {
    if (passwordForm.newPassword) {
      setShowPasswordValidation(true);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!editable || passwordSaving) return;

    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setPasswordSaving(true);
    setPasswordError("");

    try {
      const response = await api.put(endpoints.users.update(user.id), {
        currentPassword,
        password: newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      SweetAlert.toast.success("Password changed successfully");
      onUserUpdate?.(response.data.user);
      onCurrentUserUpdate?.(response.data.user);
    } catch (err) {
      const message = getApiErrorMessage(err) || "Failed to change password.";

      SweetAlert.toast.error(message);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="w-full">
      {/* Back button + breadcrumb */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          {onBackLabel}
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === "overview"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            Overview
          </button>
          {canAccessSettings() && (
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 rounded-md   text-sm font-medium transition ${
                activeTab === "settings"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              Settings
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-4 gap-5">
        {/* Left card — Avatar + identity */}
        <div className="lg:col-span-2 2xl:col-span-1">
          <div className="p-6 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div
              className={`relative group ${editable && canEditUserPhoto() ? "cursor-pointer" : ""}`}
              onClick={handleAvatarClick}
              title={editable && canEditUserPhoto() ? "Click to change photo" : undefined}
            >
              {user.imageUrl && !imageError ? (
                <img
                  src={`${FILE_BASE_URL}/userimages/${user.imageUrl}`}
                  alt="Profile"
                  className="w-60 h-60 sm:w-60 sm:h-60 md:w-48 md:h-48 lg:w-64 lg:h-64 xl:w-64 2xl:w-72 2xl:h-72 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-60 h-60 sm:w-60 sm:h-60 md:w-48 md:h-48 lg:w-60 lg:h-60 xl:w-64 2xl:w-72 2xl:h-72 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 text-2xl sm:text-3xl md:text-4xl font-bold shadow-sm">
                  {getUserInitials()}
                </div>
              )}

              {editable && canEditUserPhoto() && (
                <div
                  className={`absolute inset-0 rounded-2xl flex items-center justify-center bg-black/50 transition-opacity ${
                    uploading
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {uploading ? (
                    <Loader2 size={22} className="text-white animate-spin" />
                  ) : (
                    <Camera size={22} className="text-white" />
                  )}
                </div>
              )}

              {editable && canEditUserPhoto() && user.imageUrl && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemovePhoto();
                  }}
                  disabled={uploading}
                  className="absolute top-3 right-3 z-10 rounded-full bg-white/90 dark:bg-slate-900/90 p-2 text-red-600 shadow hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50"
                  title="Remove profile photo"
                >
                  <Trash2 size={18} />
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <h2 className="mt-4 text-lg sm:text-xl font-bold text-slate-800 dark:text-white break-all">
              {user.fullName || user.username}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 break-all">
              {user.email}
            </p>

            {/* Role + status badges */}
            <div className="mt-3 flex flex-col sm:flex-row lg:flex-col items-center sm:items-center lg:items-start gap-2">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white whitespace-nowrap">
                {user.role || "No Role"}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                  user.status === "Active"
                    ? "bg-green-100 text-green-700 dark:bg-green-600 dark:text-white"
                    : "bg-red-100 text-red-700 dark:bg-red-600 dark:text-white"
                }`}
              >
                {user.status === "Active" ? (
                  <CircleCheck size={12} />
                ) : (
                  <CircleX size={12} />
                )}
                {user.status}
              </span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-3 2xl:col-span-3 flex flex-col gap-5">
          {activeTab === "overview" ? (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
                  Account Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-5">
                  <DetailRow
                    icon={<User size={16} />}
                    label="Full Name"
                    value={user.fullName || "—"}
                  />
                  <DetailRow
                    icon={<Mail size={16} />}
                    label="Email Address"
                    value={user.email}
                  />
                  <DetailRow
                    icon={<User size={16} />}
                    label="Username"
                    value={user.username}
                  />
                  <DetailRow
                    icon={<ShieldCheck size={16} />}
                    label="Assigned Role"
                    value={
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white">
                        {user.role || "—"}
                      </span>
                    }
                  />
                  <DetailRow
                    icon={<Building2 size={16} />}
                    label="Workgroup"
                    value={
                      (typeof user.workgroup === "object"
                        ? user.workgroup?.workgroupName
                        : user.workgroup) || "—"
                    }
                  />
                  <DetailRow
                    icon={<Users size={16} />}
                    label="Units"
                    value={
                      (typeof user.units === "object"
                        ? user.units?.UnitName
                        : user.units) || "—"
                    }
                  />
                  <DetailRow
                    icon={<User size={16} />}
                    label="Position"
                    value={user.position || "—"}
                  />
                  <DetailRow
                    icon={<User size={16} />}
                    label="Department"
                    value={
                      departments.find((d) => d.id === user.DepartmentId)
                        ?.departmentName ||
                      (typeof user.department === "object"
                        ? user.department?.departmentName
                        : user.department) ||
                      user.DepartmentId ||
                      "—"
                    }
                  />
                  <DetailRow
                    icon={<Clock size={16} />}
                    label="Birthdate"
                    value={
                      user.birthdate
                        ? new Date(user.birthdate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })
                        : "—"
                    }
                  />
                  <DetailRow
                    icon={<Clock size={16} />}
                    label="Last Login"
                    value={formatLastLogin(user.lastLogin)}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
                  Permissions
                </h3>
                {user.permissionDetails?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.permissionDetails.map((p) => (
                      <span
                        key={p.name}
                        title={p.name}
                        className="max-w-full inline-flex min-w-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2 py-1.5 text-[10px] leading-snug text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:px-3 sm:text-xs"
                        style={{ wordBreak: "break-word" }}
                      >
                        <KeyRound size={11} className="shrink-0 text-emerald-500" />
                        <span className="min-w-0 break-words">{p.label}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    No permissions assigned to this user's role.
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-950/20 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <Activity size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Activity History
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Review actions recorded for this profile.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                      <div className="relative w-full sm:w-56">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          value={activitySearch}
                          onChange={(e) => setActivitySearch(e.target.value)}
                          placeholder="Search description"
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="relative w-full sm:w-44">
                        <select
                          value={activityActionFilter}
                          onChange={(e) => setActivityActionFilter(e.target.value)}
                          className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-3 pr-9 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="">All actions</option>
                          <option value="login">Login</option>
                          <option value="logout">Logout</option>
                          <option value="create">Create</option>
                          <option value="update">Update</option>
                          <option value="activate">Activate</option>
                          <option value="deactivate">Deactivate</option>
                          <option value="delete">Delete</option>
                          <option value="password_reset">Password Reset</option>
                          <option value="password_reset_requested">Password Reset Requested</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      </div>
                      <div className="relative w-full sm:w-auto" ref={dateFilterRef}>
                        <button
                          type="button"
                          onClick={() => setShowDateFilter((value) => !value)}
                          className="w-full sm:w-auto inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <Calendar size={16} className="text-slate-500 dark:text-slate-400" />
                          {startDate || endDate ? `${startDate || "…"} – ${endDate || "…"}` : "Date range"}
                        </button>
                        {showDateFilter && (
                          <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-lg">
                            <div className="flex flex-col gap-3">
                              <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Start date</label>
                                <input
                                  type="date"
                                  value={startDate}
                                  onChange={(event) => setStartDate(event.target.value)}
                                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">End date</label>
                                <input
                                  type="date"
                                  value={endDate}
                                  onChange={(event) => setEndDate(event.target.value)}
                                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
                                />
                              </div>
                              <div className="flex justify-between gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStartDate("");
                                    setEndDate("");
                                  }}
                                  className="rounded-lg px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  Clear
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowDateFilter(false)}
                                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto scrollbar-green">
                    <table className="min-w-full text-sm bg-white dark:bg-slate-900">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950/20 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                          <th className="px-5 py-3 text-left whitespace-nowrap">Date</th>
                          <th className="px-5 py-3 text-left whitespace-nowrap">Action</th>
                          <th className="px-5 py-3 text-left">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800/40 divide-y divide-slate-200 dark:divide-slate-700">
                        {activityLogsLoading ? (
                          <tr>
                            <td colSpan={3} className="text-center py-12 text-xs sm:text-sm text-slate-400 dark:text-slate-500">
                              Loading activity logs...
                            </td>
                          </tr>
                        ) : activityLogs.length > 0 ? (
                          activityLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors align-top">
                              <td className="px-5 py-3.5 font-medium text-xs sm:text-sm text-slate-600 dark:text-slate-300 align-top whitespace-nowrap">
                                {new Date(log.createdAt).toLocaleString([], {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "numeric",
                                })}
                              </td>
                              <td className="px-5 py-3.5 align-top whitespace-nowrap">
                                <span className={getActivityBadgeConfig(log.action, log.metadata).className}>
                                  {getActivityBadgeConfig(log.action, log.metadata).icon}
                                  {getActivityBadgeConfig(log.action, log.metadata).label}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 align-top">
                                <span
                                  className="block max-w-[200px] truncate sm:max-w-[280px] md:max-w-[360px] lg:max-w-[460px]"
                                  title={log.description || "No additional details were recorded."}
                                >
                                  {log.description || "No additional details were recorded."}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="text-center py-12 text-xs sm:text-sm text-slate-400 dark:text-slate-500">
                              No activity logs found for this user yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="border-t border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-950/30">
                        <tr>
                          <td colSpan={3} className="px-5 py-3">
                            <div className="flex flex-row items-center justify-between gap-3">
                              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                {activityLogsLoading ? (
                                  "Loading records..."
                                ) : (
                                  <span>
                                    Showing {activityTotalCount === 0 ? 0 : activityStartRecord}-{activityEndRecord} of {activityTotalCount} records
                                  </span>
                                )}
                              </div>
                              <Pagination
                                currentPage={activityPage}
                                totalPages={activityTotalPages}
                                onPageChange={goToActivityPage}
                                inFooter={true}
                              />
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : canAccessSettings() ? (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  <div className="sm:col-span-2">
                    <div className="mb-3 flex items-center gap-3 sm:mb-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 sm:h-9 sm:w-9">
                        <User size={16} />
                      </span>
                      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 sm:text-xs">
                        Profle Settings
                      </h3>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 2xl:grid-cols-3">
                      <label className="block">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
                          First Name
                        </span>
                        <input
                          type="text"
                          value={settingsForm.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          className="mt-1.5 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none sm:mt-2 sm:text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
                          Middle Name
                        </span>
                        <input
                          type="text"
                          value={settingsForm.middleName}
                          onChange={(e) =>
                            handleInputChange("middleName", e.target.value)
                          }
                          className="mt-1.5 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none sm:mt-2 sm:text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
                          Last Name
                        </span>
                        <input
                          type="text"
                          value={settingsForm.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          className="mt-1.5 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none sm:mt-2 sm:text-sm"
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
                          Address
                        </span>
                        <input
                          type="text"
                          value={settingsForm.address}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                          className="mt-1.5 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none sm:mt-2 sm:text-sm"
                          placeholder="Optional"
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
                          Birthdate
                        </span>
                        <input
                          type="date"
                          value={settingsForm.birthdate}
                          onChange={(e) =>
                            handleInputChange("birthdate", e.target.value)
                          }
                          className="mt-1.5 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none sm:mt-2 sm:text-sm"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="sm:col-span-2 border-t border-slate-200 dark:border-slate-700 my-4" />
                  <div className="mb-3 flex items-center gap-3 sm:mb-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 sm:h-9 sm:w-9">
                      <Building2 size={16} />
                    </span>
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 sm:text-xs">
                      Employee Settings
                    </h3>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 2xl:grid-cols-3">
                      <label className="block">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
                          Workgroup
                        </span>
                        <div className="relative mt-1.5 sm:mt-2">
                          <select
                            value={settingsForm.workgroupId}
                            onChange={(e) =>
                              handleInputChange("workgroupId", e.target.value)
                            }
                            className="block w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 pr-9 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none sm:text-sm"
                          >
                            <option value="">No workgroup</option>
                            {workgroups.map((group) => (
                              <option key={group.id} value={group.id}>
                                {group.workgroupName}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </div>
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
                          Unit
                        </span>
                        <div className="relative mt-1.5 sm:mt-2">
                          <select
                            value={settingsForm.unitsId}
                            onChange={(e) =>
                              handleInputChange("unitsId", e.target.value)
                            }
                            className="block w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 pr-9 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none sm:text-sm"
                          >
                            <option value="">No unit</option>
                            {units.map((unit) => (
                              <option key={unit.id} value={unit.id}>
                                {unit.UnitName}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </div>
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
                          Department
                        </span>
                        <div className="relative mt-1.5 sm:mt-2">
                          <select
                            value={settingsForm.DepartmentId}
                            onChange={(e) =>
                              handleInputChange("DepartmentId", e.target.value)
                            }
                            className="block w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 pr-9 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none sm:text-sm"
                          >
                            <option value="">No department</option>
                            {departments.map((department) => (
                              <option key={department.id} value={department.id}>
                                {department.departmentName}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </div>
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
                          Position
                        </span>
                        <input
                          type="text"
                          value={settingsForm.position}
                          onChange={(e) =>
                            handleInputChange("position", e.target.value)
                          }
                          className="mt-1.5 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none sm:mt-2 sm:text-sm"
                          placeholder="Optional"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">
                          Email Address
                        </span>
                        <input
                          type="email"
                          value={settingsForm.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="mt-1.5 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none sm:mt-2 sm:text-sm"
                        />
                      </label>
                      {/* Two-factor moved to its own card below */}
                      <label className="block sm:col-span-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Username
                        </span>
                        <input
                          type="text"
                          value={settingsForm.username}
                          onChange={(e) =>
                            handleInputChange("username", e.target.value)
                          }
                          className="mt-2 block w-full rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {formError && (
                  <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                    {formError}
                  </p>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSettingsForm({
                        firstName: user.firstName || "",
                        middleName: user.middleName || "",
                        lastName: user.lastName || "",
                        email: user.email || "",
                        username: user.username || "",
                        workgroupId:
                          user?.workgroup?.id || user?.workgroupId || "",
                        unitsId: user?.units?.id || user?.unitsId || "",
                      });
                      setIsDirty(false);
                      setFormError("");
                    }}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800 transition duration-200"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={!isDirty || saving}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-600 transition duration-200"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-prose">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                        <ShieldCheck size={16} />
                      </span>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Two-Factor Authentication
                      </h3>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200">Add a second layer of security to your account</p>

                    {!user.twoFactorEnabled && (
                      <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/10 dark:border-yellow-900/50">
                        Two-factor authentication is <strong className="font-semibold">not enabled</strong>. Enabling it is strongly recommended and required by your organization's security policy for admin accounts.
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-end">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.twoFactorEnabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700 dark:text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>

                    <button
                      type="button"
                      onClick={toggleTwoFactor}
                      disabled={twoFactorSaving || !editable}
                      className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white sm:mt-4 ${user.twoFactorEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-violet-600 hover:bg-violet-700'} disabled:opacity-50`}
                    >
                      {twoFactorSaving ? (
                        <Loader2 size={14} className="text-white animate-spin" />
                      ) : (
                        user.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    <ShieldCheck size={16} />
                  </span>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Change Password
                  </h3>
                </div>
                <form onSubmit={handleChangePassword} className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={user?.username || user?.email || ""}
                    readOnly
                    className="hidden"
                  />
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Current Password
                    </span>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        handlePasswordInputChange(
                          "currentPassword",
                          e.target.value,
                        )
                      }
                      className="mt-2 block w-full rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      New Password
                    </span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        handlePasswordInputChange("newPassword", e.target.value)
                      }
                      onBlur={handleNewPasswordBlur}
                      className="mt-2 block w-full rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                    {showPasswordValidation && unmetPasswordValidationRules.length > 0 && (
                      <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/10">
                        <div className="space-y-2 text-sm">
                          {unmetPasswordValidationRules.map((rule) => (
                            <div
                              key={rule.key}
                              className="flex items-start gap-2"
                            >
                              <CircleX className="mt-1 h-4 w-4 text-red-500" />
                              <p className="text-red-600 dark:text-red-400">
                                {rule.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Confirm New Password
                    </span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        handlePasswordInputChange(
                          "confirmPassword",
                          e.target.value,
                        )
                      }
                      className="mt-2 block w-full rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Re-enter your new password to confirm it matches.
                    </p>
                  </label>
                  {passwordError && (
                    <p className="mt-4 text-sm text-red-600 dark:text-red-400 sm:col-span-2">
                      {passwordError}
                    </p>
                  )}
                  <div className="mt-6 flex justify-end sm:col-span-2">
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300 transition duration-200"
                    >
                      {passwordSaving
                        ? "Changing Password..."
                        : "Change Password"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-2 sm:gap-4">
    <div className="mt-0.5 shrink-0 rounded-lg bg-slate-100 p-2 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 sm:text-xs">
        {label}
      </p>
      <div className="mt-1 text-xs font-medium text-slate-700 break-words dark:text-slate-200 sm:text-sm">
        {value}
      </div>
    </div>
  </div>
);

export default ViewProfilePage;