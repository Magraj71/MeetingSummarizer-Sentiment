"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Topbar({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user");
      }
    };
    fetchUser();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) onSearch(value);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const notifications = [
    { id: 1, text: "✅ Meeting 'Q3 Planning' was summarized", time: "5 min ago", read: false },
    { id: 2, text: "💬 New comment on your action item", time: "1 hour ago", read: false },
    { id: 3, text: "📊 Weekly report is ready", time: "3 hours ago", read: true },
    { id: 4, text: "🎉 You've analyzed 50 meetings!", time: "yesterday", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="h-16 bg-white dark:bg-neutral-950 border-b border-[#e8e0d5] dark:border-neutral-800 sticky top-0 z-20 px-6 flex items-center justify-between shadow-sm transition-colors">
        
        {/* Search bar */}
        <div className="relative w-80 max-w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa] dark:text-neutral-500">
            🔍
          </div>
          <input 
            type="text" 
            placeholder="Search meetings..." 
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-[#fefcf9] dark:bg-neutral-900 border border-[#e0d6cc] dark:border-neutral-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#d94a4a] focus:ring-1 focus:ring-[#d94a4a]/30 transition-all text-[#2c2c2c] dark:text-white placeholder:text-[#bbb] dark:placeholder:text-neutral-500"
          />
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-[#faf6f0] dark:hover:bg-neutral-900 transition-colors relative text-[#666] dark:text-neutral-400 hover:text-[#d94a4a] dark:hover:text-[#d94a4a]"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#d94a4a] rounded-full border-2 border-white dark:border-neutral-950"></span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-[#efe5db] dark:border-neutral-800 overflow-hidden z-30">
                <div className="px-4 py-3 border-b border-[#efe5db] dark:border-neutral-800 flex justify-between items-center">
                  <h3 className="font-semibold text-[#2c2c2c] dark:text-white text-sm">Notifications</h3>
                  <button className="text-xs text-[#999] dark:text-neutral-400 hover:text-[#d94a4a]">Mark all read</button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`px-4 py-3 border-b border-[#f0ece5] dark:border-neutral-800 hover:bg-[#faf6f0] dark:hover:bg-neutral-950 transition-colors ${!notif.read ? 'bg-[#d94a4a]/5 dark:bg-[#d94a4a]/10' : ''}`}>
                      <p className={`text-sm ${!notif.read ? 'text-[#2c2c2c] dark:text-white font-medium' : 'text-[#666] dark:text-neutral-400'}`}>{notif.text}</p>
                      <p className="text-xs text-[#aaa] dark:text-neutral-500 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-[#efe5db] dark:border-neutral-800 text-center">
                  <a href="/notifications" className="text-xs text-[#d94a4a] hover:underline">View all</a>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-[#e0d6cc] dark:bg-neutral-800" />

          {/* User profile */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d94a4a] to-[#b83a3a] flex items-center justify-center text-white shadow-sm">
                👤
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-[#2c2c2c] dark:text-white leading-tight">
                  {user ? user.fullName : "Loading..."}
                </p>
                <p className="text-xs text-[#999] dark:text-neutral-400">Pro Plan</p>
              </div>
            </button>

            {/* Profile dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-[#efe5db] dark:border-neutral-800 overflow-hidden z-30">
                <div className="px-4 py-3 border-b border-[#efe5db] dark:border-neutral-800">
                  <p className="text-sm font-semibold text-[#2c2c2c] dark:text-white">{user?.fullName || "Guest"}</p>
                  <p className="text-xs text-[#999] dark:text-neutral-400">{user?.email || "Not signed in"}</p>
                </div>
                <div className="py-2">
                  <a href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-[#666] dark:text-neutral-300 hover:bg-[#faf6f0] dark:hover:bg-neutral-950 hover:text-[#d94a4a] dark:hover:text-[#d94a4a] transition-colors">
                    <span>👤</span> Your profile
                  </a>
                  <a href="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-[#666] dark:text-neutral-300 hover:bg-[#faf6f0] dark:hover:bg-neutral-950 hover:text-[#d94a4a] dark:hover:text-[#d94a4a] transition-colors">
                    <span>⚙️</span> Settings
                  </a>
                  <a href="/billing" className="flex items-center gap-3 px-4 py-2 text-sm text-[#666] dark:text-neutral-300 hover:bg-[#faf6f0] dark:hover:bg-neutral-950 hover:text-[#d94a4a] dark:hover:text-[#d94a4a] transition-colors">
                    <span>💳</span> Billing
                  </a>
                  <div className="border-t border-[#efe5db] dark:border-neutral-800 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-[#d94a4a] hover:bg-[#faf6f0] dark:hover:bg-neutral-950 w-full text-left transition-colors"
                  >
                    <span>🚪</span> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfileMenu) && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={() => {
            setShowNotifications(false);
            setShowProfileMenu(false);
          }}
        />
      )}
    </>
  );
}