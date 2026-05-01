"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Building, Camera, Save, X, AlertCircle, 
  CheckCircle, Key, Bell, Shield, CreditCard, Globe,
  Moon, Sun, LogOut, Trash2, Edit2
} from "lucide-react";

// Custom Components
const AvatarSection = ({ avatarUrl, fullName, onAvatarChange, isUploading }) => {
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  
  const getInitials = () => {
    if (!fullName) return "👤";
    const parts = fullName.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return fullName[0].toUpperCase();
  };
  
  return (
    <div className="relative">
      <div className="relative group">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-white dark:border-neutral-800"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#d94a4a] to-[#b83a3a] flex items-center justify-center text-white text-3xl shadow-md border-4 border-white dark:border-neutral-800">
            {getInitials()}
          </div>
        )}
        <button
          onClick={() => setShowAvatarMenu(!showAvatarMenu)}
          className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-neutral-800 rounded-full shadow-md border border-[#e0d6cc] dark:border-neutral-700 hover:bg-[#faf6f0] dark:hover:bg-neutral-700 transition-colors"
        >
          <Camera size={14} className="text-[#666] dark:text-neutral-400" />
        </button>
      </div>
      
      <AnimatePresence>
        {showAvatarMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-[#efe5db] dark:border-neutral-800 overflow-hidden z-20"
          >
            <input
              type="url"
              placeholder="Image URL"
              className="w-full px-3 py-2 text-sm border-b border-[#efe5db] dark:border-neutral-800 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onAvatarChange(e.target.value);
                  setShowAvatarMenu(false);
                }
              }}
            />
            <button
              onClick={() => {
                onAvatarChange("");
                setShowAvatarMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Remove avatar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isUploading && (
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

const InputField = ({ label, icon: Icon, type = "text", value, onChange, placeholder, error, required }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-[#666] dark:text-neutral-400">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Icon size={16} className="text-[#999] dark:text-neutral-500" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border ${
          error ? 'border-red-400 dark:border-red-800' : 'border-[#e0d6cc] dark:border-neutral-700'
        } bg-[#fefcf9] dark:bg-neutral-950 text-[#2c2c2c] dark:text-white focus:outline-none focus:border-[#d94a4a] focus:ring-1 focus:ring-[#d94a4a]/30 transition-all`}
      />
    </div>
    {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
  </div>
);

const NotificationSetting = ({ setting, isEnabled, onToggle }) => (
  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#faf6f0] dark:hover:bg-neutral-800 transition-colors">
    <div>
      <p className="font-medium text-sm text-[#2c2c2c] dark:text-white">{setting.label}</p>
      <p className="text-xs text-[#666] dark:text-neutral-400">{setting.description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={isEnabled} 
        onChange={() => onToggle(setting.id)} 
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d94a4a]"></div>
    </label>
  </div>
);

const PlanCard = ({ plan, isCurrent, onUpgrade }) => (
  <div className={`rounded-xl p-4 border transition-all ${isCurrent ? 'bg-[#d94a4a]/5 border-[#d94a4a]/30' : 'bg-white dark:bg-neutral-900 border-[#e0d6cc] dark:border-neutral-700'}`}>
    <div className="flex justify-between items-start mb-3">
      <div>
        <h4 className="font-bold text-[#2c2c2c] dark:text-white">{plan.name}</h4>
        <p className="text-2xl font-bold text-[#2c2c2c] dark:text-white mt-1">
          ${plan.price}<span className="text-sm font-normal text-[#666] dark:text-neutral-400">/{plan.period}</span>
        </p>
      </div>
      {isCurrent && (
        <span className="px-2 py-0.5 bg-[#5a9e4e] text-white text-xs rounded-full">Current</span>
      )}
    </div>
    <ul className="space-y-2 mb-4">
      {plan.features.map((feature, i) => (
        <li key={i} className="flex items-center gap-2 text-xs text-[#666] dark:text-neutral-400">
          <CheckCircle size={12} className="text-[#5a9e4e]" />
          {feature}
        </li>
      ))}
    </ul>
    {!isCurrent && (
      <button
        onClick={onUpgrade}
        className="w-full py-2 bg-[#d94a4a] text-white rounded-lg text-sm font-medium hover:bg-[#c13e3e] transition-colors"
      >
        Upgrade to {plan.name}
      </button>
    )}
  </div>
);

const DangerZone = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  
  return (
    <div className="border border-red-200 dark:border-red-800 rounded-xl p-5 bg-red-50/30 dark:bg-red-950/10">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Trash2 size={18} className="text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-red-700 dark:text-red-400">Danger Zone</h4>
          <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-1">
            Once you delete your account, there is no going back. This action is irreversible.
          </p>
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="mt-3 px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Delete Account
            </button>
          ) : (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-red-600 dark:text-red-400">
                Type "DELETE" to confirm account deletion
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="DELETE"
                  className="flex-1 px-3 py-1.5 text-sm border border-red-300 dark:border-red-800 rounded-lg bg-white dark:bg-neutral-900"
                />
                <button className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-1.5 border border-gray-300 dark:border-neutral-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab, user }) => {
  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "security", label: "Security", icon: <Shield size={18} /> },
    { id: "billing", label: "Billing", icon: <CreditCard size={18} /> },
    { id: "preferences", label: "Preferences", icon: <Globe size={18} /> },
  ];
  
  return (
    <div className="lg:col-span-1">
      <div className="sticky top-24">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-[#efe5db] dark:border-neutral-800 overflow-hidden">
          <div className="p-5 border-b border-[#efe5db] dark:border-neutral-800 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d94a4a] to-[#b83a3a] flex items-center justify-center text-white text-2xl mx-auto mb-3">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <h3 className="font-semibold text-[#2c2c2c] dark:text-white">{user?.fullName || "User"}</h3>
            <p className="text-xs text-[#666] dark:text-neutral-400">{user?.email}</p>
          </div>
          <div className="p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-[#d94a4a]/10 text-[#d94a4a]"
                    : "text-[#666] dark:text-neutral-400 hover:bg-[#f7f3ef] dark:hover:bg-neutral-800"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-[#efe5db] dark:border-neutral-800">
            <button className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-medium transition-colors">
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded w-48"></div>
      <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-96"></div>
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gray-200 dark:bg-neutral-800 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded w-48"></div>
            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-64"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-12 bg-gray-200 dark:bg-neutral-800 rounded-xl"></div>
          <div className="h-12 bg-gray-200 dark:bg-neutral-800 rounded-xl"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState({
    emailSummaries: true,
    marketingEmails: false,
    meetingReminders: true,
    weeklyDigest: false,
  });
  const [preferences, setPreferences] = useState({
    theme: "system",
    language: "en",
    timezone: "America/New_York",
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatarUrl: "",
    company: "",
    bio: "",
  });

  const [errors, setErrors] = useState({});

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
              bio: data.user.bio || "",
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

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    return newErrors;
  }, [formData]);

  const handleSave = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage({ text: "Please fix the errors before saving", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }
    
    setSaving(true);
    setErrors({});
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
          bio: formData.bio,
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
      setMessage({ text: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleDiscard = () => {
    if (user) {
      const nameParts = user.fullName ? user.fullName.split(" ") : ["", ""];
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
        avatarUrl: user.avatarUrl || "",
        company: user.company || "",
        bio: user.bio || "",
      });
    }
    setErrors({});
    setMessage({ text: "", type: "" });
  };

  const handleAvatarChange = useCallback((url) => {
    setFormData(prev => ({ ...prev, avatarUrl: url }));
  }, []);

  const handleToggleNotification = useCallback((settingId) => {
    setNotifications(prev => ({ ...prev, [settingId]: !prev[settingId] }));
  }, []);

  const notificationSettings = [
    { id: "emailSummaries", label: "Email summaries", description: "Receive meeting summaries via email" },
    { id: "meetingReminders", label: "Meeting reminders", description: "Get notified before scheduled meetings" },
    { id: "weeklyDigest", label: "Weekly digest", description: "Weekly summary of all meetings" },
    { id: "marketingEmails", label: "Marketing emails", description: "Product updates and announcements" },
  ];

  const plans = [
    { name: "Free", price: 0, period: "month", features: ["5 meetings/month", "Basic analytics", "Email support"] },
    { name: "Pro", price: 29, period: "month", features: ["Unlimited meetings", "Advanced analytics", "Priority support", "Team collaboration"] },
    { name: "Enterprise", price: 99, period: "month", features: ["Everything in Pro", "Custom integrations", "SLA guarantee", "Dedicated support"] },
  ];

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#f7f3ef] dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2c2c2c] dark:text-white">
              Account Settings
            </h1>
            <p className="text-sm sm:text-base text-[#666] dark:text-neutral-400 mt-1">
              Manage your profile, notifications, billing, and security preferences
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-[#efe5db] dark:border-neutral-800 overflow-hidden">
                
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div>
                    <div className="p-5 sm:p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-[#efe5db] dark:border-neutral-800">
                      <AvatarSection 
                        avatarUrl={formData.avatarUrl}
                        fullName={`${formData.firstName} ${formData.lastName}`}
                        onAvatarChange={handleAvatarChange}
                        isUploading={false}
                      />
                      <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-xl sm:text-2xl font-semibold text-[#2c2c2c] dark:text-white">
                          {user?.fullName || "User Name"}
                        </h2>
                        <p className="text-sm text-[#666] dark:text-neutral-400">{user?.email}</p>
                        <p className="text-xs text-[#999] dark:text-neutral-500 mt-2">
                          Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 md:p-8 space-y-6">
                      <AnimatePresence>
                        {message.text && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -10 }}
                            className={`p-4 rounded-xl text-sm border flex items-center gap-2 ${
                              message.type === 'success' 
                                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-900 dark:text-green-400' 
                                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400'
                            }`}
                          >
                            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {message.text}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <div>
                        <h3 className="text-lg font-medium text-[#2c2c2c] dark:text-white mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <InputField 
                            label="First Name"
                            icon={User}
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            placeholder="John"
                            error={errors.firstName}
                            required
                          />
                          <InputField 
                            label="Last Name"
                            icon={User}
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            placeholder="Doe"
                            error={errors.lastName}
                            required
                          />
                          <InputField 
                            label="Email Address"
                            icon={Mail}
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="john@example.com"
                            error={errors.email}
                            required
                          />
                          <InputField 
                            label="Company Name"
                            icon={Building}
                            value={formData.company}
                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                            placeholder="Acme Corp"
                          />
                        </div>
                        <div className="mt-5">
                          <label className="block text-sm font-medium text-[#666] dark:text-neutral-400 mb-1.5">Bio</label>
                          <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            placeholder="Tell us a bit about yourself..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#e0d6cc] dark:border-neutral-700 bg-[#fefcf9] dark:bg-neutral-950 text-[#2c2c2c] dark:text-white focus:outline-none focus:border-[#d94a4a] focus:ring-1 focus:ring-[#d94a4a]/30 transition-all resize-none"
                          />
                        </div>
                      </div>

                      <div className="pt-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-[#efe5db] dark:border-neutral-800">
                        <button 
                          onClick={handleDiscard}
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
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <div className="p-5 sm:p-6 md:p-8">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-[#2c2c2c] dark:text-white">Notification Preferences</h3>
                      <p className="text-sm text-[#666] dark:text-neutral-400">Choose how you want to be notified</p>
                    </div>
                    <div className="space-y-2">
                      {notificationSettings.map((setting) => (
                        <NotificationSetting
                          key={setting.id}
                          setting={setting}
                          isEnabled={notifications[setting.id]}
                          onToggle={handleToggleNotification}
                        />
                      ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-[#efe5db] dark:border-neutral-800">
                      <button className="px-6 py-2.5 bg-[#d94a4a] text-white rounded-xl font-medium hover:bg-[#c13e3e] transition-colors">
                        Save Preferences
                      </button>
                    </div>
                  </div>
                )}

                {/* Billing Tab */}
                {activeTab === "billing" && (
                  <div className="p-5 sm:p-6 md:p-8">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-[#2c2c2c] dark:text-white">Subscription Plan</h3>
                      <p className="text-sm text-[#666] dark:text-neutral-400">Manage your billing information and subscription</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      {plans.map((plan) => (
                        <PlanCard
                          key={plan.name}
                          plan={plan}
                          isCurrent={plan.name === "Pro"}
                          onUpgrade={() => console.log("Upgrade to", plan.name)}
                        />
                      ))}
                    </div>
                    
                    <div className="bg-[#f7f3ef] dark:bg-neutral-950 rounded-xl p-5 mb-8">
                      <h4 className="font-semibold text-[#2c2c2c] dark:text-white mb-3">Payment Method</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
                          <div>
                            <p className="text-sm font-medium text-[#2c2c2c] dark:text-white">•••• 4242</p>
                            <p className="text-xs text-[#666] dark:text-neutral-400">Expires 12/2026</p>
                          </div>
                        </div>
                        <button className="text-sm text-[#d94a4a] hover:underline">Update</button>
                      </div>
                    </div>
                    
                    <DangerZone />
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div className="p-5 sm:p-6 md:p-8">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-[#2c2c2c] dark:text-white">Security Settings</h3>
                      <p className="text-sm text-[#666] dark:text-neutral-400">Manage your password and security preferences</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-[#f7f3ef] dark:bg-neutral-950 rounded-xl p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[#2c2c2c] dark:text-white">Password</p>
                            <p className="text-xs text-[#666] dark:text-neutral-400">Last changed 3 months ago</p>
                          </div>
                          <button className="px-4 py-2 text-[#d94a4a] border border-[#d94a4a] rounded-lg text-sm font-medium hover:bg-[#d94a4a]/10 transition-colors">
                            Change Password
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-[#f7f3ef] dark:bg-neutral-950 rounded-xl p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[#2c2c2c] dark:text-white">Two-Factor Authentication</p>
                            <p className="text-xs text-[#666] dark:text-neutral-400">Add an extra layer of security</p>
                          </div>
                          <button className="px-4 py-2 bg-[#2c2c2c] text-white rounded-lg text-sm font-medium hover:bg-black transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-200">
                            Enable 2FA
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-[#f7f3ef] dark:bg-neutral-950 rounded-xl p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[#2c2c2c] dark:text-white">Active Sessions</p>
                            <p className="text-xs text-[#666] dark:text-neutral-400">Manage devices where you're logged in</p>
                          </div>
                          <button className="px-4 py-2 text-[#d94a4a] border border-[#d94a4a] rounded-lg text-sm font-medium hover:bg-[#d94a4a]/10 transition-colors">
                            View Sessions
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === "preferences" && (
                  <div className="p-5 sm:p-6 md:p-8">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-[#2c2c2c] dark:text-white">Preferences</h3>
                      <p className="text-sm text-[#666] dark:text-neutral-400">Customize your experience</p>
                    </div>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-[#666] dark:text-neutral-400 mb-2">Theme</label>
                        <div className="flex gap-3">
                          {['light', 'dark', 'system'].map((theme) => (
                            <button
                              key={theme}
                              onClick={() => setPreferences({...preferences, theme})}
                              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                                preferences.theme === theme
                                  ? 'bg-[#d94a4a] text-white'
                                  : 'bg-[#f7f3ef] dark:bg-neutral-800 text-[#666] dark:text-neutral-400 hover:bg-[#e8e0d5] dark:hover:bg-neutral-700'
                              }`}
                            >
                              {theme === 'light' ? <Sun size={14} className="inline mr-1" /> : theme === 'dark' ? <Moon size={14} className="inline mr-1" /> : <Globe size={14} className="inline mr-1" />}
                              {theme}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#666] dark:text-neutral-400 mb-2">Language</label>
                        <select
                          value={preferences.language}
                          onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                          className="w-full md:w-64 px-4 py-2 rounded-xl border border-[#e0d6cc] dark:border-neutral-700 bg-[#fefcf9] dark:bg-neutral-950 text-[#2c2c2c] dark:text-white focus:outline-none focus:border-[#d94a4a]"
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#666] dark:text-neutral-400 mb-2">Timezone</label>
                        <select
                          value={preferences.timezone}
                          onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                          className="w-full md:w-96 px-4 py-2 rounded-xl border border-[#e0d6cc] dark:border-neutral-700 bg-[#fefcf9] dark:bg-neutral-950 text-[#2c2c2c] dark:text-white focus:outline-none focus:border-[#d94a4a]"
                        >
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="Europe/London">GMT (London)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-[#efe5db] dark:border-neutral-800">
                      <button className="px-6 py-2.5 bg-[#d94a4a] text-white rounded-xl font-medium hover:bg-[#c13e3e] transition-colors">
                        Save Preferences
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}