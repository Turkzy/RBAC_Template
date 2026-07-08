import React from "react";
import dashboard from "../assets/dashboard.png";

const CompliancePage = () => {
  return (
    <div className="relative">
      <div
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${dashboard})`, minHeight: '360px' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900 via-emerald-800 to-orange-800 opacity-95" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-montserrat font-bold text-white tracking-tight">
            Compliance Tracker
          </h1>
          <p className="mt-4 text-lg text-slate-200 max-w-3xl mx-auto">
            Track the status of the National Development Company requirements and compliance .
          </p>
        </div>
      </div>

      {/* Overlapping card */}
      <div className="-mt-12 relative z-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1">GOCC</label>
                <select className="w-full rounded-md border px-3 py-2">
                  <option>Al-Amanah Islamic Investment Bank of the Philippines</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1">Sector</label>
                <select className="w-full rounded-md border px-3 py-2">
                  <option>Government Financial Institutions Sector</option>
                </select>
              </div>

              <div className="w-full md:w-80">
                <label className="block text-xs text-slate-500 mb-1">Search</label>
                <div className="relative">
                  <input placeholder="Search GOCC" className="w-full rounded-md border px-3 py-2 pr-10" />
                  <div className="absolute inset-y-0 right-2 flex items-center text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-sky-500" />
                  <span>Under Evaluation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-gray-300" />
                  <span>No Submission</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-amber-400" />
                  <span>Non-Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-slate-500" />
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
