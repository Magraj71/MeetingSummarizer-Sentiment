"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Search, Calendar, FileText, BarChart2, Video, Filter, X, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom Components
const MeetingCard = ({ meeting, index }) => {
  const getSentimentDisplay = (score) => {
    if (!score) return { emoji: "🤔", label: "Unknown", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" };
    if (score >= 70) return { emoji: "😊", label: "Positive", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
    if (score >= 40) return { emoji: "😐", label: "Neutral", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
    return { emoji: "😟", label: "Negative", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
  };

  const sentiment = getSentimentDisplay(meeting.sentiment?.score);
  const actionItemsCount = meeting.actionItems?.length || 0;
  const decisionCount = meeting.keyDecisions?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-[#efe5db] dark:border-neutral-800 hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden group"
    >
      {/* Header with badges */}
      <div className="p-4 pb-0">
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2">
            <span className="px-2.5 py-1 bg-[#f7f3ef] dark:bg-neutral-800 rounded-lg text-xs font-medium text-[#666] dark:text-neutral-400 flex items-center gap-1.5">
              <Calendar size={12} />
              {new Date(meeting.createdAt).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            {meeting.duration && (
              <span className="px-2.5 py-1 bg-[#f7f3ef] dark:bg-neutral-800 rounded-lg text-xs font-medium text-[#666] dark:text-neutral-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {meeting.duration}
              </span>
            )}
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
            meeting.type === "interview" 
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
              : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
          }`}>
            {meeting.type === "interview" ? <Video size={12} /> : <FileText size={12} />}
            {meeting.type === "interview" ? "Interview" : "Meeting"}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-[#2c2c2c] dark:text-white mb-2 line-clamp-2 group-hover:text-[#d94a4a] transition-colors">
          {meeting.title || "Untitled Meeting"}
        </h3>
        
        <p className="text-sm text-[#666] dark:text-neutral-400 line-clamp-2 mb-3">
          {meeting.overview || "No overview available."}
        </p>
      </div>
      
      {/* Stats row */}
      <div className="px-4 py-3 bg-[#faf6f0] dark:bg-neutral-950/50 border-t border-[#efe5db] dark:border-neutral-800 mt-auto">
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#999] uppercase font-semibold tracking-wider">Tasks</span>
              <span className="text-sm font-bold text-[#2c2c2c] dark:text-white">{actionItemsCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#999] uppercase font-semibold tracking-wider">Decisions</span>
              <span className="text-sm font-bold text-[#2c2c2c] dark:text-white">{decisionCount}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-[#999] uppercase font-semibold tracking-wider">Sentiment</span>
            <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${sentiment.color}`}>
              {sentiment.emoji} {sentiment.label}
            </span>
          </div>
        </div>
      </div>
      
      {/* Footer with action */}
      <div className="p-4 pt-0">
        <Link 
          href={`/dashboard/${meeting.type === "interview" ? "interview" : "meeting"}/${meeting._id}`}
          className="w-full inline-flex items-center justify-between text-sm font-medium text-[#d94a4a] hover:text-[#c13e3e] transition-colors group/btn"
        >
          <span>View Full Analysis</span>
          <span className="transform group-hover/btn:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </motion.div>
  );
};

const StatsSummary = ({ meetings }) => {
  const stats = useMemo(() => {
    const total = meetings.length;
    const totalActionItems = meetings.reduce((sum, m) => sum + (m.actionItems?.length || 0), 0);
    const avgSentiment = total > 0 
      ? Math.round(meetings.reduce((sum, m) => sum + (m.sentiment?.score || 0), 0) / total)
      : 0;
    const interviews = meetings.filter(m => m.type === "interview").length;
    const meetings_count = meetings.filter(m => m.type !== "interview").length;
    
    return { total, totalActionItems, avgSentiment, interviews, meetings_count };
  }, [meetings]);

  const statCards = [
    { label: "Total Meetings", value: stats.total, icon: "📊", color: "from-[#d94a4a] to-[#b83a3a]" },
    { label: "Action Items", value: stats.totalActionItems, icon: "✅", color: "from-[#5a9e4e] to-[#3d7a2e]" },
    { label: "Avg Sentiment", value: `${stats.avgSentiment}/100`, icon: "🎯", color: "from-[#e6a017] to-[#c47d0a]" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {statCards.map((stat, i) => (
        <div key={i} className="bg-gradient-to-br p-px rounded-2xl" style={{ background: `linear-gradient(135deg, ${stat.color.split(' ')[1]}, ${stat.color.split(' ')[3]})` }}>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#999] dark:text-neutral-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-[#2c2c2c] dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className="text-3xl opacity-80">{stat.icon}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded w-24"></div>
          <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded w-16"></div>
        </div>
        <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded w-3/4 mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-5/6"></div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-800">
          <div className="flex justify-between">
            <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded w-20"></div>
            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-24"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ hasSearch }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white dark:bg-neutral-900 rounded-2xl p-8 sm:p-12 text-center border border-[#efe5db] dark:border-neutral-800"
  >
    <div className="w-20 h-20 bg-gradient-to-br from-[#d94a4a]/10 to-[#b83a3a]/5 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-4xl">{hasSearch ? "🔍" : "📭"}</span>
    </div>
    <h3 className="text-xl font-semibold text-[#2c2c2c] dark:text-white mb-2">
      {hasSearch ? "No matching meetings" : "No meetings yet"}
    </h3>
    <p className="text-[#666] dark:text-neutral-400 max-w-md mx-auto mb-6">
      {hasSearch 
        ? "No meetings match your search criteria. Try adjusting your search terms." 
        : "You haven't analyzed any meetings yet. Start by uploading or recording your first meeting!"}
    </p>
    {!hasSearch && (
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#d94a4a] text-white rounded-xl font-medium hover:bg-[#c13e3e] transition-colors"
      >
        <FileText size={18} />
        Analyze Your First Meeting
      </Link>
    )}
  </motion.div>
);

const FilterBar = ({ filterType, setFilterType, searchTerm, setSearchTerm, onRefresh }) => {
  const [showFilters, setShowFilters] = useState(false);
  
  const filterOptions = [
    { value: "all", label: "All Meetings", icon: "📋" },
    { value: "meeting", label: "Standard", icon: "📄" },
    { value: "interview", label: "Interviews", icon: "🎥" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999] dark:text-neutral-500" size={18} />
        <input 
          type="text" 
          placeholder="Search by title or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-neutral-900 border border-[#e0d6cc] dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d94a4a]/20 focus:border-[#d94a4a] transition-all dark:text-white"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#d94a4a] transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {/* Filter Button for Mobile */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden px-4 py-2.5 bg-white dark:bg-neutral-900 border border-[#e0d6cc] dark:border-neutral-800 rounded-xl text-sm font-medium text-[#666] dark:text-neutral-400 flex items-center gap-2"
        >
          <Filter size={16} />
          Filter
        </button>
        
        {/* Filter Options - Desktop */}
        <div className="hidden sm:flex bg-white dark:bg-neutral-900 border border-[#e0d6cc] dark:border-neutral-800 rounded-xl p-1">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterType(option.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filterType === option.value
                  ? "bg-[#d94a4a] text-white shadow-sm"
                  : "text-[#666] dark:text-neutral-400 hover:bg-[#f7f3ef] dark:hover:bg-neutral-800"
              }`}
            >
              <span>{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
        
        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="px-3 py-2.5 bg-white dark:bg-neutral-900 border border-[#e0d6cc] dark:border-neutral-800 rounded-xl text-[#666] dark:text-neutral-400 hover:text-[#d94a4a] hover:border-[#d94a4a] transition-all"
          title="Refresh meetings"
        >
          <RefreshCw size={18} />
        </button>
      </div>
      
      {/* Mobile Filter Dropdown */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden flex gap-2 p-3 bg-white dark:bg-neutral-900 border border-[#e0d6cc] dark:border-neutral-800 rounded-xl"
          >
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setFilterType(option.value);
                  setShowFilters(false);
                }}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterType === option.value
                    ? "bg-[#d94a4a] text-white"
                    : "bg-[#f7f3ef] dark:bg-neutral-800 text-[#666] dark:text-neutral-400"
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* New Meeting Button */}
      <Link 
        href="/dashboard" 
        className="px-5 py-2.5 bg-[#d94a4a] text-white text-sm font-medium rounded-xl hover:bg-[#c13e3e] transition-all whitespace-nowrap flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
      >
        <FileText size={16} />
        New Meeting
      </Link>
    </div>
  );
};

export default function HistoryPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchMeetings = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    
    try {
      const res = await fetch("/api/meetings");
      if (res.ok) {
        const data = await res.json();
        setMeetings(data.meetings || []);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleRefresh = useCallback(() => {
    fetchMeetings(true);
  }, [fetchMeetings]);

  // Filter meetings based on search and type
  const filteredMeetings = useMemo(() => {
    let filtered = meetings;
    
    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(m => m.type === filterType);
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        (m.title && m.title.toLowerCase().includes(term)) ||
        (m.overview && m.overview.toLowerCase().includes(term)) ||
        (m.takeaways && m.takeaways.some(t => t.toLowerCase().includes(term))) ||
        (m.actionItems && m.actionItems.some(a => a.task.toLowerCase().includes(term)))
      );
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [meetings, searchTerm, filterType]);

  const hasSearch = searchTerm.trim().length > 0 || filterType !== "all";

  return (
    <main className="flex-1 min-h-screen bg-[#f7f3ef] dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2c2c2c] dark:text-white">
            Meeting History
          </h1>
          <p className="text-sm sm:text-base text-[#666] dark:text-neutral-400 mt-1">
            All your analyzed meetings, interviews, and insights in one place
          </p>
        </div>

        {/* Stats Summary */}
        {!loading && meetings.length > 0 && (
          <div className="mb-6 md:mb-8">
            <StatsSummary meetings={meetings} />
          </div>
        )}

        {/* Filter Bar */}
        <div className="mb-6 md:mb-8">
          <FilterBar 
            filterType={filterType}
            setFilterType={setFilterType}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Results Count */}
        {!loading && filteredMeetings.length > 0 && (
          <div className="mb-4 text-sm text-[#666] dark:text-neutral-400">
            Showing {filteredMeetings.length} of {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : filteredMeetings.length === 0 ? (
          <EmptyState hasSearch={hasSearch} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredMeetings.map((meeting, index) => (
              <MeetingCard key={meeting._id} meeting={meeting} index={index} />
            ))}
          </div>
        )}
        
        {/* Refresh indicator */}
        {refreshing && (
          <div className="fixed bottom-4 right-4 bg-white dark:bg-neutral-900 rounded-full shadow-lg p-2 border border-[#efe5db] dark:border-neutral-800">
            <div className="w-6 h-6 border-2 border-[#d94a4a] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </main>
  );
}