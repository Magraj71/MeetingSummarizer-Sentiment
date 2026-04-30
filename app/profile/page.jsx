"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatarUrl: "",
    company: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            const nameParts = data.user.fullName ? data.user.fullName.split(" ") : ["", ""];
            setFormData({
              firstName: nameParts[0] || "",
              lastName: nameParts.slice(1).join(" ") || "",
              email: data.user.email || "",
              avatarUrl: data.user.avatarUrl || "",
              company: data.user.company || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          avatarUrl: formData.avatarUrl,
          company: formData.company,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Profile updated successfully!", type: "success" });
        setUser(data.user);
      } else {
        setMessage({ text: data.message || "Failed to update profile", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Something went wrong.", type: "error" });
    } finally {
      setSaving(false);
    }
    
    // Auto clear message
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#d94a4a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#2c2c2c] dark:text-white">Profile Settings</h1>
          <p className="text-[#666] dark:text-neutral-400 mt-1">Manage your personal information, avatar, and preferences.</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-[#efe5db] dark:border-neutral-800 overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-[#efe5db] dark:border-neutral-800 text-center sm:text-left">
            {formData.avatarUrl ? (
              <img src={formData.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover shadow-sm border-2 border-white dark:border-neutral-800" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#d94a4a] to-[#b83a3a] flex items-center justify-center text-white text-3xl shadow-sm flex-shrink-0">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : '👤'}
              </div>
            )}
            <div className="flex-1 w-full space-y-3">
              <div>
                <h2 className="text-2xl font-semibold text-[#2c2c2c] dark:text-white">{user?.fullName || "User Name"}</h2>
                <p className="text-[#666] dark:text-neutral-400">{user?.email || "user@example.com"}</p>
              </div>
              <div className="max-w-md mx-auto sm:mx-0">
                <label className="block text-xs font-medium text-[#666] dark:text-neutral-400 mb-1 text-left">Avatar Image URL</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.avatarUrl} 
                  onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})}
                  className="w-full px-3 py-1.5 rounded-lg text-sm border border-[#e0d6cc] dark:border-neutral-700 bg-[#fefcf9] dark:bg-neutral-950 dark:text-white focus:border-[#d94a4a] focus:outline-none focus:ring-1 focus:ring-[#d94a4a]/30 transition-all" 
                />
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {message.text && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl text-sm border ${message.type === 'success' ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534] dark:bg-green-950/30 dark:border-green-900 dark:text-green-400' : 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b] dark:bg-red-950/30 dark:border-red-900 dark:text-red-400'}`}>
                {message.text}
              </motion.div>
            )}
            
            <div>
              <h3 className="text-lg font-medium text-[#2c2c2c] dark:text-white mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#666] dark:text-neutral-400 mb-1.5">First Name</label>
                  <input 
                    type="text" 
                    value={formData.firstName} 
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-[#e0d6cc] dark:border-neutral-700 bg-[#fefcf9] dark:bg-neutral-950 dark:text-white focus:border-[#d94a4a] focus:outline-none focus:ring-1 focus:ring-[#d94a4a]/30 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#666] dark:text-neutral-400 mb-1.5">Last Name</label>
                  <input 
                    type="text" 
                    value={formData.lastName} 
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-[#e0d6cc] dark:border-neutral-700 bg-[#fefcf9] dark:bg-neutral-950 dark:text-white focus:border-[#d94a4a] focus:outline-none focus:ring-1 focus:ring-[#d94a4a]/30 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#666] dark:text-neutral-400 mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-[#e0d6cc] dark:border-neutral-700 bg-[#fefcf9] dark:bg-neutral-950 dark:text-white focus:border-[#d94a4a] focus:outline-none focus:ring-1 focus:ring-[#d94a4a]/30 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#666] dark:text-neutral-400 mb-1.5">Company Name</label>
                  <input 
                    type="text" 
                    value={formData.company} 
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-[#e0d6cc] dark:border-neutral-700 bg-[#fefcf9] dark:bg-neutral-950 dark:text-white focus:border-[#d94a4a] focus:outline-none focus:ring-1 focus:ring-[#d94a4a]/30 transition-all" 
                    placeholder="e.g. Acme Corp"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#efe5db] dark:border-neutral-800">
              <h3 className="text-lg font-medium text-[#2c2c2c] dark:text-white mb-4">Plan & Billing</h3>
              <div className="bg-gradient-to-r from-[#faf6f0] to-white dark:from-neutral-900 dark:to-neutral-950 rounded-xl p-5 border border-[#e0d6cc] dark:border-neutral-800 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#2c2c2c] dark:text-white">Pro Plan</p>
                    <span className="px-2 py-0.5 bg-[#d94a4a]/10 text-[#d94a4a] text-xs font-medium rounded-full">Active</span>
                  </div>
                  <p className="text-sm text-[#666] dark:text-neutral-400 mt-1">Next billing date: May 15, 2026</p>
                </div>
                <button className="px-5 py-2.5 bg-white dark:bg-neutral-800 border border-[#e0d6cc] dark:border-neutral-700 text-[#2c2c2c] dark:text-white rounded-xl text-sm font-medium hover:bg-[#faf6f0] dark:hover:bg-neutral-700 transition-colors shadow-sm">
                  Manage Billing
                </button>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-[#efe5db] dark:border-neutral-800 mt-6">
              <button 
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 border border-[#e0d6cc] dark:border-neutral-700 rounded-xl text-[#666] dark:text-neutral-300 font-medium hover:bg-[#faf6f0] dark:hover:bg-neutral-800 transition-colors"
              >
                Discard Changes
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-2.5 bg-[#d94a4a] text-white rounded-xl font-medium hover:bg-[#c13e3e] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
