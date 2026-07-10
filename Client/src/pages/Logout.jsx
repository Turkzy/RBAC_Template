import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api, { endpoints } from "../config/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const hasRun = useRef(false); // prevent double-fire from effect re-run in StrictMode

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const performLogout = async () => {
      try {
        // Clear the httpOnly auth cookie server-side
        await api.post(endpoints.auth.logout);
      } catch (error) {
        console.error("Logout error:", error);
        // Continue with client-side cleanup even if the API call fails
      }

      // Clear all client-side auth state
      sessionStorage.removeItem("user");
      localStorage.removeItem("lastLoginTime");
      localStorage.removeItem("rememberedEmail");

      // Sync AuthContext so ProtectedRoute reacts immediately
      logout();

      // Redirect to login
      navigate("/", { replace: true });
    };

    performLogout();
  }, [navigate, logout]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent"></div>
        <p className="text-gray-500 text-sm">Signing out...</p>
      </div>
    </div>
  );
};

export default Logout;