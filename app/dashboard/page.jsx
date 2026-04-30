"use client";

import React, { useState, useEffect } from "react";
import MeetingInput from "@/components/MeetingInput";
import ResultsDashboard from "@/components/ResultsDashboard";
import { AnimatePresence, motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function Dashboard() {
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [user, setUser] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const router = useRouter();

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
  }, [result]); // Refetch meetings when a new result is generated

  const handleAnalyze = async (transcript) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error analyzing transcript:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportPDF = () => {
    // Basic implementation - in a real app use html2pdf.js properly
    window.print();
  };

  const handleShare = () => {
    alert("Share link copied to clipboard: https://meetlytics.com/share/" + (result?._id || "demo123"));
  };

  const handleStartLiveMeeting = () => {
    const roomId = uuidv4();
    router.push(`/room/${roomId}`);
  };

  // Calculate real stats
  const totalMeetings = meetings.length;
  const totalActionItems = meetings.reduce((acc, m) => acc + (m.actionItems?.length || 0), 0);
  const avgSentiment = totalMeetings > 0 
    ? Math.round(meetings.reduce((acc, m) => acc + (m.sentiment?.score || 50), 0) / totalMeetings)
    : 0;

  const stats = [
    { label: "Meetings Analyzed", value: totalMeetings.toString(), icon: "📊", color: "text-[#d94a4a]" },
    { label: "Action Items Found", value: totalActionItems.toString(), icon: "✅", color: "text-[#5a9e4e]" },
    { label: "Avg Sentiment Score", value: `${avgSentiment}/100`, icon: "🎯", color: "text-[#e6a017]" },
  ];

  // Prepare chart data
  const chartData = [...meetings].reverse().slice(-10).map((m, i) => ({
    name: `M${i+1}`,
    score: m.sentiment?.score || 50,
    date: new Date(m.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }));

  const actionItemsData = [...meetings].reverse().slice(-5).map((m, i) => ({
    name: `M${i+1}`,
    tasks: m.actionItems?.length || 0
  }));

  return (
    <main className="flex-1 flex flex-col items-center justify-start py-8 md:py-12 px-6">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-5xl space-y-8"
          >
            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-[#d94a4a] to-[#b83a3a] rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="relative z-10">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                  Welcome back, {user ? user.fullName.split(' ')[0] : 'there'}! 👋
                </h1>
                <p className="text-white/80 text-lg max-w-xl mb-6">
                  Ready to transform your meetings into actionable intelligence?
                </p>
                <div className="flex gap-4">
                  <button onClick={handleStartLiveMeeting} className="px-5 py-2.5 bg-white text-[#d94a4a] font-medium rounded-xl shadow-sm hover:bg-[#fefcf9] transition-colors flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#d94a4a] animate-pulse"></span>
                    Host Live Video Meeting
                  </button>
                  <a href="#input-section" className="px-5 py-2.5 bg-transparent border border-white/30 text-white font-medium rounded-xl hover:bg-white/10 transition-colors">
                    Upload/Paste Audio
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-[#efe5db] dark:border-neutral-800 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
                  <div className={`w-14 h-14 rounded-full bg-[#f7f3ef] dark:bg-neutral-950 flex items-center justify-center text-2xl shadow-inner`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-[#666] dark:text-neutral-400 text-sm font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-[#2c2c2c] dark:text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Advanced Analytics Charts */}
            {meetings.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-[#efe5db] dark:border-neutral-800">
                  <h3 className="font-semibold text-[#2c2c2c] dark:text-white mb-4">Sentiment Trend (Last 10)</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="date" tick={{fontSize: 12, fill: '#888'}} />
                        <YAxis domain={[0, 100]} tick={{fontSize: 12, fill: '#888'}} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="score" stroke="#d94a4a" strokeWidth={3} dot={{r: 4, fill: '#d94a4a'}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-[#efe5db] dark:border-neutral-800">
                  <h3 className="font-semibold text-[#2c2c2c] dark:text-white mb-4">Action Items Found</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={actionItemsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 12, fill: '#888'}} />
                        <YAxis tick={{fontSize: 12, fill: '#888'}} allowDecimals={false} />
                        <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="tasks" fill="#5a9e4e" radius={[4, 4, 0, 0]}>
                          {actionItemsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === actionItemsData.length - 1 ? '#d94a4a' : '#5a9e4e'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Meeting History Table */}
            {meetings.length > 0 && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-[#efe5db] dark:border-neutral-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-[#efe5db] dark:border-neutral-800 flex justify-between items-center">
                  <h3 className="font-semibold text-[#2c2c2c] dark:text-white">Recent Meetings</h3>
                  <a href="/history" className="text-sm text-[#d94a4a] hover:underline">View all</a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-[#999] uppercase bg-[#faf6f0] dark:bg-neutral-950/50">
                      <tr>
                        <th className="px-6 py-3 font-medium">Title</th>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Tasks</th>
                        <th className="px-6 py-3 font-medium">Sentiment</th>
                        <th className="px-6 py-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meetings.slice(0, 5).map((meeting) => (
                        <tr key={meeting._id} className="border-b border-[#f0ece5] dark:border-neutral-800/50 hover:bg-[#faf6f0] dark:hover:bg-neutral-900/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-[#2c2c2c] dark:text-white max-w-[200px] truncate">{meeting.title || "Untitled Meeting"}</td>
                          <td className="px-6 py-4 text-[#666] dark:text-neutral-400">{new Date(meeting.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className="bg-[#e6f4ea] text-[#1e8e3e] dark:bg-green-900/30 dark:text-green-400 px-2.5 py-0.5 rounded-full text-xs font-medium">
                              {meeting.actionItems?.length || 0} items
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {meeting.sentiment?.score >= 70 ? '😊' : meeting.sentiment?.score >= 40 ? '😐' : '😟'} {meeting.sentiment?.score}/100
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => setResult(meeting)}
                              className="text-[#d94a4a] hover:underline font-medium"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Meeting Input Component */}
            <div id="input-section" className="pt-8 border-t border-[#e8e0d5] dark:border-neutral-800">
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
            className="w-full max-w-6xl mx-auto"
          >
            <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-neutral-900 p-4 rounded-2xl shadow-sm border border-[#efe5db] dark:border-neutral-800 sticky top-20 z-20">
              <button 
                onClick={() => setResult(null)}
                className="px-4 py-2 bg-[#faf6f0] dark:bg-neutral-950 border border-[#e0d6cc] dark:border-neutral-800 rounded-xl text-sm font-medium text-[#666] dark:text-neutral-300 hover:bg-[#f0e6dc] dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
              >
                ← Back to Dashboard
              </button>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleShare}
                  className="px-4 py-2 bg-[#d94a4a]/10 text-[#d94a4a] rounded-xl text-sm font-medium hover:bg-[#d94a4a]/20 transition-colors flex items-center gap-2"
                >
                  Share Link 🔗
                </button>
                <button 
                  onClick={handleExportPDF}
                  className="px-4 py-2 bg-[#d94a4a] text-white rounded-xl text-sm font-medium hover:bg-[#c13e3e] transition-colors flex items-center gap-2 shadow-sm"
                >
                  Export PDF ⬇️
                </button>
              </div>
            </div>
            
            {/* The result component wrapped in an ID for printing */}
            <div id="printable-dashboard">
              <ResultsDashboard data={result} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* CSS for printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #printable-dashboard, #printable-dashboard * { visibility: visible; }
          #printable-dashboard { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}} />
    </main>
  );
}
