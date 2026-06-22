import React, { useState, useEffect } from "react";
import backgroundlogin from "../assets/login.png";
import logo from "../assets/ndc_logo.png";
import { EyeOff, Eye } from "lucide-react";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  return (
    <div
      className="h-screen w-screen bg-cover bg-center flex items-center justify-start select-none px-4 animate-fade-in sm:px-8 md:px-12 lg:px-16 xl:px-24"
      style={{ backgroundImage: `url(${backgroundlogin})` }}
    >
      <div className="flex flex-col items-center space-y-6 w-full max-w-md sm:max-w-lg lg:ml-40 md:ml-16 ml-0">
        <img src={logo} className="h-24 sm:h-20 md:h-32 w-auto" />
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-700 leading-tight whitespace-nowrap font-tahoma">
          Compliance Monitoring System
        </h1>

        <form className="w-full space-y-5">
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
              placeholder="Enter your email"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white/90 placeholder-gray-400 focus:border-green-100 focus:outline-none focus:ring-1 focus:ring-green-700"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm bg-white/90 placeholder-gray-400 focus:border-green-100 focus:outline-none focus:ring-1 focus:ring-green-700"
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
          </div>

          <button
          type="submit"
          className={`w-full py-3 px-6 rounded-md text-white font-semibold font-tahoma transition-all duration-30 ${
            loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-800 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          }`}
          disabled={loading}
          > {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Signing in...</span>
            </div>
          ) : (
            "Sign in"
          )}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;
