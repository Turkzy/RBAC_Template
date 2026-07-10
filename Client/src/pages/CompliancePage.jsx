import React from "react";
import dashboard from "../assets/dashboard.png";

const CompliancePage = () => {
  return (
    <div className="relative">
      <div
        className="relative overflow-hidden bg-cover bg-bottom bg-no-repeat rounded-md"
        style={{ backgroundImage: `url(${dashboard})`, minHeight: "200px" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-sky-900 via-emerald-800 to-orange-800 opacity-40" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-montserrat font-bold text-white tracking-tight">
            Compliance Status
          </h1>
          <p className="mt-4 text-lg text-slate-200 max-w-3xl mx-auto">
            Track the status of the National Development Company requirements
            and compliance .
          </p>
        </div>
      </div>

      {/* Overlapping card */}
      <div className="-mt-12 relative z-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Compliance Overview
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  This section provides a summary of the compliance status of
                  the National Development Company requirements. 
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white dark:bg-emerald-600">
                    C
                  </span>
                  <span>Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold text-white dark:bg-sky-600">
                    UE
                  </span>
                  <span>Under Evaluation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-slate-700 dark:bg-slate-600 dark:text-slate-200">
                    NS
                  </span>
                  <span>No Submission</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-semibold text-white dark:bg-amber-500">
                    NC
                  </span>
                  <span>Non-Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-500 text-xs font-semibold text-white dark:bg-slate-600">
                    NA
                  </span>
                  <span>Not Applicable</span>
                </div>
              </div>
            </div>
          </div>
        </div>  
      </div>
    </div>
  );
};

export default CompliancePage;
