"use client";

import React, { useState } from "react";
import Link from "next/link";
import ResultsDashboard from "./ResultsDashboard";

const NavigationHeader = ({ meetingTitle, meetingDate }) => {
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleExport = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-[#efe5db] dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard/history" 
              className="group inline-flex items-center gap-2 text-sm text-[#666] dark:text-neutral-400 hover:text-[#d94a4a] transition-all duration-200"
            >
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back to History</span>
              <span className="sm:hidden">Back</span>
            </Link>
            
            {meetingTitle && (
              <>
                <div className="w-px h-4 bg-[#e0d6cc] dark:bg-neutral-700 hidden sm:block"></div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs text-[#999] dark:text-neutral-500">Viewing:</span>
                  <span className="text-sm font-medium text-[#2c2c2c] dark:text-white line-clamp-1 max-w-md">
                    {meetingTitle}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-neutral-900 border border-[#e0d6cc] dark:border-neutral-700 rounded-xl text-sm font-medium text-[#666] dark:text-neutral-400 hover:text-[#d94a4a] hover:border-[#d94a4a] transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="hidden sm:inline">Share</span>
              </button>
              
              {isShareMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-[#efe5db] dark:border-neutral-800 overflow-hidden z-50">
                  <button
                    onClick={handleCopyLink}
                    className="w-full px-4 py-2 text-left text-sm text-[#666] dark:text-neutral-400 hover:bg-[#f7f3ef] dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    {copySuccess ? "Copied! ✓" : "Copy Link"}
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={handleExport}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#d94a4a] text-white rounded-xl text-sm font-medium hover:bg-[#c13e3e] transition-all flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </div>
      {copySuccess && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
            Link copied to clipboard!
          </div>
        </div>
      )}
    </div>
  );
};

const MeetingInfoBar = ({ meeting }) => (
  <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-[#efe5db] dark:border-neutral-800 p-4 mb-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#5a9e4e]"></div>
          <span className="text-xs text-[#666] dark:text-neutral-400">
            {new Date(meeting.createdAt).toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
        <div className="w-px h-3 bg-[#e0d6cc] dark:bg-neutral-700 hidden sm:block"></div>
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-[#666] dark:text-neutral-400">
            {meeting.duration || "~45 minutes"}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#999] dark:text-neutral-500">Analysis ID:</span>
        <code className="text-xs bg-[#f7f3ef] dark:bg-neutral-800 px-2 py-0.5 rounded text-[#666] dark:text-neutral-400">
          {meeting._id.toString().slice(-8)}
        </code>
      </div>
    </div>
  </div>
);

export default function MeetingView({ meeting, dashboardData }) {
  return (
    <div className="w-full min-h-screen bg-[#f7f3ef] dark:bg-neutral-950">
      <NavigationHeader meetingTitle={dashboardData.title} meetingDate={dashboardData.meetingDate} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <MeetingInfoBar meeting={meeting} />
        <ResultsDashboard data={dashboardData} />
        
        <div className="mt-8 pt-6 border-t border-[#efe5db] dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#999] dark:text-neutral-500">
            <div className="flex items-center gap-4">
              <span>🤖 AI-generated analysis</span>
              <span>•</span>
              <span>Last updated {new Date(meeting.updatedAt || meeting.createdAt).toLocaleDateString()}</span>
            </div>
            <Link href="/dashboard" className="hover:text-[#d94a4a] transition-colors">
              Analyze another meeting →
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .sticky {
            display: none !important;
          }
          body {
            background: white !important;
          }
          button {
            display: none !important;
          }
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
