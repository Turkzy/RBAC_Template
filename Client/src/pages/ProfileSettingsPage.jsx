import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import ViewProfilePage from "../components/ViewProfilePage.jsx";

const ProfileSettingsPage = () => {
  const { user, updateUser } = useAuth();

  return (
    <div className="rounded-lg select-none">
      <div className="mb-6">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.35em] text-emerald-500">
          My Profile
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-700 dark:text-white mt-1">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
          View your profile details and update your account information.
        </p>
      </div>

      <ViewProfilePage
        user={user}
        editable={true}
        onBack={() => window.history.back()}
        onCurrentUserUpdate={updateUser}
      />
    </div>
  );
};

export default ProfileSettingsPage;
