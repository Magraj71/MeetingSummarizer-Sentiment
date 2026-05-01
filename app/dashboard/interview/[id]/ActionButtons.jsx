"use client";

import React from "react";

export const ActionButtons = ({ meetingId }) => {
  const handleExport = () => {
    window.print(); // Simple export/print for now
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-white dark:bg-neutral-900 border border-[#e0d6cc] dark:border-neutral-700 rounded-xl text-sm font-medium text-[#666] dark:text-neutral-400 hover:text-[#d94a4a] hover:border-[#d94a4a] transition-all flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export PDF
      </button>
      <button
        onClick={handleShare}
        className="px-4 py-2 bg-white dark:bg-neutral-900 border border-[#e0d6cc] dark:border-neutral-700 rounded-xl text-sm font-medium text-[#666] dark:text-neutral-400 hover:text-[#d94a4a] hover:border-[#d94a4a] transition-all flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
        Share Link
      </button>
    </div>
  );
};
