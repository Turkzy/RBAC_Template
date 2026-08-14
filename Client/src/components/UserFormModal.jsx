import React, { useState, useEffect } from "react";
import { X, Loader2, ChevronDown } from "lucide-react";
import api, { endpoints } from "../config/api";
import SweetAlert from "./SweetAlert";

/**
 * Add/Edit User modal.
 *
 * Props:
 *  - mode: "add" | "edit"
 *  - user: the user object being edited (only used when mode === "edit")
 *  - roles: [{ id, name }] list for the role dropdown
 *  - onClose: () => void
 *  - onSuccess: (user, mode) => void  -- called with the saved user after a successful save
 */
const UserFormModal = ({ mode, user, roles, workgroups = [], units = [], departments = [], onClose, onSuccess }) => {
  const isEdit = mode === "edit";

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    roleId: "",
    workgroupId: "",
    unitsId: "",
    position: "",
    address: "",
    birthdate: "",
    DepartmentId: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);

  useEffect(() => {
    if (isEdit && user) {
      setFormData({
        firstName: user.firstName || "",
        middleName: user.middleName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        username: user.username || "",
        password: "",
        confirmPassword: "",
        roleId: user.roleId || "",
        workgroupId: user.workgroupId || "",
        unitsId: user.unitsId || "",
        position: user.position || "",
        address: user.address || "",
        birthdate: user.birthdate || "",
        DepartmentId: user.DepartmentId || "",
      });
    }
  }, [isEdit, user]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
    if (field === "password") {
      setShowPasswordValidation(value.length > 0);
    }
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

  const handleNewPasswordBlur = () => {
    if (formData.password) {
      setShowPasswordValidation(true);
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.username.trim()) newErrors.username = "Username is required";

    const passwordStatus = getPasswordValidationStatus(formData.password);
    const passwordInvalid = passwordStatus.some((rule) => !rule.valid);

    if (!isEdit) {
      // Password required on create
      if (!formData.password) newErrors.password = "Password is required";
      else if (passwordInvalid) newErrors.password = "Password must meet all requirements";
    } else if (formData.password && passwordInvalid) {
      // Optional on edit, but if provided must be valid
      newErrors.password = "Password must meet all requirements";
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.roleId) newErrors.roleId = "Please select a role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        roleId: formData.roleId,
        workgroupId: formData.workgroupId || null,
        unitsId: formData.unitsId || null,
        position: formData.position.trim() || null,
        address: formData.address.trim() || null,
        birthdate: formData.birthdate || null,
        DepartmentId: formData.DepartmentId || null,
      };
      if (formData.password) payload.password = formData.password;

      let response;
      if (isEdit) {
        response = await api.put(endpoints.users.update(user.id), payload);
      } else {
        response = await api.post(endpoints.users.create, payload);
      }

      SweetAlert.toast.success(isEdit ? "User updated" : "User created");
      onSuccess(response.data.user, mode);
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong. Please try again.";
      setErrors((prev) => ({ ...prev, form: message }));
      SweetAlert.toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-lg lg:max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="min-w-0 truncate text-base sm:text-lg font-semibold text-slate-700 dark:text-white">
            {isEdit ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 sm:px-5 py-3 sm:py-4 space-y-4 overflow-y-auto">
          {errors.form && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg break-words">
              {errors.form}
            </div>
          )}

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100 mb-4">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange("firstName")}
                    className={`w-full px-3 py-2.5 sm:py-2 border rounded-lg bg-white dark:bg-slate-800 text-base sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors ${
                      errors.firstName ? "border-red-400" : "border-slate-200 dark:border-slate-700"
                    }`}
                    placeholder="Juan"
                  />
                  {errors.firstName && <p className="text-xs text-red-500 mt-1 break-words">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={handleChange("middleName")}
                    className="w-full px-3 py-2.5 sm:py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-base sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange("lastName")}
                    className={`w-full px-3 py-2.5 sm:py-2 border rounded-lg bg-white dark:bg-slate-800 text-base sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors ${
                      errors.lastName ? "border-red-400" : "border-slate-200 dark:border-slate-700"
                    }`}
                    placeholder="Dela Cruz"
                  />
                  {errors.lastName && <p className="text-xs text-red-500 mt-1 break-words">{errors.lastName}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={handleChange("address")}
                    className="w-full px-3 py-2.5 sm:py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-base sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Optional"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Birthdate
                  </label>
                  <input
                    type="date"
                    value={formData.birthdate}
                    onChange={handleChange("birthdate")}
                    className="w-full px-3 py-2.5 sm:py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-base sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100 mb-4">
                Employee Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Workgroup
                  </label>
                  <div className="relative">
                    <select
                      value={formData.workgroupId}
                      onChange={handleChange("workgroupId")}
                      className="w-full appearance-none pr-9 px-3 py-2.5 sm:py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-base sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors truncate"
                    >
                      <option value="">Select a workgroup</option>
                      {workgroups.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.workgroupName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <div className="relative">
                    <select
                      value={formData.DepartmentId}
                      onChange={handleChange("DepartmentId")}
                      className="w-full appearance-none pr-9 px-3 py-2.5 sm:py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-base sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors truncate"
                    >
                      <option value="">Select a department</option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.departmentName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Unit
                  </label>
                  <div className="relative">
                    <select
                      value={formData.unitsId}
                      onChange={handleChange("unitsId")}
                      className="w-full appearance-none pr-9 px-3 py-2.5 sm:py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-base sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors truncate"
                    >
                      <option value="">Select a unit</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.UnitName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={handleChange("position")}
                    className="w-full px-3 py-2.5 sm:py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-base sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100 mb-4">
                Assignment
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Role
                </label>
                <div className="relative">
                  <select
                    value={formData.roleId}
                    onChange={handleChange("roleId")}
                    className={`w-full appearance-none pr-9 px-3 py-2.5 sm:py-2 border rounded-lg bg-white dark:bg-slate-800 text-base sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors truncate ${
                      errors.roleId ? "border-red-400" : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <option value="">Select a role</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                {errors.roleId && <p className="text-xs text-red-500 mt-1 break-words">{errors.roleId}</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100 mb-4">
                Account Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    className={`w-full px-3 py-2.5 sm:py-2 border rounded-lg bg-white dark:bg-slate-800 text-base sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors ${
                      errors.email ? "border-red-400" : "border-slate-200 dark:border-slate-700"
                    }`}
                    placeholder="user@ndc.gov.ph"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1 break-words">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    autoComplete="username"
                    value={formData.username}
                    onChange={handleChange("username")}
                    className={`w-full px-3 py-2.5 sm:py-2 border rounded-lg bg-white dark:bg-slate-800 text-base sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors ${
                      errors.username ? "border-red-400" : "border-slate-200 dark:border-slate-700"
                    }`}
                    placeholder="jdelacruz"
                  />
                  {errors.username && <p className="text-xs text-red-500 mt-1 break-words">{errors.username}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    {isEdit ? "New Password (optional)" : "Password"}
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange("password")}
                    onBlur={handleNewPasswordBlur}
                    className={`w-full px-3 py-2.5 sm:py-2 border rounded-lg bg-white dark:bg-slate-800 text-base sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors ${
                      errors.password ? "border-red-400" : "border-slate-200 dark:border-slate-700"
                    }`}
                    placeholder={isEdit ? "Leave blank to keep current password" : "At least 8 characters"}
                  />
                  {errors.password && <p className="text-xs text-red-500 mt-1 break-words">{errors.password}</p>}
                  {showPasswordValidation &&
                    getPasswordValidationStatus(formData.password).some((rule) => !rule.valid) && (
                      <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/10">
                        <div className="space-y-2 text-sm">
                          {getPasswordValidationStatus(formData.password)
                            .filter((rule) => !rule.valid)
                            .map((rule) => (
                              <div key={rule.key} className="flex items-start gap-2">
                                <span className="mt-1 h-4 w-4 shrink-0 text-red-500">•</span>
                                <p className="text-red-600 dark:text-red-400 break-words">{rule.label}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    className={`w-full px-3 py-2.5 sm:py-2 border rounded-lg bg-white dark:bg-slate-800 text-base sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors ${
                      errors.confirmPassword ? "border-red-400" : "border-slate-200 dark:border-slate-700"
                    }`}
                    placeholder="Re-enter password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1 break-words">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition shadow-sm"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;