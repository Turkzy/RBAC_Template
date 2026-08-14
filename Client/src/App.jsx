import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Logout from "./pages/Logout.jsx";

import DashboardPage from "./pages/DashboardPage.jsx";
import ComplianceManage from "./pages/ComplianceManage.jsx";
import ComplianceStatus from "./pages/ComplianceStatus.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import DocumentManagementPage from "./pages/DocumentManagementPage.jsx";
import NotificationPage from "./pages/NotificationPage.jsx";
import ActivityLogsPage from "./pages/ActivityLogsPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import AccessSettingPage from "./pages/AccessSettingPage.jsx";
import ProfileSettingsPage from "./pages/ProfileSettingsPage.jsx";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SettingsPage from "./pages/SystemSettingsPage.jsx";
import NotificationRules from "./pages/NotificationRules.jsx";
import OrganizationPage from "./pages/Organization.jsx";
import SubmittedDocuments from "./pages/SubmittedDocuments.jsx";

import { PERMISSIONS } from "./utils/permissions.js";
import RecordsPage from "./pages/RecordsPage.jsx";

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
  </div>
);

const ProtectedRoute = ({ element }) => {
  const { authStatus } = useAuth();
  if (authStatus === "checking") return <Spinner />;
  if (authStatus === "unauthorized") return <Navigate to="/login" replace />;
  return element;
};

const PublicOnlyRoute = ({ element }) => {
  const { authStatus } = useAuth();
  if (authStatus === "checking") return <Spinner />;
  if (authStatus === "authorized") return <Navigate to="/" replace />;
  return element;
};

const PermissionRoute = ({ element, permission, permissions }) => {
  const { authStatus, hasPermission, user } = useAuth();
  if (authStatus === "checking") return <Spinner />;
  if (authStatus === "unauthorized") return <Navigate to="/login" replace />;

  const roleName = (user?.role || "").toString().trim().toLowerCase();
  const isSuperAdmin = roleName === "super admin" || roleName.includes("super");

  const requiredPermissions = Array.isArray(permissions)
    ? permissions
    : permission
      ? [permission]
      : [];

  const hasAccess = requiredPermissions.some((perm) => hasPermission(perm));
  if (!hasAccess && !isSuperAdmin) return <Navigate to="/" replace />;
  return element;
};

const PermissionRouteMultiple = ({ element, permissions }) => {
  const { authStatus, hasPermission, user } = useAuth();
  if (authStatus === "checking") return <Spinner />;
  if (authStatus === "unauthorized") return <Navigate to="/login" replace />;

  const roleName = (user?.role || "").toString().trim().toLowerCase();
  const isSuperAdmin = roleName === "super admin" || roleName.includes("super");

  const hasAnyPermission = (permissions || []).some((perm) => hasPermission(perm));
  if (!hasAnyPermission && !isSuperAdmin) return <Navigate to="/" replace />;
  return element;
};

const AppContent = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicOnlyRoute element={<Login />} />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected layout — all app pages live here */}
      <Route path="/" element={<ProtectedRoute element={<Dashboard />} />}>
        <Route index element={<DashboardPage />} />       
        <Route
          path="compliance/manage"
          element={
            <PermissionRoute
              permission={PERMISSIONS.COMPLIANCE_MANAGE}
              element={<ComplianceManage />}
            />
          }
        />
        <Route path="compliance/status" element={<ComplianceStatus />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route
          path="documentmanagement"
          element={
            <PermissionRoute
              permission={PERMISSIONS.DOCUMENTS_MANAGE}
              element={<DocumentManagementPage />}
            />
          }
        />
        <Route
          path="submitted-documents"
          element={
            <PermissionRoute
              permission={PERMISSIONS.SUBMIT_DOCUMENTS}
              element={<SubmittedDocuments />}
            />
          }
        />
        <Route path="notification" element={<NotificationPage />} />
        <Route
          path="audit/activity-logs"
          element={
            <PermissionRoute
              permission={PERMISSIONS.AUDIT_LOGS_VIEW}
              element={<ActivityLogsPage />}
            />
          }
        />
        <Route 
        path="audit/records"
        element={
          <PermissionRoute
          permission={PERMISSIONS.RECORDS}
          element={<RecordsPage />}
          />
        }
        />
        <Route
          path="admin/access-settings"
          element={
            <PermissionRouteMultiple
              permissions={[PERMISSIONS.ROLES_MANAGE, PERMISSIONS.PERMISSIONS_MANAGE]}
              element={<AccessSettingPage />}
            />
          }
        />
        <Route
          path="admin/account"
          element={
            <PermissionRoute
              permission={PERMISSIONS.ACCOUNTS_MANAGE}
              element={<AccountPage />}
            />
          }
        />
        <Route
          path="system-settings"
          element={
            <PermissionRoute
              permission={PERMISSIONS.SYSTEM_SETTINGS_MANAGE}
              element={<SettingsPage />}
            />
          }
        />
        <Route
          path="admin/notification-rules"
          element={
            <PermissionRoute
              permission={PERMISSIONS.NOTIFICATIONS_RULES_MANAGE}
              element={<NotificationRules />}
            />
          }
        />
        <Route
          path="admin/organization"
          element={
            <PermissionRoute
              permission={PERMISSIONS.ORGANIZATION_MANAGE}
              element={<OrganizationPage />}
            />
          }
        />
        <Route path="profile-settings" element={<ProfileSettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  // Use /NDC_CMS/ for production, / for local development
  const basename = window.location.hostname === "localhost" ? "/" : "/NDC_CMS/";

  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
