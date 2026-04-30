import React from "react";
import { connectToDatabase } from "@/lib/mongodb";
import Meeting from "@/models/Meeting";
import Link from "next/link";

export default async function InterviewResultPage({ params }) {
  const { id } = await params;
  
  await connectToDatabase();
  const meeting = await Meeting.findById(id);

  if (!meeting) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col">
        <h1 className="text-2xl font-bold text-[#2c2c2c] dark:text-white mb-2">Interview Not Found</h1>
        <Link href="/dashboard" className="text-[#d94a4a] hover:underline">Go back to dashboard</Link>
      </div>
    );
  }

  const data = meeting.toObject();

  return (
    <main className="flex-1 overflow-y-auto bg-[#f7f3ef] dark:bg-neutral-950 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard" className="text-[#666] dark:text-neutral-400 hover:text-[#d94a4a] transition-colors flex items-center gap-2">
            ← Back to Dashboard
          </Link>
          <span className="px-3 py-1 bg-[#d94a4a]/10 text-[#d94a4a] text-xs font-semibold rounded-full uppercase tracking-wide">
            AI Interview Analysis
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-10 shadow-sm border border-[#efe5db] dark:border-neutral-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d94a4a]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-bold text-[#2c2c2c] dark:text-white leading-tight mb-4">
              {data.title || "Interview Results"}
            </h1>
            <p className="text-[#666] dark:text-neutral-400 text-lg leading-relaxed max-w-3xl">
              {data.overview}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-sm border border-[#efe5db] dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#e6f4ea] dark:bg-green-900/30 flex items-center justify-center text-xl">💪</div>
              <h2 className="text-xl font-bold text-[#2c2c2c] dark:text-white">Strengths</h2>
            </div>
            <ul className="space-y-4">
              {data.strengths?.length > 0 ? data.strengths.map((str, i) => (
                <li key={i} className="flex gap-3 text-[#555] dark:text-neutral-300">
                  <span className="text-[#1e8e3e] mt-0.5">✓</span>
                  <span>{str}</span>
                </li>
              )) : (
                <li className="text-[#999]">No specific strengths identified.</li>
              )}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-sm border border-[#efe5db] dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#fef2f2] dark:bg-red-900/30 flex items-center justify-center text-xl">📉</div>
              <h2 className="text-xl font-bold text-[#2c2c2c] dark:text-white">Areas for Improvement</h2>
            </div>
            <ul className="space-y-4">
              {data.weaknesses?.length > 0 ? data.weaknesses.map((weak, i) => (
                <li key={i} className="flex gap-3 text-[#555] dark:text-neutral-300">
                  <span className="text-[#d94a4a] mt-0.5">✗</span>
                  <span>{weak}</span>
                </li>
              )) : (
                <li className="text-[#999]">No major weaknesses identified.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sentiment */}
          <div className="md:col-span-1 bg-gradient-to-br from-[#faf6f0] to-white dark:from-neutral-900 dark:to-neutral-950 rounded-3xl p-8 shadow-sm border border-[#efe5db] dark:border-neutral-800 text-center flex flex-col items-center justify-center">
            <h3 className="font-semibold text-[#666] dark:text-neutral-400 mb-2">Overall Sentiment</h3>
            <div className="text-6xl mb-4">
              {data.sentiment?.score >= 75 ? '😎' : data.sentiment?.score >= 40 ? '🤔' : '😰'}
            </div>
            <div className="text-3xl font-bold text-[#2c2c2c] dark:text-white mb-1">
              {data.sentiment?.score || 0}/100
            </div>
            <div className="capitalize font-medium text-[#d94a4a] bg-[#d94a4a]/10 px-3 py-1 rounded-full text-sm mt-2">
              {data.sentiment?.overall || "Neutral"}
            </div>
          </div>

          {/* Keywords */}
          <div className="md:col-span-2 bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-sm border border-[#efe5db] dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#fff4e5] dark:bg-orange-900/30 flex items-center justify-center text-xl">🔑</div>
              <h2 className="text-xl font-bold text-[#2c2c2c] dark:text-white">Key Topics & Keywords</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {data.keyDecisions?.map((kw, i) => (
                <div key={i} className="px-4 py-2 bg-[#f7f3ef] dark:bg-neutral-800 border border-[#e0d6cc] dark:border-neutral-700 rounded-xl text-sm font-medium text-[#555] dark:text-neutral-300">
                  {kw}
                </div>
              ))}
            </div>
            {data.sentiment?.highlights?.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[#efe5db] dark:border-neutral-800">
                <h3 className="font-semibold text-[#2c2c2c] dark:text-white mb-4">Emotional Highlights</h3>
                <ul className="space-y-2">
                  {data.sentiment.highlights.map((hl, i) => (
                    <li key={i} className="text-sm text-[#666] dark:text-neutral-400 italic">"{hl}"</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
