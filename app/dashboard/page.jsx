"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import MeetingInput from "@/components/MeetingInput";
import ResultsDashboard from "@/components/ResultsDashboard";
import { AnimatePresence, motion } from "framer-motion";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, AreaChart, Area, PieChart, Pie, Legend 
} from "recharts";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

// Custom components
const StatCard = ({ stat, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="group bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-[#efe5db] dark:border-neutral-800 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#d94a4a]/20"
  >
    <div className={`w-14 h-14 rounded-full bg-[#f7f3ef] dark:bg-neutral-950 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300 ${stat.color}`}>
      {stat.icon}
    </div>
    <div>
      <p className="text-[#666] dark:text-neutral-400 text-sm font-medium">{stat.label}</p>
      <p className="text-2xl font-bold text-[#2c2c2c] dark:text-white">{stat.value}</p>
    </div>
  </motion.div>
);

const MeetingTableRow = ({ meeting, onView }) => (
  <tr className="border-b border-[#f0ece5] dark:border-neutral-800/50 hover:bg-[#faf6f0] dark:hover:bg-neutral-900/50 transition-colors">
    <td className="px-4 sm:px-6 py-4 font-medium text-[#2c2c2c] dark:text-white max-w-[180px] sm:max-w-[200px] truncate">
      {meeting.title || "Untitled Meeting"}
    </td>
    <td className="px-4 sm:px-6 py-4 text-[#666] dark:text-neutral-400 text-sm">
      {new Date(meeting.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
    </td>
    <td className="px-4 sm:px-6 py-4">
      <span className="bg-[#e6f4ea] text-[#1e8e3e] dark:bg-green-900/30 dark:text-green-400 px-2.5 py-0.5 rounded-full text-xs font-medium">
        {meeting.actionItems?.length || 0} items
      </span>
    </td>
    <td className="px-4 sm:px-6 py-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">
          {meeting.sentiment?.score >= 70 ? '😊' : meeting.sentiment?.score >= 40 ? '😐' : '😟'}
        </span>
        <span className="text-sm text-[#666] dark:text-neutral-400">{meeting.sentiment?.score || 0}/100</span>
      </div>
    </td>
    <td className="px-4 sm:px-6 py-4 text-right">
      <button 
        onClick={() => onView(meeting)}
        className="text-[#d94a4a] hover:text-[#c13e3e] font-medium text-sm transition-colors"
      >
        View Details →
      </button>
    </td>
  </tr>
);

export default function Dashboard() {
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [user, setUser] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeChart, setActiveChart] = useState('sentiment');
  const router = useRouter();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, meetingsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/meetings")
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }
        
        if (meetingsRes.ok) {
          const meetingsData = await meetingsRes.json();
          setMeetings(meetingsData.meetings || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchData();
  }, []);

  // Refresh meetings after new analysis
  const refreshMeetings = useCallback(async () => {
    try {
      const meetingsRes = await fetch("/api/meetings");
      if (meetingsRes.ok) {
        const meetingsData = await meetingsRes.json();
        setMeetings(meetingsData.meetings || []);
      }
    } catch (error) {
      console.error("Error refreshing meetings:", error);
    }
  }, []);

  const handleAnalyze = async (transcript, formData = null) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      let response;
      if (formData) {
        response = await fetch("/api/summarize-audio", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transcript }),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      await refreshMeetings();
    } catch (error) {
      console.error("Error analyzing transcript:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/share/${result?._id || "demo123"}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Share link copied to clipboard!");
  };

  const handleStartLiveMeeting = () => {
    const roomId = uuidv4();
    router.push(`/room/${roomId}`);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalMeetings = meetings.length;
    const totalActionItems = meetings.reduce((acc, m) => acc + (m.actionItems?.length || 0), 0);
    const avgSentiment = totalMeetings > 0 
      ? Math.round(meetings.reduce((acc, m) => acc + (m.sentiment?.score || 50), 0) / totalMeetings)
      : 0;
    const completionRate = totalMeetings > 0 
      ? Math.round((meetings.filter(m => m.actionItems?.length > 0).length / totalMeetings) * 100)
      : 0;

    return { totalMeetings, totalActionItems, avgSentiment, completionRate };
  }, [meetings]);

  const displayStats = [
    { label: "Meetings Analyzed", value: stats.totalMeetings.toString(), icon: "📊", color: "text-[#d94a4a]" },
    { label: "Action Items Found", value: stats.totalActionItems.toString(), icon: "✅", color: "text-[#5a9e4e]" },
    { label: "Avg Sentiment Score", value: `${stats.avgSentiment}/100`, icon: "🎯", color: "text-[#e6a017]" },
    { label: "Completion Rate", value: `${stats.completionRate}%`, icon: "📈", color: "text-[#4a90d9]" },
  ];

  // Prepare chart data
  const chartData = useMemo(() => {
    return [...meetings].reverse().slice(-10).map((m, i) => ({
      name: `Meeting ${i+1}`,
      sentiment: m.sentiment?.score || 50,
      tasks: m.actionItems?.length || 0,
      date: new Date(m.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      fullDate: new Date(m.createdAt)
    }));
  }, [meetings]);

  const actionItemsData = chartData.map(item => ({
    name: item.name.split(' ')[1],
    tasks: item.tasks,
    sentiment: item.sentiment
  }));

  // Sentiment distribution for pie chart
  const sentimentDistribution = useMemo(() => {
    const positive = meetings.filter(m => (m.sentiment?.score || 0) >= 70).length;
    const neutral = meetings.filter(m => (m.sentiment?.score || 0) >= 40 && (m.sentiment?.score || 0) < 70).length;
    const negative = meetings.filter(m => (m.sentiment?.score || 0) < 40).length;
    
    return [
      { name: 'Positive (70-100)', value: positive, color: '#5a9e4e' },
      { name: 'Neutral (40-69)', value: neutral, color: '#e6a017' },
      { name: 'Negative (0-39)', value: negative, color: '#d94a4a' },
    ];
  }, [meetings]);

  // Loading skeleton
  if (loadingHistory) {
    return (
      <main className="flex-1 flex flex-col items-center justify-start py-8 md:py-12 px-4 sm:px-6">
        <div className="w-full max-w-7xl space-y-8">
          <div className="bg-gradient-to-br from-[#d94a4a]/70 to-[#b83a3a]/70 rounded-3xl p-8 sm:p-10 animate-pulse">
            <div className="h-8 bg-white/20 rounded-lg w-48 mb-4"></div>
            <div className="h-4 bg-white/20 rounded-lg w-96"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 animate-pulse">
                <div className="w-14 h-14 bg-gray-200 dark:bg-neutral-800 rounded-full mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-start py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Welcome Banner */}
              <div className="relative bg-gradient-to-br from-[#d94a4a] to-[#b83a3a] rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white">
                    Welcome back, {user ? user.fullName.split(' ')[0] : 'there'}! 👋
                  </h1>
                  <p className="text-white/80 text-base sm:text-lg max-w-xl mb-6">
                    Ready to transform your meetings into actionable intelligence?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button 
                      onClick={handleStartLiveMeeting} 
                      className="px-4 sm:px-5 py-2.5 bg-white text-[#d94a4a] font-medium rounded-xl shadow-sm hover:bg-[#fefcf9] transition-all hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#d94a4a] animate-pulse"></span>
                      Host Live Video Meeting
                    </button>
                    <a 
                      href="#input-section" 
                      className="px-4 sm:px-5 py-2.5 bg-transparent border border-white/30 text-white font-medium rounded-xl hover:bg-white/10 transition-colors text-center"
                    >
                      Upload or Paste Audio
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {displayStats.map((stat, i) => (
                  <StatCard key={i} stat={stat} index={i} />
                ))}
              </div>

              {/* Advanced Analytics Section */}
              {meetings.length > 0 && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#2c2c2c] dark:text-white">Analytics Overview</h2>
                    <div className="flex bg-[#f7f3ef] dark:bg-neutral-950 rounded-xl p-1">
                      <button
                        onClick={() => setActiveChart('sentiment')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                          activeChart === 'sentiment' 
                            ? 'bg-white dark:bg-neutral-800 text-[#d94a4a] shadow-sm' 
                            : 'text-[#666] dark:text-neutral-400 hover:text-[#d94a4a]'
                        }`}
                      >
                        Sentiment Trend
                      </button>
                      <button
                        onClick={() => setActiveChart('actions')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                          activeChart === 'actions' 
                            ? 'bg-white dark:bg-neutral-800 text-[#d94a4a] shadow-sm' 
                            : 'text-[#666] dark:text-neutral-400 hover:text-[#d94a4a]'
                        }`}
                      >
                        Action Items
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-[#efe5db] dark:border-neutral-800">
                      <h3 className="font-semibold text-[#2c2c2c] dark:text-white mb-4">
                        {activeChart === 'sentiment' ? 'Sentiment Trend (Last 10 Meetings)' : 'Action Items per Meeting'}
                      </h3>
                      <div className="h-64 sm:h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                          {activeChart === 'sentiment' ? (
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#d94a4a" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#d94a4a" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#888' }} />
                              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#888' }} />
                              <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ color: '#2c2c2c', fontWeight: 600 }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="sentiment" 
                                stroke="#d94a4a" 
                                strokeWidth={3}
                                fill="url(#sentimentGradient)"
                                dot={{ r: 4, fill: '#d94a4a', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6 }}
                              />
                            </AreaChart>
                          ) : (
                            <BarChart data={actionItemsData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} />
                              <YAxis tick={{ fontSize: 12, fill: '#888' }} allowDecimals={false} />
                              <Tooltip 
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              />
                              <Bar dataKey="tasks" fill="#5a9e4e" radius={[4, 4, 0, 0]}>
                                {actionItemsData.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.tasks > 5 ? '#d94a4a' : entry.tasks > 2 ? '#e6a017' : '#5a9e4e'} 
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Sentiment Distribution Pie Chart */}
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-[#efe5db] dark:border-neutral-800">
                      <h3 className="font-semibold text-[#2c2c2c] dark:text-white mb-4">Sentiment Distribution</h3>
                      <div className="h-48 sm:h-56">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                          <PieChart>
                            <Pie
                              data={sentimentDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {sentimentDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend 
                              verticalAlign="bottom" 
                              height={36}
                              formatter={(value) => <span className="text-xs text-[#666] dark:text-neutral-400">{value}</span>}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Meeting History Section */}
              {meetings.length > 0 && (
                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-[#efe5db] dark:border-neutral-800 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-[#efe5db] dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h3 className="font-semibold text-[#2c2c2c] dark:text-white">Recent Meetings</h3>
                    <button 
                      onClick={() => router.push('/dashboard/history')}
                      className="text-sm text-[#d94a4a] hover:text-[#c13e3e] transition-colors"
                    >
                      View All Meetings →
                    </button>
                  </div>
                  
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-xs text-[#999] uppercase bg-[#faf6f0] dark:bg-neutral-950/50">
                        <tr>
                          <th className="px-6 py-3 font-medium text-left">Title</th>
                          <th className="px-6 py-3 font-medium text-left">Date</th>
                          <th className="px-6 py-3 font-medium text-left">Tasks</th>
                          <th className="px-6 py-3 font-medium text-left">Sentiment</th>
                          <th className="px-6 py-3 font-medium text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meetings.slice(0, 5).map((meeting) => (
                          <MeetingTableRow key={meeting._id} meeting={meeting} onView={setResult} />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-[#efe5db] dark:divide-neutral-800">
                    {meetings.slice(0, 5).map((meeting) => (
                      <div key={meeting._id} className="p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-[#2c2c2c] dark:text-white">
                            {meeting.title || "Untitled Meeting"}
                          </h4>
                          <button 
                            onClick={() => setResult(meeting)}
                            className="text-[#d94a4a] text-sm font-medium"
                          >
                            View →
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-[#666] dark:text-neutral-400">
                          <span>{new Date(meeting.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="bg-[#e6f4ea] text-[#1e8e3e] dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full text-xs">
                            {meeting.actionItems?.length || 0} tasks
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {meeting.sentiment?.score >= 70 ? '😊' : meeting.sentiment?.score >= 40 ? '😐' : '😟'}
                            {meeting.sentiment?.score || 0}/100
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meeting Input Component */}
              <div id="input-section" className="pt-4 sm:pt-6 md:pt-8 border-t border-[#e8e0d5] dark:border-neutral-800">
                <MeetingInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              {/* Sticky Action Bar */}
              <div className="sticky top-16 sm:top-20 z-20 mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center bg-white dark:bg-neutral-900 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-[#efe5db] dark:border-neutral-800 backdrop-blur-sm bg-white/95 dark:bg-neutral-900/95">
                <button 
                  onClick={() => setResult(null)}
                  className="w-full sm:w-auto px-4 py-2 bg-[#faf6f0] dark:bg-neutral-950 border border-[#e0d6cc] dark:border-neutral-800 rounded-xl text-sm font-medium text-[#666] dark:text-neutral-300 hover:bg-[#f0e6dc] dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                >
                  ← Back to Dashboard
                </button>
                <div className="flex w-full sm:w-auto gap-2">
                  <button 
                    onClick={handleShare}
                    className="flex-1 sm:flex-none px-4 py-2 bg-[#d94a4a]/10 text-[#d94a4a] rounded-xl text-sm font-medium hover:bg-[#d94a4a]/20 transition-colors flex items-center justify-center gap-2"
                  >
                    Share Link 🔗
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    className="flex-1 sm:flex-none px-4 py-2 bg-[#d94a4a] text-white rounded-xl text-sm font-medium hover:bg-[#c13e3e] transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    Export PDF ⬇️
                  </button>
                </div>
              </div>
              
              {/* Results Dashboard */}
              <div id="printable-dashboard">
                <ResultsDashboard data={result} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-dashboard,
          #printable-dashboard * {
            visibility: visible;
          }
          #printable-dashboard {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
          }
          .sticky {
            display: none;
          }
          button,
          .no-print {
            display: none !important;
          }
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #d94a4a;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #c13e3e;
        }
        
        /* Dark mode scrollbar */
        @media (prefers-color-scheme: dark) {
          ::-webkit-scrollbar-track {
            background: #262626;
          }
          ::-webkit-scrollbar-thumb {
            background: #d94a4a;
          }
        }
      `}</style>
    </main>
  );
}