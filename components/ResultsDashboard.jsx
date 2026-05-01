"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Custom components
const SentimentMeter = ({ score, overall }) => {
  const getSentimentEmoji = (score) => {
    if (score >= 70) return "😊";
    if (score >= 40) return "😐";
    return "😟";
  };

  return (
    <div className="mb-5">
      <div className="flex justify-between text-xs text-[#999] mb-1">
        <span>😟 Negative</span>
        <span>😐 Neutral</span>
        <span>😊 Positive</span>
      </div>
      <div className="h-2 bg-[#e8e0d5] rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-[#d94a4a] via-[#e6a017] to-[#5a9e4e] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getSentimentEmoji(score)}</span>
          <span className="text-sm font-medium text-[#d94a4a]">Score: {score}/100</span>
        </div>
        <span className="text-xs text-[#666] dark:text-neutral-400 capitalize">{overall}</span>
      </div>
    </div>
  );
};

const ActionItem = ({ item, index, isExpanded, onToggle }) => {
  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case "high": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      case "medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "low": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#faf6f0] dark:hover:bg-neutral-800/50 transition-all duration-200 group cursor-pointer"
      onClick={() => onToggle(index)}
    >
      <div className="w-5 h-5 rounded-full border-2 border-[#ddd] dark:border-neutral-600 mt-0.5 flex-shrink-0 group-hover:border-[#d94a4a] transition-colors flex items-center justify-center">
        {isExpanded && <div className="w-2 h-2 rounded-full bg-[#d94a4a]" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-sm font-medium text-[#2c2c2c] dark:text-white">{item.task}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(item.priority)}`}>
            {item.priority || "medium"}
          </span>
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-1"
            >
              <div className="flex items-center gap-2 text-xs text-[#666] dark:text-neutral-400">
                <span>👤 Assignee: {item.assignee || "Unassigned"}</span>
                {item.dueDate && <span>📅 Due: {item.dueDate}</span>}
              </div>
              {item.notes && (
                <p className="text-xs text-[#888] dark:text-neutral-500 mt-1">{item.notes}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <button className="text-[#bbb] dark:text-neutral-600 group-hover:text-[#d94a4a] dark:group-hover:text-[#d94a4a] transition-colors">
        {isExpanded ? "−" : "→"}
      </button>
    </motion.div>
  );
};

const ChatMessage = ({ message, isUser }) => (
  <motion.div 
    initial={{ opacity: 0, x: isUser ? 20 : -20 }}
    animate={{ opacity: 1, x: 0 }}
    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
  >
    <div className={`text-sm p-3 rounded-2xl max-w-[85%] ${
      isUser 
        ? "bg-[#d94a4a] text-white rounded-tr-sm" 
        : "bg-white dark:bg-neutral-800 border border-[#efe5db] dark:border-neutral-700 text-[#2c2c2c] dark:text-white rounded-tl-sm shadow-sm"
    }`}>
      {message}
    </div>
    <span className="text-xs text-[#999] dark:text-neutral-500 mt-1">
      {isUser ? "You" : "AI Assistant"}
    </span>
  </motion.div>
);

const InfoCard = ({ icon, title, children, className = "" }) => (
  <div className={`bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-[#efe5db] dark:border-neutral-800 hover:shadow-md transition-shadow duration-300 ${className}`}>
    <div className="flex items-center gap-2 mb-4">
      <span className="text-2xl">{icon}</span>
      <h2 className="font-semibold text-lg text-[#2c2c2c] dark:text-white">{title}</h2>
    </div>
    {children}
  </div>
);

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-[#f7f3ef] dark:bg-neutral-950">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
      <div className="animate-pulse space-y-6">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-32"></div>
          <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-5/6"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-neutral-800 rounded-2xl"></div>
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-gray-200 dark:bg-neutral-800 rounded-2xl"></div>
            <div className="h-64 bg-gray-200 dark:bg-neutral-800 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function ResultsDashboard({ data }) {
  const [expandedItem, setExpandedItem] = useState(null);
  const [showSentimentDetail, setShowSentimentDetail] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Memoize dashboard data
  const dashboardData = useMemo(() => ({
    title: data?.title || "Product Strategy Sync",
    overview: data?.overview || "Team discussed Q2 priorities, feature roadmap adjustments, and resource allocation for the upcoming sprint. Overall productive conversation with some tension around timelines.",
    takeaways: data?.takeaways || [
      "Launch timeline moved to mid-June",
      "Need 2 more designers for the mobile team",
      "Customer feedback on AI features is overwhelmingly positive",
      "Budget approved for the analytics overhaul"
    ],
    actionItems: data?.actionItems || [
      { task: "Update project roadmap document", assignee: "Sarah", priority: "high" },
      { task: "Schedule design review for new components", assignee: "Marcus", priority: "medium" },
      { task: "Share budget breakdown with finance", assignee: "Jessica", priority: "high" },
      { task: "Set up user testing sessions", assignee: "Alex", priority: "low" }
    ],
    sentiment: data?.sentiment || {
      overall: "mostly positive",
      score: 72,
      highlights: [
        "Excited about the new AI features → 😊",
        "Concerns about timeline feasibility → 😟",
        "Team alignment on customer priorities → 👍",
        "Frustration with design resources → 😤"
      ]
    },
    keyDecisions: data?.keyDecisions || [
      "Prioritize mobile app over web enhancements",
      "Hire two senior frontend engineers",
      "Postpone the legacy system migration to Q3"
    ],
    meetingDate: data?.meetingDate || new Date().toISOString(),
    duration: data?.duration || "45 minutes",
    attendees: data?.attendees || ["Sarah", "John", "Mike", "Jessica"]
  }), [data]);

  const handleToggleItem = useCallback((index) => {
    setExpandedItem(expandedItem === index ? null : index);
  }, [expandedItem]);

  const handleChatSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || isChatLoading) return;

    const userMessage = chatMessage.trim();
    const newMsg = { sender: "user", text: userMessage };
    setChatHistory(prev => [...prev, newMsg]);
    setChatMessage("");
    setIsChatLoading(true);

    try {
      const context = {
        meeting: {
          title: dashboardData.title,
          overview: dashboardData.overview,
          takeaways: dashboardData.takeaways,
          actionItems: dashboardData.actionItems,
          keyDecisions: dashboardData.keyDecisions,
          sentiment: dashboardData.sentiment
        }
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage, 
          transcriptContext: JSON.stringify(context) 
        }),
      });
      
      const responseData = await res.json();
      
      setChatHistory(prev => [...prev, { 
        sender: "ai", 
        text: responseData.reply || "I couldn't process that request. Please try again." 
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory(prev => [...prev, { 
        sender: "ai", 
        text: "Sorry, I had trouble analyzing that. Please check your connection and try again." 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatMessage, isChatLoading, dashboardData]);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }, []);

  // Early return if no data
  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#f7f3ef] dark:bg-neutral-950">
      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        
        {/* Meeting header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs sm:text-sm text-[#999] dark:text-neutral-500">
                {formatDate(dashboardData.meetingDate)}
              </span>
              <span className="text-xs text-[#999] dark:text-neutral-500">•</span>
              <span className="text-xs sm:text-sm text-[#999] dark:text-neutral-500">
                Duration: {dashboardData.duration}
              </span>
              <span className="px-2 py-0.5 bg-[#d94a4a]/10 text-[#d94a4a] text-xs rounded-full font-medium">
                AI Generated
              </span>
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2c2c2c] dark:text-white leading-tight mb-3">
            {dashboardData.title}
          </h1>
          
          <p className="text-sm sm:text-base text-[#686868] dark:text-neutral-400 leading-relaxed max-w-3xl">
            {dashboardData.overview}
          </p>

          {/* Attendees */}
          <div className="flex flex-wrap gap-2 mt-4">
            {dashboardData.attendees.map((attendee, i) => (
              <span key={i} className="text-xs bg-white dark:bg-neutral-800 px-2 py-1 rounded-full border border-[#efe5db] dark:border-neutral-700 text-[#666] dark:text-neutral-400">
                👤 {attendee}
              </span>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* Left column - Key Takeaways */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 sm:top-24">
              <InfoCard icon="💡" title="Key Takeaways">
                <ul className="space-y-3">
                  {dashboardData.takeaways.map((point, i) => (
                    <motion.li 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-2 text-sm text-[#555] dark:text-neutral-300 leading-relaxed"
                    >
                      <span className="text-[#d94a4a] mt-0.5 flex-shrink-0">•</span>
                      <span>{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </InfoCard>
            </div>
          </div>

          {/* Right column - Main content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            
            {/* Sentiment Analysis */}
            <InfoCard icon="🎯" title="Meeting Sentiment">
              <SentimentMeter 
                score={dashboardData.sentiment.score} 
                overall={dashboardData.sentiment.overall}
              />
              
              <button 
                onClick={() => setShowSentimentDetail(!showSentimentDetail)}
                className="text-sm text-[#d94a4a] hover:text-[#c13e3e] transition-colors mb-3 flex items-center gap-1"
              >
                {showSentimentDetail ? "↓ Hide details" : "→ Show sentiment breakdown"}
              </button>

              <AnimatePresence>
                {showSentimentDetail && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 pt-3 border-t border-[#efe5db] dark:border-neutral-800"
                  >
                    {dashboardData.sentiment.highlights.map((highlight, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="text-sm text-[#666] dark:text-neutral-400 py-1"
                      >
                        {highlight}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </InfoCard>

            {/* Action Items */}
            <InfoCard icon="✅" title="Action Items">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-[#999] dark:text-neutral-500">
                  {dashboardData.actionItems.length} total tasks
                </span>
                <span className="text-xs text-[#5a9e4e] dark:text-green-400">
                  {dashboardData.actionItems.filter(i => i.priority === "high").length} high priority
                </span>
              </div>
              <div className="space-y-2">
                {dashboardData.actionItems.map((item, i) => (
                  <ActionItem 
                    key={i}
                    item={item}
                    index={i}
                    isExpanded={expandedItem === i}
                    onToggle={handleToggleItem}
                  />
                ))}
              </div>
            </InfoCard>

            {/* Key Decisions */}
            {dashboardData.keyDecisions?.length > 0 && (
              <InfoCard icon="📝" title="Key Decisions Made">
                <ul className="space-y-2">
                  {dashboardData.keyDecisions.map((decision, i) => (
                    <motion.li 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-2 text-sm text-[#555] dark:text-neutral-300"
                    >
                      <span className="text-[#5a9e4e] dark:text-green-400 flex-shrink-0">✓</span>
                      <span>{decision}</span>
                    </motion.li>
                  ))}
                </ul>
              </InfoCard>
            )}

            {/* AI Assistant Chat */}
            <div className="bg-gradient-to-br from-[#fef8f0] to-white dark:from-neutral-900 dark:to-neutral-950 rounded-2xl p-4 sm:p-5 border border-[#f0e4d0] dark:border-neutral-800 shadow-sm">
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d94a4a] to-[#b83a3a] flex items-center justify-center text-xl shadow-md">
                  🤖
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#2c2c2c] dark:text-white">AI Meeting Assistant</h3>
                  <p className="text-xs sm:text-sm text-[#777] dark:text-neutral-400">
                    Ask me anything about this meeting!
                  </p>
                </div>
              </div>

              {/* Chat History */}
              {chatHistory.length > 0 && (
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {chatHistory.map((msg, i) => (
                    <ChatMessage key={i} message={msg.text} isUser={msg.sender === "user"} />
                  ))}
                  {isChatLoading && (
                    <div className="flex items-start">
                      <div className="text-sm p-3 rounded-2xl bg-white dark:bg-neutral-800 border border-[#efe5db] dark:border-neutral-700 text-[#999] rounded-tl-sm">
                        <div className="flex gap-1">
                          <span className="animate-bounce">•</span>
                          <span className="animate-bounce delay-100">•</span>
                          <span className="animate-bounce delay-200">•</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="relative">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask about action items, decisions, or next steps..."
                  className="w-full bg-white dark:bg-neutral-950 border border-[#e8e0d5] dark:border-neutral-700 rounded-xl pl-4 pr-12 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-[#d94a4a] focus:ring-1 focus:ring-[#d94a4a] text-[#2c2c2c] dark:text-white transition-all"
                  disabled={isChatLoading}
                />
                <button 
                  type="submit" 
                  disabled={isChatLoading || !chatMessage.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#d94a4a] text-white rounded-lg hover:bg-[#c13e3e] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              </form>
              
              <p className="text-xs text-[#999] dark:text-neutral-500 mt-3 text-center">
                Powered by AI • Ask questions about meeting content
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#e8e0d5] dark:border-neutral-800 mt-8 sm:mt-12 py-6 text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-xs text-[#999] dark:text-neutral-500">
            🤖 AI-generated summary • Please review important decisions before sharing
          </p>
        </div>
      </footer>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d94a4a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #c13e3e;
        }
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #262626;
          }
        }
      `}</style>
    </div>
  );
}