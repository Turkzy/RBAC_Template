import React from "react";
import dashboard from "../assets/dashboard.png";

const CompliancePage = () => {
  return (
    <div>
      <div
        className="relative overflow-hidden rounded-xl border bg-cover bg-center bg-no-repeat p-5 shadow-sm min-h-[400px] sm:min-h-[220px]"
        style={{ backgroundImage: `url(${dashboard})` }}
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-emerald-800/60 rounded-xl" />
          <div className="relative z-10 flex items-center justify-center h-full">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white text-center tracking-tight">
              Compliance Tracker
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompliancePage;
