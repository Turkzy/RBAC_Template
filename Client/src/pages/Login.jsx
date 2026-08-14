import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import backgroundlogin from "../assets/login.png";
import logo from "../assets/ndc_logo.png";
import { EyeOff, Eye } from "lucide-react";
import api, { endpoints } from "../config/api.js";
import SweetAlert from "../components/SweetAlert";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const otpRefs = useRef([]);
  const otpLength = 6;

  const { login } = useAuth();
  const navigate = useNavigate();

  // Load saved email and rememberMe preference on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("ndc_cms_saved_email");
    const savedRememberMe =
      localStorage.getItem("ndc_cms_remember_me") === "true";

    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(savedRememberMe);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!requiresTwoFactor) {
        const response = await api.post(endpoints.auth.login, {
          email,
          password,
        });

        if (response.status === 200 && response.data.requiresTwoFactor) {
          setRequiresTwoFactor(true);
          setError(response.data.message || "Verification code sent to your email.");
          return;
        }

        if (response.status === 200 && response.data.user) {
          if (rememberMe) {
            localStorage.setItem("ndc_cms_saved_email", email);
            localStorage.setItem("ndc_cms_remember_me", "true");
          } else {
            localStorage.removeItem("ndc_cms_saved_email");
            localStorage.removeItem("ndc_cms_remember_me");
          }

          login(response.data.user);
          navigate("/dashboard", { replace: true });
          return;
        }
      } else {
        if (twoFactorCode.length !== otpLength) {
          setError("Please enter the full 6-digit verification code.");
          setLoading(false);
          return;
        }

        const response = await api.post(endpoints.auth.login, {
          email,
          password,
          code: twoFactorCode,
        });

        if (response.status === 200 && response.data.user) {
          if (rememberMe) {
            localStorage.setItem("ndc_cms_saved_email", email);
            localStorage.setItem("ndc_cms_remember_me", "true");
          } else {
            localStorage.removeItem("ndc_cms_saved_email");
            localStorage.removeItem("ndc_cms_remember_me");
          }

          login(response.data.user);
          // After successful 2FA, ask whether to trust this device for 30 days
          setLoading(false);
          try {
            const result = await SweetAlert.confirm(
              "Trust this device for 30 days?",
              "You can skip this on public or shared devices.",
              "Trust this device",
              "Don't trust"
            );
            if (result.isConfirmed) {
              try {
                await api.post(endpoints.users.trustDevice);
              } catch (err) {
                // non-fatal, just notify
                SweetAlert.toast?.error?.(err.response?.data?.message || "Failed to set trusted device");
              }
            }
          } finally {
            setLoading(true);
          }
          navigate("/dashboard", { replace: true });
          return;
        }
      }
    } catch (err) {
      const message = err?.response?.data?.message || "Invalid email or password.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTwoFactor = () => {
    setRequiresTwoFactor(false);
    setTwoFactorCode("");
    setError(null);
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextCode = twoFactorCode.split("");
    nextCode[index] = digit;
    const normalizedCode = nextCode.join("").slice(0, otpLength);

    setTwoFactorCode(normalizedCode);

    if (digit && index < otpLength - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !twoFactorCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < otpLength - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasted = (event.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, otpLength);
    if (!pasted) return;

    const nextCode = pasted.split("");
    const paddedCode = Array.from({ length: otpLength }, (_, index) => nextCode[index] || "");
    setTwoFactorCode(paddedCode.join(""));

    const nextIndex = Math.min(pasted.length, otpLength - 1);
    otpRefs.current[nextIndex]?.focus();
  };

  useEffect(() => {
    if (requiresTwoFactor) {
      otpRefs.current[0]?.focus();
    }
  }, [requiresTwoFactor]);

  return (
    <div
      className="h-screen w-screen bg-cover bg-center flex items-center justify-center lg:justify-start select-none px-4 animate-fade-in sm:px-8 md:px-12 lg:px-16"
      style={{ backgroundImage: `url(${backgroundlogin})` }}
    >
      <div className="flex flex-col items-center space-y-6 w-full max-w-xs sm:max-w-sm lg:max-w-md lg:ml-32">
        <img src={logo} className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto" />
        <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-700 leading-tight whitespace-nowrap sm:whitespace-normal font-tahoma text-center">
          Compliance Monitoring System
        </h1>

        <form className="w-full space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white/90 placeholder-gray-400 focus:border-green-100 focus:outline-none focus:ring-1 focus:ring-green-700 dark:text-black"
              required
              disabled={loading}
            />
          </div>
          <div>
            {!requiresTwoFactor ? (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm bg-white/90 placeholder-gray-400 focus:border-green-100 focus:outline-none focus:ring-1 focus:ring-green-700 dark:text-black"
                    required
                    placeholder="Enter your password"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-green-800 rounded border-gray-300 focus:ring-green-700 cursor-pointer"
                      disabled={loading}
                    />
                    <label
                      htmlFor="rememberMe"
                      className="ml-2 text-sm text-gray-700 cursor-pointer"
                    >
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-green-600 hover:text-green-700 font-semibold text-sm"
                  >
                    Forgot Password?
                  </button>
                </div>
              </>
            ) : (
              <>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="flex items-center justify-between gap-2" onPaste={handleOtpPaste}>
                  {Array.from({ length: otpLength }).map((_, index) => (
                    <input
                      key={`otp-${index}`}
                      ref={(element) => {
                        otpRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={twoFactorCode[index] || ""}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      onFocus={(event) => event.target.select()}
                      className="h-12 w-10 rounded-xl border border-gray-300 bg-white/90 text-center text-base font-semibold text-gray-800 shadow-sm transition-all duration-200 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200 dark:text-black sm:h-14 sm:w-12"
                      aria-label={`Verification digit ${index + 1}`}
                    />
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div />
                  <button
                    type="button"
                    onClick={handleCancelTwoFactor}
                    className="text-green-600 hover:text-green-700 font-semibold text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-6 rounded-md text-white font-semibold font-tahoma transition-all duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-800 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Signing in...</span>
              </div>
            ) : (
              requiresTwoFactor ? "Verify" : "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
