import { createContext, useContext, useState, useEffect, useRef } from "react";
import api, { endpoints } from "../config/api.js";
import { PERMISSIONS } from "../utils/permissions.js";
import SweetAlert from "../components/SweetAlert.jsx";
import LoaderOverlay from "../components/LoaderOverlay.jsx";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authStatus, setAuthStatus] = useState("checking"); // 'checking' | 'authorized' | 'unauthorized'
  const [user, setUser] = useState(null);
  const verifyingRef = useRef(false);
  const [sessionTimeoutConfig, setSessionTimeoutConfig] = useState(() => {
    try {
      const raw = localStorage.getItem("sessionTimeoutConfig");
      return raw ? JSON.parse(raw) : { enabled: true, minutes: 30 };
    } catch {
      return { enabled: true, minutes: 30 };
    }
  });

  const timeoutRef = useRef(null);
  const activityListenerRef = useRef(null);
  const [showLoader, setShowLoader] = useState(false);

  const loadSessionTimeoutConfig = async () => {
    try {
      const [minutesResponse, enabledResponse] = await Promise.all([
        api.get(endpoints.systemSettings.get("session_timeout_minutes")),
        api.get(endpoints.systemSettings.get("session_timeout_enabled")),
      ]);

      const minutesValue = Number(minutesResponse?.data?.setting?.value);
      const enabledValue = enabledResponse?.data?.setting?.value;

      const nextConfig = {
        minutes: Number.isFinite(minutesValue) && minutesValue > 0 ? minutesValue : 30,
        enabled:
          String(enabledValue ?? "true").toLowerCase() !== "false" &&
          String(enabledValue ?? "true").toLowerCase() !== "0" &&
          String(enabledValue ?? "true").toLowerCase() !== "off",
      };

      setSessionTimeoutConfig(nextConfig);
      try {
        localStorage.setItem("sessionTimeoutConfig", JSON.stringify(nextConfig));
      } catch {
        // ignore storage write failure
      }
    } catch (err) {
      console.error("Failed to load session timeout config", err);
    }
  };

  const verifyAuth = async () => {
    // prevent concurrent duplicate verify calls (caused by StrictMode/HMR remounts)
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    // Use any cached user data to avoid a flash of "unauthorized" while we
    // confirm with the server, but the cookie (checked via /verify) is the
    // real source of truth — never skip the network check based on cache
    // alone, since sessionStorage doesn't persist across tabs/restarts even
    // when a valid httpOnly cookie still exists.
    const cached = sessionStorage.getItem("user");
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch {
        sessionStorage.removeItem("user");
      }
    }

    try {
      const response = await api.get(endpoints.auth.verify);
      if (response.status === 200 && response.data.user) {
        sessionStorage.setItem("user", JSON.stringify(response.data.user));
        setUser(response.data.user);
        setAuthStatus("authorized");
      } else {
        sessionStorage.removeItem("user");
        setUser(null);
        setAuthStatus("unauthorized");
      }
    } catch (err) {
      sessionStorage.removeItem("user");
      setUser(null);
      setAuthStatus("unauthorized");
    }
    finally {
      verifyingRef.current = false;
    }
  };
  useEffect(() => {
    const cachedUser = sessionStorage.getItem("user");
    if (cachedUser) {
      verifyAuth();
    } else {
      setAuthStatus("unauthorized");
    }
  }, []);

  const permissions = user?.permissions ?? [];
  const hasPermission = (name) => permissions.includes(name);

  useEffect(() => {
    if (authStatus === "authorized" && hasPermission(PERMISSIONS.SYSTEM_SETTINGS_MANAGE)) {
      loadSessionTimeoutConfig();
    }
  }, [authStatus, user]);

  const login = (userData) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setAuthStatus("authorized");
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    setAuthStatus("unauthorized");
  };

  const updateUser = (userData) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // Persist session timeout config and notify other tabs
  const updateSessionTimeoutConfig = (cfg) => {
    const next = { ...sessionTimeoutConfig, ...cfg };
    try {
      localStorage.setItem("sessionTimeoutConfig", JSON.stringify(next));
    } catch {}
    setSessionTimeoutConfig(next);
  };

  // Auto-logout on inactivity
  useEffect(() => {
    // clear previous timer and listeners
    const clear = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (activityListenerRef.current) {
        const { reset } = activityListenerRef.current;
        ["mousemove", "keydown", "mousedown", "touchstart", "scroll"].forEach((ev) =>
          window.removeEventListener(ev, reset, true)
        );
        activityListenerRef.current = null;
      }
    };

    if (authStatus === "authorized" && sessionTimeoutConfig?.enabled) {
      const minutes = Number(sessionTimeoutConfig.minutes) || 30;
      const timeoutMs = minutes * 60 * 1000;

      const reset = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          // show a loader overlay for 5 seconds before logging out
          setShowLoader(true);
          setTimeout(() => {
            setShowLoader(false);
            logout();
          }, 5000);
        }, timeoutMs);
      };

      activityListenerRef.current = { reset };
      ["mousemove", "keydown", "mousedown", "touchstart", "scroll"].forEach((ev) =>
        window.addEventListener(ev, reset, true)
      );

      // start initial timer
      reset();

      // cleanup on unmount or config change
      return () => clear();
    }

    // if not authorized or disabled, ensure cleared
    clear();
    return undefined;
  }, [authStatus, sessionTimeoutConfig?.enabled, sessionTimeoutConfig?.minutes]);

  // react to localStorage changes (other tabs)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "sessionTimeoutConfig") {
        try {
          const parsed = JSON.parse(e.newValue);
          setSessionTimeoutConfig(parsed);
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authStatus,
        user,
        permissions,
        hasPermission,
        login,
        logout,
        verifyAuth,
        updateUser,
        sessionTimeoutConfig,
        updateSessionTimeoutConfig,
      }}
    >
      {children}
      <LoaderOverlay visible={showLoader} message={"Logging out due to inactivity..."} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);