"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Calendar, Video, CheckCircle2, ArrowRight, Zap, Shield, Clock, AlertCircle, ExternalLink, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom Components
const IntegrationCard = ({ 
  integration, 
  isConnected, 
  onConnect, 
  onDisconnect,
  index 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getIconColor = () => {
    switch(integration.id) {
      case "google": return "text-blue-600 dark:text-blue-400";
      case "bot": return "text-[#e6a017]";
      case "zoom": return "text-[#0b5c8e] dark:text-blue-500";
      default: return "text-[#d94a4a]";
    }
  };

  const getIconBg = () => {
    switch(integration.id) {
      case "google": return "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800";
      case "bot": return "bg-[#fff4e5] dark:bg-orange-900/20 border-[#f0e4d0] dark:border-orange-800";
      case "zoom": return "bg-[#e8f4f8] dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800";
      default: return "bg-[#f7f3ef] dark:bg-neutral-800";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl shadow-sm border transition-all duration-300 flex flex-col relative overflow-hidden ${
        isHovered ? 'shadow-xl border-[#d94a4a]/20' : 'border-[#efe5db] dark:border-neutral-800'
      }`}
    >
      {integration.beta && (
        <div className="absolute -right-6 top-6 w-24 rotate-45">
          <div className="bg-gradient-to-r from-[#e6a017] to-[#d94a4a] text-white text-[9px] font-bold uppercase tracking-wider py-0.5 text-center shadow-md">
            Beta
          </div>
        </div>
      )}
      
      <div className="p-5 sm:p-6 md:p-8 flex-1">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border ${getIconBg()}`}>
          {integration.icon}
        </div>
        
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className="text-lg sm:text-xl font-bold text-[#2c2c2c] dark:text-white">
            {integration.title}
          </h2>
          {integration.status && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              integration.status === "active" 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            }`}>
              {integration.status}
            </span>
          )}
        </div>
        
        <p className="text-sm text-[#666] dark:text-neutral-400 mb-6 leading-relaxed">
          {integration.description}
        </p>
        
        {integration.features && (
          <div className="mb-6 space-y-2">
            {integration.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-[#666] dark:text-neutral-400">
                <Zap size={12} className="text-[#d94a4a]" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}
        
        {integration.connectionInfo && isConnected && (
          <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-500">
              <CheckCircle2 size={16} />
              <span className="text-xs sm:text-sm font-medium">{integration.connectionInfo}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-5 sm:p-6 md:p-8 pt-0">
        <button
          onClick={isConnected ? () => onDisconnect(integration.id) : () => onConnect(integration.id)}
          disabled={integration.requires && !integration.requires.connected}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            isConnected
              ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800"
              : integration.requires && !integration.requires.connected
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-600"
                : "bg-[#d94a4a] text-white hover:bg-[#c13e3e] shadow-sm hover:shadow-md"
          }`}
        >
          {isConnected ? (
            <>Disconnect</>
          ) : (
            <>
              {integration.buttonText || "Connect"}
              <ArrowRight size={14} />
            </>
          )}
        </button>
        
        {integration.requires && !integration.requires.connected && (
          <p className="text-xs text-center text-[#999] dark:text-neutral-500 mt-2">
            {integration.requires.message}
          </p>
        )}
      </div>
    </motion.div>
  );
};

