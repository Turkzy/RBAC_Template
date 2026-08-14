import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { EyeOff, Eye } from "lucide-react";
import backgroundlogin from "../assets/login.png";
import api, { endpoints } from "../config/api.js";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const token = searchParams.get("token");

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

  const getPasswordValidationStatus = (value) =>
    passwordValidationRules.map((rule) => ({
      ...rule,
      valid: rule.test(value),
    }));

  const passwordValidationStatus = getPasswordValidationStatus(password);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setError(null);
    setShowPasswordValidation(value.length > 0);
  };

  const handlePasswordBlur = () => {
    if (password) setShowPasswordValidation(true);
  };

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const passwordRules = getPasswordValidationStatus(password);
    const invalidRules = passwordRules.filter((rule) => !rule.valid);

    if (invalidRules.length > 0) {
      setShowPasswordValidation(true);
      setError("Password does not meet the requirements.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setShowPasswordValidation(true);
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post(endpoints.auth.passwordReset.reset, {
        token,
        newPassword: password,
        confirmPassword,
      });

      if (response.status === 200 || response.data.error === false) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(response.data.message || "Failed to reset password");
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to reset password";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center px-3 py-6 sm:px-4"
        style={{ backgroundImage: `url(${backgroundlogin})` }}
      >
        <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/30 bg-white/95 shadow-2xl backdrop-blur-md sm:rounded-3xl">
          <div className="bg-emerald-600 p-6 text-center text-white sm:p-10">
            <h1 className="mb-2 text-2xl font-semibold sm:text-3xl">Password Reset Complete</h1>
            <p className="mx-auto max-w-xl text-xs text-emerald-100 sm:text-sm">
              Your password has been updated successfully. You will be redirected to login shortly.
            </p>
          </div>
          <div className="p-6 sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl font-bold text-emerald-700 sm:h-24 sm:w-24">
              ✓
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-3 py-6 sm:px-4 sm:py-10"
      style={{ backgroundImage: `url(${backgroundlogin})` }}
    >
      <div className="w-full max-w-5xl grid gap-4 sm:gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
        <div className="rounded-2xl border border-white/30 bg-white/95 p-5 shadow-2xl backdrop-blur-md sm:rounded-3xl sm:p-8 lg:p-10">
          <div className="mb-6 sm:mb-8">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-500 sm:text-xs">
              Reset your password
            </p>
            <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Create a secure new password
            </h1>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
              {error}
            </div>
          )}

          {token ? (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-700 sm:text-sm">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    placeholder="Enter new password"
                    className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 pr-11 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:rounded-2xl sm:px-4 sm:py-3"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                </div>

                {showPasswordValidation && passwordValidationStatus.some((rule) => !rule.valid) && (
                  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/10 sm:rounded-2xl sm:p-4">
                    <div className="space-y-2 text-xs sm:text-sm">
                      {passwordValidationStatus
                        .filter((rule) => !rule.valid)
                        .map((rule) => (
                          <div key={rule.key} className="flex items-start gap-2">
                            <span className="mt-1 h-4 w-4 text-red-500">•</span>
                            <p className="text-red-600 dark:text-red-400">{rule.label}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-700 sm:text-sm">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:rounded-2xl sm:px-4 sm:py-3"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-xl py-3 text-sm font-semibold text-white transition-all sm:rounded-2xl sm:text-base ${
                  loading ? "cursor-not-allowed bg-slate-400" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center text-xs text-slate-600 sm:rounded-2xl sm:p-6 sm:text-sm">
              Invalid reset link
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/30 bg-emerald-600/95 p-5 text-white shadow-2xl backdrop-blur-md sm:rounded-3xl sm:p-8 lg:p-10">
          <div className="mb-5 sm:mb-6">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-200 sm:text-xs">
              Secure Reset
            </p>
            <h2 className="text-xl font-semibold sm:text-2xl">Why this matters</h2>
          </div>
          <div className="space-y-3 text-xs text-emerald-100 sm:space-y-4 sm:text-sm">
            <div className="rounded-xl bg-white/10 p-3 sm:rounded-2xl sm:p-4">
              <p className="font-semibold">Strong password</p>
              <p className="mt-1 text-emerald-100/90">
                Protects your account from unauthorized access and keeps your data safe.
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 sm:rounded-2xl sm:p-4">
              <p className="font-semibold">One-time link</p>
              <p className="mt-1 text-emerald-100/90">
                The reset link expires after one hour and can only be used once.
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 sm:rounded-2xl sm:p-4">
              <p className="font-semibold">Verified by email</p>
              <p className="mt-1 text-emerald-100/90">
                You will receive a confirmation email after your password is changed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;