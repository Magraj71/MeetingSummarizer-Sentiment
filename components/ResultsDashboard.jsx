"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ResultsDashboard({ data }) {
  const [expandedItem, setExpandedItem] = useState(null);
  const [showSentimentDetail, setShowSentimentDetail] = useState(false);

  if (!data) return null;

  // Default data structure if not provided
  const dashboardData = {
    title: data.title || "Product Strategy Sync",
    overview: data.overview || "Team discussed Q2 priorities, feature roadmap adjustments, and resource allocation for the upcoming sprint. Overall productive conversation with some tension around timelines.",
    takeaways: data.takeaways || [
      "Launch timeline moved to mid-June",
      "Need 2 more designers for the mobile team",
      "Customer feedback on AI features is overwhelmingly positive",
      "Budget approved for the analytics overhaul"
    ],
    actionItems: data.actionItems || [
      { task: "Update project roadmap document", assignee: "Sarah", priority: "high" },
      { task: "Schedule design review for new components", assignee: "Marcus", priority: "medium" },
      { task: "Share budget breakdown with finance", assignee: "Jessica", priority: "high" },
      { task: "Set up user testing sessions", assignee: "Alex", priority: "low" }
    ],
    sentiment: data.sentiment || {
      overall: "mostly positive",
      score: 72,
      highlights: [
        "Excited about the new AI features → 😊",
        "Concerns about timeline feasibility → 😟",
        "Team alignment on customer priorities → 👍",
        "Frustration with design resources → 😤"
      ]
    },
    keyDecisions: data.keyDecisions || [
      "Prioritize mobile app over web enhancements",
      "Hire two senior frontend engineers",
      "Postpone the legacy system migration to Q3"
    ]
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "high": return "bg-[#d94a4a]/10 text-[#d94a4a] border-[#d94a4a]/20";
      case "medium": return "bg-[#e6a017]/10 text-[#e6a017] border-[#e6a017]/20";
      case "low": return "bg-[#5a9e4e]/10 text-[#5a9e4e] border-[#5a9e4e]/20";
      default: return "bg-[#888]/10 text-[#888] border-[#888]/20";
    }
  };

  const getSentimentEmoji = (score) => {
    if (score >= 70) return "😊";
    if (score >= 40) return "😐";
    return "😟";
  };

  return (
    <div className="min-h-screen bg-[#f7f3ef]">
      
      {/* Simple header */}
      <div className="border-b border-[#e5dcd3] bg-white/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-[#d94a4a] to-[#b83a3a] rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <span className="font-bold text-xl text-[#2c2c2c]">Meetlytics</span>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <a href="/dashboard" className="text-[#d94a4a] font-medium">Dashboard</a>
            <a href="/meetings" className="text-[#5a5a5a] hover:text-[#d94a4a]">Meetings</a>
            <a href="/settings" className="text-[#5a5a5a] hover:text-[#d94a4a] hidden sm:block">Settings</a>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        
        {/* Meeting title area */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-sm text-[#999]">Meeting summary • April 15, 2025</span>
            <span className="px-2 py-0.5 bg-[#d94a4a]/10 text-[#d94a4a] text-xs rounded-full">AI generated</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2c2c2c] leading-tight">
            {dashboardData.title}
          </h1>
          <p className="text-[#686868] text-base mt-3 leading-relaxed max-w-3xl">
            {dashboardData.overview}
          </p>
        </div>

        {/* Three column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left column - Key Takeaways */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#efe5db] sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">💡</span>
                <h2 className="font-semibold text-lg text-[#2c2c2c]">Key Takeaways</h2>
              </div>
              <ul className="space-y-3">
                {dashboardData.takeaways.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm text-[#555] leading-relaxed">
                    <span className="text-[#d94a4a] mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Middle + Right columns combined for flexibility */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Sentiment Analysis Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#efe5db]">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <h2 className="font-semibold text-lg text-[#2c2c2c]">Meeting Sentiment</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{getSentimentEmoji(dashboardData.sentiment.score)}</span>
                  <div className="px-3 py-1 bg-[#d94a4a]/10 rounded-full">
                    <span className="text-sm font-medium text-[#d94a4a]">{dashboardData.sentiment.overall}</span>
                  </div>
                </div>
              </div>
              
              {/* Sentiment meter */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-[#999] mb-1">
                  <span>😟 Negative</span>
                  <span>😐 Neutral</span>
                  <span>😊 Positive</span>
                </div>
                <div className="h-2 bg-[#e8e0d5] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#d94a4a] via-[#e6a017] to-[#5a9e4e] rounded-full transition-all duration-500"
                    style={{ width: `${dashboardData.sentiment.score}%` }}
                  />
                </div>
                <div className="text-right text-xs text-[#999] mt-1">
                  Score: {dashboardData.sentiment.score}/100
                </div>
              </div>

              <button 
                onClick={() => setShowSentimentDetail(!showSentimentDetail)}
                className="text-sm text-[#d94a4a] hover:underline mb-3 flex items-center gap-1"
              >
                {showSentimentDetail ? "↓ Hide details" : "→ Show sentiment breakdown"}
              </button>

              <AnimatePresence>
                {showSentimentDetail && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 pt-3 border-t border-[#efe5db]"
                  >
                    {dashboardData.sentiment.highlights.map((highlight, i) => (
                      <div key={i} className="text-sm text-[#666] py-1">
                        {highlight}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Items */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#efe5db]">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">✅</span>
                <h2 className="font-semibold text-lg text-[#2c2c2c]">Action Items</h2>
                <span className="ml-auto text-xs text-[#999]">{dashboardData.actionItems.length} tasks</span>
              </div>
              <div className="space-y-3">
                {dashboardData.actionItems.map((item, i) => (
                  <div 
                    key={i} 
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#faf6f0] transition-colors group cursor-pointer"
                    onClick={() => setExpandedItem(expandedItem === i ? null : i)}
                  >
                    <div className="w-5 h-5 rounded border-2 border-[#ddd] mt-0.5 flex-shrink-0 group-hover:border-[#d94a4a]/50 transition-colors" />
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-sm font-medium text-[#2c2c2c]">{item.task}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#999]">
                        <span>👤 {item.assignee}</span>
                      </div>
                    </div>
                    <button className="text-[#bbb] group-hover:text-[#d94a4a] transition-colors">
                      → 
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Decisions */}
            {dashboardData.keyDecisions && dashboardData.keyDecisions.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#efe5db]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📝</span>
                  <h2 className="font-semibold text-lg text-[#2c2c2c]">Key Decisions Made</h2>
                </div>
                <ul className="space-y-2">
                  {dashboardData.keyDecisions.map((decision, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#555]">
                      <span className="text-[#5a9e4e]">✓</span>
                      <span>{decision}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Note from AI */}
            <div className="bg-[#fef8f0] rounded-2xl p-5 border border-[#f0e4d0]">
              <div className="flex gap-3">
                <span className="text-xl">🤖</span>
                <div>
                  <p className="text-sm text-[#777] italic">
                    "The team seemed most energized about the AI features. Consider scheduling a follow-up specifically to address timeline concerns raised by engineering."
                  </p>
                  <p className="text-xs text-[#999] mt-2">— AI Meeting Assistant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#e8e0d5] mt-12 py-6 text-center text-xs text-[#999]">
        <div className="max-w-6xl mx-auto px-6">
          <span>AI-generated summary • Review accuracy before sharing</span>
        </div>
      </footer>
    </div>
  );
}