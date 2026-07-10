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
        className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-10"
        style={{ backgroundImage: `url(${backgroundlogin})` }}
      >
        <div className="w-full max-w-xl bg-white/95 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md border border-white/30">
          <div className="bg-emerald-600 p-10 text-center text-white">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-emerald-700">
              <Mail className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-semibold mb-2">Check your inbox</h1>
            <p className="text-sm text-emerald-100 max-w-lg mx-auto">
              We’ve sent a password reset link to your email. Follow the instructions to update your password.
            </p>
          </div>
          <div className="p-10 text-center">
            <p className="text-sm text-slate-500">
              Redirecting to login in a few seconds...
            </p>
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
              Forgot Password
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">Request a password reset link</h1>
            <p className="mt-3 text-sm text-slate-500">
              Enter the email address associated with your account and we’ll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Remember your password?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Back to Login
              </button>
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-emerald-600/95 p-10 text-white shadow-2xl backdrop-blur-md border border-white/30">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200 mb-2">
              Secure reset process
            </p>
            <h2 className="text-2xl font-semibold">What to expect</h2>
          </div>
          <div className="space-y-4 text-sm text-emerald-100">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="font-semibold">One-time email link</p>
              <p className="mt-1 text-emerald-100/90">
                The link expires after one hour and can only be used once.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="font-semibold">Account safety</p>
              <p className="mt-1 text-emerald-100/90">
                Use an email you can access, and keep your new password secure.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
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