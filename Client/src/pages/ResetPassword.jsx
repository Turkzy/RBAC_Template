import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { EyeOff, Eye } from "lucide-react";
import backgroundlogin from "../assets/login.png";
import api from "../config/api.js";

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
      const response = await api.post("/password-reset/reset", {
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
        className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
        style={{ backgroundImage: `url(${backgroundlogin})` }}
      >
        <div className="w-full max-w-xl bg-white/95 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md border border-white/30">
          <div className="bg-emerald-600 p-10 text-center text-white">
            <h1 className="text-3xl font-semibold mb-2">Password Reset Complete</h1>
            <p className="text-sm text-emerald-100 max-w-xl mx-auto">
              Your password has been updated successfully. You will be redirected to login shortly.
            </p>
          </div>
          <div className="p-10">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-4xl font-bold">
              ✓
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-10"
      style={{ backgroundImage: `url(${backgroundlogin})` }}
    >
      <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl bg-white/95 p-10 shadow-2xl backdrop-blur-md border border-white/30">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-500 mb-2">
              Reset your password
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">Create a secure new password</h1>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
              {error}
            </div>
          )}

          {token ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    placeholder="Enter new password"
                    className="block w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {showPasswordValidation && passwordValidationStatus.some((rule) => !rule.valid) && (
                  <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/10">
                    <div className="space-y-2 text-sm">
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="block w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-2xl text-white font-semibold transition-all ${
                  loading ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
              Invalid reset link
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-emerald-600/95 p-10 text-white shadow-2xl backdrop-blur-md border border-white/30">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200 mb-2">
              Secure Reset
            </p>
            <h2 className="text-2xl font-semibold">Why this matters</h2>
          </div>
          <div className="space-y-4 text-sm text-emerald-100">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="font-semibold">Strong password</p>
              <p className="mt-1 text-emerald-100/90">
                Protects your account from unauthorized access and keeps your data safe.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="font-semibold">One-time link</p>
              <p className="mt-1 text-emerald-100/90">
                The reset link expires after one hour and can only be used once.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
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