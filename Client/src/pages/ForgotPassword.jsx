import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import backgroundlogin from "../assets/login.png";
import api, { endpoints } from "../config/api.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post(endpoints.auth.passwordReset.request, { email });
      
      if (response.status === 200) {
        setSuccess(true);
        setEmail("");
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center px-3 py-6 sm:px-4 sm:py-10"
        style={{ backgroundImage: `url(${backgroundlogin})` }}
      >
        <div className="w-full max-w-xl bg-white/95 rounded-2xl border border-white/30 shadow-2xl backdrop-blur-md overflow-hidden sm:rounded-3xl">
          <div className="bg-emerald-600 p-6 text-center text-white sm:p-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-700 sm:h-20 sm:w-20">
              <Mail className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <h1 className="mb-2 text-2xl font-semibold sm:text-3xl">Check your inbox</h1>
            <p className="mx-auto max-w-lg text-xs text-emerald-100 sm:text-sm">
              We’ve sent a password reset link to your email. Follow the instructions to update your password.
            </p>
          </div>
          <div className="p-6 text-center sm:p-10">
            <p className="text-xs text-slate-500 sm:text-sm">
              Redirecting to login in a few seconds...
            </p>
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
              Forgot Password
            </p>
            <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Request a password reset link
            </h1>
            <p className="mt-3 text-xs text-slate-500 sm:text-sm">
              Enter the email address associated with your account and we’ll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-700 sm:text-sm">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 sm:text-sm">
              Remember your password?{" "}
              <button
                onClick={() => navigate("/login")}
                className="font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Back to Login
              </button>
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/30 bg-emerald-600/95 p-5 text-white shadow-2xl backdrop-blur-md sm:rounded-3xl sm:p-8 lg:p-10">
          <div className="mb-5 sm:mb-6">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-200 sm:text-xs">
              Secure reset process
            </p>
            <h2 className="text-xl font-semibold sm:text-2xl">What to expect</h2>
          </div>
          <div className="space-y-3 text-xs text-emerald-100 sm:space-y-4 sm:text-sm">
            <div className="rounded-xl bg-white/10 p-3 sm:rounded-2xl sm:p-4">
              <p className="font-semibold">One-time email link</p>
              <p className="mt-1 text-emerald-100/90">
                The link expires after one hour and can only be used once.
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 sm:rounded-2xl sm:p-4">
              <p className="font-semibold">Account safety</p>
              <p className="mt-1 text-emerald-100/90">
                Use an email you can access, and keep your new password secure.
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 sm:rounded-2xl sm:p-4">
              <p className="font-semibold">Verified by email</p>
              <p className="mt-1 text-emerald-100/90">
                We only send reset links to your registered email address.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default ForgotPassword;