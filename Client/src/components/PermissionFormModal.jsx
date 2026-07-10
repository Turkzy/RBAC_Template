import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import api, { endpoints } from "../config/api";
import SweetAlert from "./SweetAlert";

const PermissionFormModal = ({ mode, permission, onClose, onSuccess }) => {
  const isEdit = mode === "edit";
  const [formData, setFormData] = useState({ label: "", name: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && permission) {
      setFormData({ label: permission.label || "", name: permission.name || "" });
    }
  }, [isEdit, permission]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.label.trim()) newErrors.label = "Label is required";
    if (!formData.name.trim()) newErrors.name = "Permission key is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      let response;
      if (isEdit) {
        response = await api.put(endpoints.rbac.permissions.update(permission.id), formData);
      } else {
        response = await api.post(endpoints.rbac.permissions.create, formData);
      }

      SweetAlert.toast.success(isEdit ? "Permission updated" : "Permission created");
      onSuccess(response.data.permission || response.data, mode);
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong";
      setErrors((prev) => ({ ...prev, form: message }));
      SweetAlert.toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-white">
            {isEdit ? "Edit Permission" : "Add Permission"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {errors.form && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {errors.form}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
              Label (Human Readable)
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={handleChange("label")}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500 ${
                errors.label ? "border-red-400" : "border-slate-200 dark:border-slate-700"
              }`}
              placeholder="e.g. View Users"
            />
            {errors.label && <p className="text-xs text-red-500 mt-1">{errors.label}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
              Permission Key
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleChange("name")}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500 ${
                errors.name ? "border-red-400" : "border-slate-200 dark:border-slate-700"
              }`}
              placeholder="e.g. users.view"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Create Permission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PermissionFormModal;