import React from "react";
import { HashLoader } from "react-spinners";

const LoaderOverlay = ({ visible, message = "Loading..." }) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 flex flex-col items-center gap-3">
        <HashLoader color="#10B981" size={48} />
        <div className="text-sm text-slate-700 dark:text-slate-200">{message}</div>
      </div>
    </div>
  );
};

export default LoaderOverlay;