const HowItWorksStep = ({ step, icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="relative"
  >
    {index < 2 && (
      <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-[#d94a4a]/30 to-transparent -translate-x-8">
        <ArrowRight size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#d94a4a]/50" />
      </div>
    )}
    
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#d94a4a] to-[#b83a3a] text-white flex items-center justify-center font-bold shadow-lg">
        {step}
      </div>
      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 rounded-full bg-[#f7f3ef] dark:bg-neutral-800 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-[#2c2c2c] dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#666] dark:text-neutral-400 max-w-xs mx-auto">
        {description}
      </p>
    </div>
  </motion.div>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-[#efe5db] dark:border-neutral-800">
    <div className="w-8 h-8 rounded-lg bg-[#d94a4a]/10 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-sm font-semibold text-[#2c2c2c] dark:text-white mb-1">{title}</h4>
      <p className="text-xs text-[#666] dark:text-neutral-400">{description}</p>
    </div>
  </div>
);

const ConnectedServices = ({ connections, onDisconnect }) => {
  if (connections.length === 0) return null;
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-[#5a9e4e] rounded-full"></div>
        <h3 className="text-sm font-semibold text-[#2c2c2c] dark:text-white">
          Connected Services
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {connections.map((conn) => (
          <div key={conn.id} className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full">
            {conn.icon}
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              {conn.name}
            </span>
            <button
              onClick={() => onDisconnect(conn.id)}
              className="text-green-500 hover:text-red-500 transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function IntegrationsPage() {
  const [connections, setConnections] = useState({
    google: false,
    zoom: false,
    bot: false
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = "success") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  const handleConnect = useCallback((integrationId) => {
    if (integrationId === "google") {
      // Simulate OAuth flow
      addNotification("Connecting to Google Calendar...", "info");
      setTimeout(() => {
        setConnections(prev => ({ ...prev, google: true }));
        addNotification("✓ Google Calendar connected successfully!", "success");
      }, 1500);
    } else if (integrationId === "zoom") {
      if (!connections.google) {
        addNotification("Please connect Google Calendar first before enabling Zoom integration", "error");
        return;
      }
      addNotification("Connecting to Zoom...", "info");
      setTimeout(() => {
        setConnections(prev => ({ ...prev, zoom: true }));
        addNotification("✓ Zoom integration enabled!", "success");
      }, 1500);
    } else if (integrationId === "bot") {
      if (!connections.google) {
        addNotification("Please connect Google Calendar first to enable the AI Bot", "error");
        return;
      }
      addNotification("Initializing AI Meeting Bot...", "info");
      setTimeout(() => {
        setConnections(prev => ({ ...prev, bot: true }));
        addNotification("✓ AI Bot is now active and will join your meetings!", "success");
      }, 1500);
    }
  }, [connections.google, addNotification]);

  const handleDisconnect = useCallback((integrationId) => {
    setConnections(prev => ({ ...prev, [integrationId]: false }));
    addNotification(`${integrationId === "google" ? "Google Calendar" : integrationId === "zoom" ? "Zoom" : "AI Bot"} disconnected`, "info");
  }, [addNotification]);

  const integrations = useMemo(() => [
    {
      id: "google",
      title: "Google Calendar Sync",
      description: "Sync your calendar to see all upcoming meetings. Meetlytics automatically identifies meetings with video links.",
      icon: <Calendar size={24} className="text-blue-600 dark:text-blue-400" />,
      features: [
        "Two-way calendar sync",
        "Automatic meeting detection",
        "Real-time updates"
      ],
      connectionInfo: connections.google ? "Connected to workspace@meetlytics.com" : null,
      buttonText: "Connect Google Account"
    },
    {
      id: "zoom",
      title: "Zoom Integration",
      description: "Enable our AI bot to automatically join your Zoom meetings as a participant for recording and transcription.",
      icon: <Video size={24} className="text-[#0b5c8e] dark:text-blue-500" />,
      features: [
        "Auto-join scheduled meetings",
        "Cloud recording support",
        "Post-meeting analytics"
      ],
      connectionInfo: connections.zoom ? "Zoom bot is active" : null,
      buttonText: "Enable Zoom Bot",
      requires: {
        connected: connections.google,
        message: "Connect Google Calendar first"
      }
    },
    {
      id: "bot",
      title: "AI Meeting Bot",
      description: "Our intelligent bot automatically joins your calls to record, transcribe, and generate actionable insights.",
      icon: <Zap size={24} className="text-[#e6a017]" />,
      features: [
        "Real-time transcription",
        "Sentiment analysis",
        "Auto-generated summaries"
      ],
      connectionInfo: connections.bot ? "Bot is active and ready" : null,
      buttonText: "Activate AI Bot",
      requires: {
        connected: connections.google,
        message: "Connect calendar first"
      },
      beta: true
    }
  ], [connections.google, connections.zoom, connections.bot]);

  const connectedServicesList = useMemo(() => {
    const services = [];
    if (connections.google) services.push({ id: "google", name: "Google Calendar", icon: <Calendar size={12} /> });
    if (connections.zoom) services.push({ id: "zoom", name: "Zoom", icon: <Video size={12} /> });
    if (connections.bot) services.push({ id: "bot", name: "AI Bot", icon: <Zap size={12} /> });
    return services;
  }, [connections]);

  const howItWorksSteps = [
    {
      icon: <Calendar size={20} className="text-[#d94a4a]" />,
      title: "Calendar Sync",
      description: "Connect your calendar to let us know when and where your meetings are scheduled."
    },
    {
      icon: <Video size={20} className="text-[#d94a4a]" />,
      title: "Bot Joins Call",
      description: "Our AI assistant joins as a participant right when your meeting starts."
    },
    {
      icon: <Zap size={20} className="text-[#d94a4a]" />,
      title: "Auto-Summary",
      description: "Get instant insights, summaries, and action items delivered to your inbox."
    }
  ];

  return (
    <main className="flex-1 min-h-screen bg-[#f7f3ef] dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2c2c2c] dark:text-white">
                Integrations
              </h1>
              <p className="text-sm sm:text-base text-[#666] dark:text-neutral-400 mt-1 max-w-2xl">
                Connect your favorite tools to let Meetlytics automatically join, record, and analyze your meetings.
              </p>
            </div>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-white dark:bg-neutral-900 border border-[#e0d6cc] dark:border-neutral-800 rounded-xl text-sm font-medium text-[#666] dark:text-neutral-400 hover:text-[#d94a4a] hover:border-[#d94a4a] transition-all flex items-center gap-2"
            >
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>

        {/* Connected Services */}
        <ConnectedServices 
          connections={connectedServicesList} 
          onDisconnect={handleDisconnect}
        />

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {integrations.map((integration, index) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              isConnected={connections[integration.id]}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              index={index}
            />
          ))}
        </div>

        {/* How it Works Section */}
        <div className="bg-gradient-to-br from-white to-[#fefcf9] dark:from-neutral-900 dark:to-neutral-950 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#efe5db] dark:border-neutral-800 mb-8">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#d94a4a]/10 rounded-full mb-3">
              <Zap size={14} className="text-[#d94a4a]" />
              <span className="text-xs font-medium text-[#d94a4a] uppercase tracking-wide">How It Works</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#2c2c2c] dark:text-white mb-2">
              Automated Meeting Intelligence
            </h2>
            <p className="text-sm text-[#666] dark:text-neutral-400 max-w-2xl mx-auto">
              Set it up once, and let our AI handle the rest
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {howItWorksSteps.map((step, index) => (
              <HowItWorksStep
                key={index}
                step={index + 1}
                icon={step.icon}
                title={step.title}
                description={step.description}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Features & Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <FeatureCard
            icon={<Shield size={16} className="text-[#d94a4a]" />}
            title="Privacy First"
            description="Your data is encrypted and never shared. Bots join with clear identification."
          />
          <FeatureCard
            icon={<Clock size={16} className="text-[#d94a4a]" />}
            title="24/7 Availability"
            description="Our bots work around the clock, joining meetings in any timezone."
          />
          <FeatureCard
            icon={<ExternalLink size={16} className="text-[#d94a4a]" />}
            title="Multi-Platform"
            description="Support for Google Meet, Zoom, Microsoft Teams, and more coming soon."
          />
          <FeatureCard
            icon={<Settings size={16} className="text-[#d94a4a]" />}
            title="Customizable"
            description="Configure which meetings to join and what data to capture."
          />
        </div>

        {/* Notification Toast */}
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
                notification.type === "success" 
                  ? "bg-green-500 text-white"
                  : notification.type === "error"
                    ? "bg-red-500 text-white"
                    : "bg-blue-500 text-white"
              }`}
            >
              {notification.type === "success" && <CheckCircle2 size={16} />}
              {notification.type === "error" && <AlertCircle size={16} />}
              <span className="text-sm">{notification.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Settings Modal */}
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
                className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-[#2c2c2c] dark:text-white mb-4">
                  Integration Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[#2c2c2c] dark:text-white mb-2">
                      <input type="checkbox" className="rounded border-[#e0d6cc]" />
                      Auto-join all meetings
                    </label>
                    <p className="text-xs text-[#666] dark:text-neutral-400 ml-6">
                      Bot will automatically join any meeting with a video link
                    </p>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[#2c2c2c] dark:text-white mb-2">
                      <input type="checkbox" className="rounded border-[#e0d6cc]" />
                      Send email summaries
                    </label>
                    <p className="text-xs text-[#666] dark:text-neutral-400 ml-6">
                      Receive meeting summaries directly in your inbox
                  </p>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[#2c2c2c] dark:text-white mb-2">
                      <input type="checkbox" className="rounded border-[#e0d6cc]" />
                      Notify before joining
                    </label>
                    <p className="text-xs text-[#666] dark:text-neutral-400 ml-6">
                      Get a notification 5 minutes before bot joins a meeting
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-2 bg-[#d94a4a] text-white rounded-xl font-medium hover:bg-[#c13e3e] transition-colors"
                  >
                    Save Settings
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-[#666] dark:text-neutral-400 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}