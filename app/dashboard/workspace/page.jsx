"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Mail, Link as LinkIcon, Plus, Settings, 
  CheckCircle, X, AlertCircle, Copy, ExternalLink,
  Crown, Shield, Zap, Clock, Send
} from "lucide-react";

// Custom Components
const MemberCard = ({ member, isAdmin, onRemove, currentUserEmail }) => {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  
  const getInitials = (email) => {
    return email.charAt(0).toUpperCase();
  };
  
  const getRoleBadge = () => {
    if (isAdmin) return { label: "Admin", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" };
    if (member.email === currentUserEmail) return { label: "You", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
    return { label: "Member", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" };
  };
  
  const role = getRoleBadge();
  
  return (
    <motion.li 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-[#efe5db] dark:border-neutral-800 hover:bg-[#faf6f0] dark:hover:bg-neutral-800/50 transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
          isAdmin 
            ? "bg-gradient-to-br from-purple-500 to-indigo-600"
            : member.email === currentUserEmail
              ? "bg-gradient-to-br from-blue-500 to-cyan-600"
              : "bg-gradient-to-br from-gray-400 to-gray-500 dark:from-neutral-600 dark:to-neutral-700"
        }`}>
          {getInitials(member.email)}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-[#2c2c2c] dark:text-white">
              {member.name || member.email.split('@')[0]}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${role.color}`}>
              {role.label}
            </span>
            {member.status === "pending" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                Pending
              </span>
            )}
          </div>
          <p className="text-xs text-[#666] dark:text-neutral-400">{member.email}</p>
        </div>
      </div>
      
      {!isAdmin && member.email !== currentUserEmail && (
        <div className="flex items-center gap-2 ml-12 sm:ml-0">
          <button 
            onClick={() => setShowRemoveConfirm(true)}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Remove
          </button>
        </div>
      )}
      
      {/* Remove Confirmation Modal */}
      <AnimatePresence>
        {showRemoveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRemoveConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="text-red-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-[#2c2c2c] dark:text-white mb-2">
                  Remove Team Member
                </h3>
                <p className="text-sm text-[#666] dark:text-neutral-400">
                  Are you sure you want to remove {member.email} from the workspace? They will lose access to all meeting summaries.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRemoveConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-[#666] dark:text-neutral-400 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onRemove(member.email);
                    setShowRemoveConfirm(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
};

const PlanBadge = ({ plan, memberCount, maxMembers }) => {
  const plans = {
    free: { name: "Free", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400", icon: <Users size={14} /> },
    pro: { name: "Pro", color: "bg-gradient-to-r from-[#d94a4a] to-[#b83a3a] text-white", icon: <Zap size={14} /> },
    enterprise: { name: "Enterprise", color: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white", icon: <Crown size={14} /> }
  };
  
  const currentPlan = plans[plan] || plans.free;
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${currentPlan.color}`}>
      {currentPlan.icon}
      {currentPlan.name} Plan
      <span className="text-xs opacity-75">• {memberCount}/{maxMembers} members</span>
    </div>
  );
};

const InviteForm = ({ onInvite, isInviting }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Email is required");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setError("");
    onInvite({ email, name });
    setEmail("");
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name (optional)"
          className="flex-1 bg-[#f7f3ef] dark:bg-neutral-950 border border-[#e0d6cc] dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d94a4a] focus:ring-1 focus:ring-[#d94a4a] text-[#2c2c2c] dark:text-white transition-all"
        />
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@company.com"
          className="flex-1 bg-[#f7f3ef] dark:bg-neutral-950 border border-[#e0d6cc] dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d94a4a] focus:ring-1 focus:ring-[#d94a4a] text-[#2c2c2c] dark:text-white transition-all"
        />
        <button 
          type="submit" 
          disabled={isInviting || !email}
          className="px-5 py-2.5 bg-[#2c2c2c] dark:bg-white dark:text-black text-white rounded-xl text-sm font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInviting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Plus size={16} />
          )}
          Invite
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </form>
  );
};

const SettingsPanel = ({ settings, onToggle, onUpdate }) => {
  const [showSettings, setShowSettings] = useState(false);
  
  const settingsOptions = [
    { id: "autoEmail", label: "Auto-email summaries", description: "Send meeting summaries to all team members automatically" },
    { id: "slackIntegration", label: "Slack integration", description: "Post summaries to Slack channels" },
    { id: "calendarSync", label: "Calendar sync", description: "Sync meeting schedules with team calendar" },
    { id: "privateNotes", label: "Private notes", description: "Allow members to add private notes to meetings" },
  ];
  
  return (
    <>
      <button 
        onClick={() => setShowSettings(true)}
        className="px-4 py-2 border border-[#e0d6cc] dark:border-neutral-700 rounded-xl text-sm font-medium hover:bg-[#faf6f0] dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
      >
        <Settings size={16} />
        Workspace Settings
      </button>
      
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-[#efe5db] dark:border-neutral-800 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#2c2c2c] dark:text-white">Workspace Settings</h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-[#2c2c2c] dark:text-white mb-4">Team Preferences</h3>
                  <div className="space-y-4">
                    {settingsOptions.map((option) => (
                      <div key={option.id} className="flex items-center justify-between p-3 bg-[#f7f3ef] dark:bg-neutral-950 rounded-xl">
                        <div>
                          <p className="font-medium text-sm text-[#2c2c2c] dark:text-white">{option.label}</p>
                          <p className="text-xs text-[#666] dark:text-neutral-400">{option.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings[option.id]} 
                            onChange={() => onToggle(option.id)} 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d94a4a]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-[#2c2c2c] dark:text-white mb-4">Usage & Limits</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#666] dark:text-neutral-400">API Calls</span>
                        <span className="text-[#2c2c2c] dark:text-white font-medium">847 / 1,000</span>
                      </div>
                      <div className="h-2 bg-[#e8e0d5] dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#5a9e4e] rounded-full" style={{ width: '84.7%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#666] dark:text-neutral-400">Storage Used</span>
                        <span className="text-[#2c2c2c] dark:text-white font-medium">2.4 GB / 10 GB</span>
                      </div>
                      <div className="h-2 bg-[#e8e0d5] dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#e6a017] rounded-full" style={{ width: '24%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#efe5db] dark:border-neutral-800">
                  <button className="w-full px-4 py-2 bg-[#d94a4a] text-white rounded-xl font-medium hover:bg-[#c13e3e] transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const InviteLink = ({ inviteLink }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  
  return (
    <div className="mt-4 p-4 bg-[#f7f3ef] dark:bg-neutral-950 rounded-xl border border-[#e0d6cc] dark:border-neutral-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LinkIcon size={16} className="text-[#999]" />
          <span className="text-xs text-[#666] dark:text-neutral-400">Invite link:</span>
          <code className="text-xs bg-white dark:bg-neutral-900 px-2 py-1 rounded text-[#d94a4a] break-all">
            {inviteLink}
          </code>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-xs text-[#d94a4a] hover:text-[#c13e3e] transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle size={14} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy link
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const ActivityFeed = ({ activities }) => (
  <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-[#efe5db] dark:border-neutral-800">
    <div className="flex items-center gap-2 mb-4">
      <Clock size={18} className="text-[#d94a4a]" />
      <h3 className="font-semibold text-[#2c2c2c] dark:text-white">Recent Activity</h3>
    </div>
    <div className="space-y-3">
      {activities.map((activity, i) => (
        <div key={i} className="flex items-start gap-3 text-sm">
          <div className="w-6 h-6 rounded-full bg-[#f7f3ef] dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
            {activity.icon}
          </div>
          <div>
            <p className="text-[#666] dark:text-neutral-400">{activity.message}</p>
            <p className="text-xs text-[#999] dark:text-neutral-500 mt-0.5">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function WorkspacePage() {
  const [members, setMembers] = useState([
    { email: "alex@meetlytics.com", name: "Alex Chen", role: "admin", status: "active" },
    { email: "sarah@meetlytics.com", name: "Sarah Johnson", role: "member", status: "active" },
    { email: "mike@meetlytics.com", name: "Mike Rodriguez", role: "member", status: "pending" }
  ]);
  const [settings, setSettings] = useState({
    autoEmail: true,
    slackIntegration: false,
    calendarSync: true,
    privateNotes: false
  });
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteLink, setShowInviteLink] = useState(false);
  
  const currentUserEmail = "alex@meetlytics.com";
  const workspaceName = "Engineering Team Workspace";
  const plan = "pro";
  const maxMembers = 10;
  
  const inviteLink = "https://meetlytics.com/invite/abc123xyz";
  
  const activities = [
    { icon: <Users size={12} />, message: "Sarah Johnson joined the workspace", time: "2 hours ago" },
    { icon: <Mail size={12} />, message: "Weekly sync meeting analyzed", time: "5 hours ago" },
    { icon: <Settings size={12} />, message: "Workspace settings updated", time: "Yesterday" },
    { icon: <Zap size={12} />, message: "AI Bot joined 3 meetings this week", time: "Yesterday" },
  ];
  
  const handleInvite = useCallback(async ({ email, name }) => {
    setIsInviting(true);
    
    // Simulate API call
    setTimeout(() => {
      setMembers(prev => [...prev, { 
        email, 
        name: name || email.split('@')[0],
        role: "member", 
        status: "pending" 
      }]);
      setIsInviting(false);
      
      // Show success toast (you can implement proper toast notification)
      console.log(`Invited ${email}`);
    }, 1000);
  }, []);
  
  const handleRemoveMember = useCallback((emailToRemove) => {
    setMembers(prev => prev.filter(m => m.email !== emailToRemove));
  }, []);
  
  const handleToggleSetting = useCallback((settingId) => {
    setSettings(prev => ({ ...prev, [settingId]: !prev[settingId] }));
  }, []);
  
  const memberCount = members.filter(m => m.status === "active").length;
  const pendingCount = members.filter(m => m.status === "pending").length;
  
  return (
    <main className="flex-1 min-h-screen bg-[#f7f3ef] dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2c2c2c] dark:text-white">
            Team Workspace
          </h1>
          <p className="text-sm sm:text-base text-[#666] dark:text-neutral-400 mt-1 max-w-2xl">
            Manage your team members, configure automated meeting workflows, and control workspace settings.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Workspace Info Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-[#efe5db] dark:border-neutral-800">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#d94a4a] to-[#b83a3a] flex items-center justify-center text-white shadow-lg">
                  <Users size={28} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#2c2c2c] dark:text-white">
                      {workspaceName}
                    </h2>
                    <PlanBadge plan={plan} memberCount={memberCount} maxMembers={maxMembers} />
                  </div>
                  <p className="text-sm text-[#666] dark:text-neutral-400">
                    {memberCount} active members • {pendingCount} pending invites
                  </p>
                </div>
                <SettingsPanel 
                  settings={settings} 
                  onToggle={handleToggleSetting} 
                />
              </div>
              
              {/* Team Members Section */}
              <div className="border-t border-[#f0ece5] dark:border-neutral-800 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="font-semibold text-[#2c2c2c] dark:text-white">Team Members</h3>
                    <p className="text-xs text-[#666] dark:text-neutral-400">
                      Manage access and permissions for your team
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInviteLink(!showInviteLink)}
                    className="text-sm text-[#d94a4a] hover:text-[#c13e3e] transition-colors flex items-center gap-1"
                  >
                    <LinkIcon size={14} />
                    {showInviteLink ? "Hide invite link" : "Show invite link"}
                  </button>
                </div>
                
                {showInviteLink && <InviteLink inviteLink={inviteLink} />}
                
                <InviteForm onInvite={handleInvite} isInviting={isInviting} />
                
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-[#999] uppercase tracking-wider">
                      {members.length} Members
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {members.map((member, index) => (
                      <MemberCard 
                        key={member.email}
                        member={member}
                        isAdmin={member.role === "admin"}
                        onRemove={handleRemoveMember}
                        currentUserEmail={currentUserEmail}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Automations Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm border border-[#efe5db] dark:border-neutral-800">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#fff4e5] dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-[#e6a017]" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#2c2c2c] dark:text-white">
                    Automated Email Summaries
                  </h2>
                  <p className="text-sm text-[#666] dark:text-neutral-400">
                    Keep your team in the loop automatically
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-[#666] dark:text-neutral-400 mb-6 leading-relaxed">
                When enabled, Meetlytics will automatically generate a comprehensive PDF report of your meeting 
                insights and email it to all workspace members immediately after the meeting concludes.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#f7f3ef] dark:bg-neutral-950 border border-[#e0d6cc] dark:border-neutral-800 rounded-xl">
                <div>
                  <p className="font-semibold text-[#2c2c2c] dark:text-white text-sm">
                    Send automatic summaries
                  </p>
                  <p className="text-xs text-[#999] dark:text-neutral-500">
                    Distribute AI-generated action items and decisions
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.autoEmail} 
                    onChange={() => handleToggleSetting("autoEmail")} 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d94a4a]"></div>
                </label>
              </div>
              
              <button className="mt-5 w-full py-2.5 sm:py-3 bg-[#d94a4a]/10 text-[#d94a4a] rounded-xl text-sm font-medium hover:bg-[#d94a4a]/20 transition-colors flex items-center justify-center gap-2">
                <Send size={16} />
                Send Test Summary Email
              </button>
              
              <p className="text-xs text-center text-[#999] dark:text-neutral-500 mt-3">
                Test emails will be sent to all workspace members
              </p>
            </div>
          </div>
          
          {/* Right Column - Activity Feed */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <ActivityFeed activities={activities} />
              
              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-[#d94a4a]/5 to-[#b83a3a]/5 rounded-2xl p-6 border border-[#efe5db] dark:border-neutral-800">
                <h3 className="font-semibold text-[#2c2c2c] dark:text-white mb-3">Workspace Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#666] dark:text-neutral-400">Meetings analyzed</span>
                    <span className="text-lg font-bold text-[#2c2c2c] dark:text-white">47</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#666] dark:text-neutral-400">Action items generated</span>
                    <span className="text-lg font-bold text-[#2c2c2c] dark:text-white">142</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#666] dark:text-neutral-400">Avg. sentiment score</span>
                    <span className="text-lg font-bold text-[#2c2c2c] dark:text-white">74/100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-[#efe5db] dark:border-neutral-800 text-center">
          <p className="text-xs text-[#999] dark:text-neutral-500">
            Need help? Check out our <a href="#" className="text-[#d94a4a] hover:underline">documentation</a> or contact support
          </p>
        </footer>
      </div>
    </main>
  );
}