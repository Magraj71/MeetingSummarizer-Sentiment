"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, Copy, 
  Users, ChevronUp, ChevronDown, Share2, Maximize2, 
  Minimize2, Settings, AlertCircle, Send, MessageSquare,
  Grid, X, Wifi, WifiOff, Volume2, VolumeX
} from "lucide-react";
import Peer from "peerjs";

// ==================== CUSTOM COMPONENTS ====================

// Connection Status Indicator
const ConnectionStatus = ({ status, isConnected }) => (
  <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`} />
    <span className="text-[10px] sm:text-xs text-gray-300 truncate max-w-[100px] sm:max-w-none">{status}</span>
  </div>
);

// Control Button Component
const ControlButton = ({ onClick, icon: Icon, isActive, label, color = "default", size = "md" }) => {
  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2 sm:p-2.5 md:p-3",
    lg: "p-3 sm:p-4"
  };
  
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  };
  
  return (
    <button
      onClick={onClick}
      className={`relative ${sizeClasses[size]} rounded-full transition-all duration-200 active:scale-95 ${
        isActive 
          ? 'bg-white/10 hover:bg-white/20 text-white' 
          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
      } ${color === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
      title={label}
    >
      <Icon size={iconSizes[size]} />
      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-[10px] sm:text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block">
        {label}
      </span>
    </button>
  );
};

// Participant Video Component
const ParticipantVideo = ({ stream, isLocal, isMuted, isVideoOff, participantName, isScreenSharing = false }) => {
  const videoRef = useRef(null);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  return (
    <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-lg sm:rounded-xl overflow-hidden aspect-video group">
      {stream ? (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal ? 'transform scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 rounded-full flex items-center justify-center text-2xl sm:text-3xl mb-2">
            👤
          </div>
          <p className="text-[10px] sm:text-xs">Waiting for video...</p>
        </div>
      )}
      
      {/* Video off overlay */}
      {isVideoOff && stream && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <VideoOff size={20} className="sm:w-6 sm:h-6 text-gray-500" />
        </div>
      )}
      
      {/* Screen sharing indicator */}
      {isScreenSharing && (
        <div className="absolute top-2 left-2 bg-blue-500/80 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
          <Monitor size={12} />
          Sharing screen
        </div>
      )}
      
      {/* Participant info */}
      <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-[9px] sm:text-xs flex items-center gap-1">
        {!isLocal && !isMuted && <Mic size={8} className="sm:w-2.5 sm:h-2.5 text-green-400" />}
        {!isLocal && isMuted && <MicOff size={8} className="sm:w-2.5 sm:h-2.5 text-red-400" />}
        <span className="text-white text-[9px] sm:text-xs truncate max-w-[60px] sm:max-w-none">{participantName}</span>
        {isLocal && <span className="text-gray-400 text-[8px] sm:text-[10px]">(You)</span>}
      </div>
      
      {/* Recording indicator */}
      {!isLocal && (
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500/80 text-white text-[8px] sm:text-[10px] px-1 py-0.5 sm:px-1.5 rounded-full flex items-center gap-0.5">
          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white animate-pulse"></div>
          <span className="hidden xs:inline">LIVE</span>
        </div>
      )}
    </div>
  );
};

// Message Component (memoized for performance)
const MessageBubble = React.memo(({ message, isOwn }) => {
  const isChat = message.type === 'chat';
  const time = message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col ${isOwn ? "items-end" : "items-start"} w-full group`}
    >
      <div className={`flex items-center gap-1 mb-0.5 sm:mb-1 px-1 ${isOwn ? "flex-row-reverse" : "flex-row"} flex-wrap`}>
        <span className="text-[8px] sm:text-[10px] font-medium text-gray-500">
          {isOwn ? "You" : "Participant"}
        </span>
        <span className="text-[8px] sm:text-[10px] text-gray-600 hidden xs:inline">•</span>
        <span className="text-[8px] sm:text-[10px] text-gray-600 hidden xs:inline">
          {isChat ? (isOwn ? "chat" : "sent a message") : (isOwn ? "spoke" : "speaking")}
        </span>
        <span className="text-[7px] sm:text-[9px] text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 sm:ml-1">
          {time}
        </span>
      </div>

      <div className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs max-w-[90%] break-words shadow-sm ${
        isOwn 
          ? (isChat ? "bg-blue-600 text-white rounded-tr-sm" : "bg-gradient-to-r from-[#d94a4a] to-[#b83a3a] text-white rounded-tr-sm")
          : (isChat ? "bg-gray-800 text-gray-100 border border-gray-700/50 rounded-tl-sm" : "bg-gray-800 text-gray-200 border border-gray-700/50 rounded-tl-sm")
      }`}>
        {message.text}
      </div>
    </motion.div>
  );
});

// Sidebar Tab Component (memoized)
const SidebarTab = React.memo(({ isActive, onClick, icon: Icon, label, badge, isRecording }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2.5 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium transition-all ${
      isActive
        ? 'border-b-2 border-red-500 text-white bg-gray-900'
        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-900/50'
    }`}
  >
    {isRecording && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
    <Icon size={14} className="sm:w-4 sm:h-4" />
    <span className="hidden xs:inline">{label}</span>
    {badge > 0 && (
      <span className="text-[9px] sm:text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </button>
));

// Chat Input Component
const ChatInput = ({ value, onChange, onSend, onKeyDown, disabled }) => (
  <form onSubmit={onSend} className="flex gap-2">
    <textarea
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder="Type a message... (Enter to send)"
      rows={1}
      disabled={disabled}
      className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white resize-none focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-500 max-h-24 overflow-y-auto disabled:opacity-50"
      style={{ minHeight: '40px' }}
    />
    <button
      type="submit"
      disabled={!value.trim() || disabled}
      className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center flex-shrink-0"
    >
      <Send size={16} />
    </button>
  </form>
);

// Invite Modal Component
const InviteModal = ({ isOpen, onClose, roomUrl }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl max-w-md w-full p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-white">Invite Participants</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-400 text-xs sm:text-sm mb-4">Share this link to invite others to join the meeting</p>
        
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={roomUrl}
            readOnly
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-[#d94a4a]"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-[#d94a4a] text-white rounded-lg hover:bg-[#c13e3e] transition-colors flex items-center gap-2 text-sm"
          >
            <Copy size={14} />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Settings Modal Component
const SettingsModal = ({ isOpen, onClose, settings, onToggle }) => {
  if (!isOpen) return null;
  
  const settingsOptions = [
    { id: "pushToTalk", label: "Push to Talk", description: "Hold spacebar to unmute", icon: Mic },
    { id: "noiseSuppression", label: "Noise Suppression", description: "Filter background noise", icon: Volume2 },
    { id: "autoTranscribe", label: "Auto-transcribe", description: "Automatically transcribe speech", icon: MessageSquare },
  ];
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl max-w-md w-full p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-white">Meeting Settings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-3">
          {settingsOptions.map((option) => (
            <div key={option.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center">
                  <option.icon size={14} className="text-gray-300" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{option.label}</p>
                  <p className="text-gray-400 text-xs">{option.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings[option.id]} 
                  onChange={() => onToggle(option.id)} 
                />
                <div className="w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#d94a4a]"></div>
              </label>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// Loading States
const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
    <div className="text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 border-3 sm:border-4 border-[#d94a4a] border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
      <p className="text-white text-base sm:text-lg font-medium">Initializing Meeting Room...</p>
      <p className="text-gray-400 text-xs sm:text-sm mt-1">Setting up camera & microphone</p>
    </div>
  </div>
);

const PermissionDenied = ({ onRetry }) => (
  <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4">
    <div className="text-center max-w-sm mx-auto">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <AlertCircle size={32} className="sm:w-10 sm:h-10 text-red-500" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Camera & Microphone Access Required</h2>
      <p className="text-gray-400 text-sm mb-6">
        Please allow access to your camera and microphone to join the meeting.
      </p>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#d94a4a] text-white rounded-xl font-medium hover:bg-[#c13e3e] transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================

export default function MeetingRoom() {
  const params = useParams();
  const roomId = params.id;
  const router = useRouter();
  
  // Media & Connection State
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");
  const [isConnecting, setIsConnecting] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  // UI State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState("transcript");
  const [isMobile, setIsMobile] = useState(false);
  
  // Messages State
  const [transcriptMessages, setTranscriptMessages] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  // Replaced state with Ref because this is only used for the final summary analysis
  const allMessagesRef = useRef([]);
  
  // Settings State
  const [settings, setSettings] = useState({
    pushToTalk: false,
    noiseSuppression: true,
    autoTranscribe: true,
  });

  const [summaryData, setSummaryData] = useState(null);
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const recognitionRef = useRef(null);
  const dataConnectionRef = useRef(null);
  const pushToTalkTimeoutRef = useRef(null);
  const chatEndRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const messageQueueRef = useRef([]); // Buffer for messages while connection is opening
  
  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);
  
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptMessages]);
  
  // Add message to appropriate lists
  const addMessage = useCallback((msg) => {
    if (msg.type === 'chat') {
      setChatMessages(prev => [...prev, msg]);
    } else {
      setTranscriptMessages(prev => [...prev, msg]);
    }
    // Update ref for background storage without triggering re-render
    allMessagesRef.current.push(msg);
  }, []);
  
  // Initialize Media Stream
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: { 
          echoCancellation: settings.noiseSuppression,
          noiseSuppression: settings.noiseSuppression,
          autoGainControl: true
        } 
      });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setPermissionDenied(false);
      return stream;
    } catch (err) {
      console.error("Failed to get local stream", err);
      setPermissionDenied(true);
      setConnectionStatus("Camera/Microphone access denied");
      setIsConnecting(false);
      return null;
    }
  }, [settings.noiseSuppression]);
  
  // Speech Recognition Setup
  const setupSpeechRecognition = useCallback(() => {
    if (!settings.autoTranscribe) return;
    
    if (typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = false; // Set to false to reduce processing overhead if interim feedback is not shown
      rec.lang = 'en-US';
      
      rec.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript.trim()) {
          const msg = { 
            text: finalTranscript.trim(), 
            sender: "You",
            timestamp: new Date().toISOString(),
            type: "transcript"
          };
          addMessage(msg);
          // Send to remote peer so they see our transcript
          if (dataConnectionRef.current?.open) {
            dataConnectionRef.current.send(JSON.stringify(msg));
          } else {
            // Buffer if not open yet
            messageQueueRef.current.push(msg);
          }
        }
      };
      
      rec.onerror = (event) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        console.warn("Speech recognition error:", event.error);
      };
      
      rec.onend = () => {
        if (isRecognizingRef.current && settings.autoTranscribe) {
          try {
            rec.start();
          } catch (err) {
            console.log("Failed to restart recognition:", err);
          }
        }
      };
      
      recognitionRef.current = rec;
      try {
        rec.start();
        isRecognizingRef.current = true;
      } catch (err) {
        console.log("Failed to start recognition:", err);
      }
    }
  }, [settings.autoTranscribe, addMessage]);
  
  // Data Connection Setup — handles incoming data from remote peer
  const setupDataConnection = useCallback((conn, storeRef = true) => {
    if (storeRef) {
      dataConnectionRef.current = conn;
    }
    conn.on("open", () => {
      console.log("Data connection is now OPEN");
      setConnectionStatus("Connected & Syncing");
      
      // Flush buffered messages
      while (messageQueueRef.current.length > 0) {
        const msg = messageQueueRef.current.shift();
        conn.send(JSON.stringify(msg));
      }
    });
    conn.on("data", (raw) => {
      try {
        const data = typeof raw === "string" ? JSON.parse(raw) : raw;
        addMessage({ 
          text: data.text, 
          sender: "Participant", 
          timestamp: data.timestamp,
          type: data.type 
        });
      } catch (e) {
        console.warn("Failed to parse incoming data:", e);
      }
    });
    conn.on("error", (err) => console.warn("Data connection error:", err));
  }, [addMessage]);
  
  // Peer Connection Setup
  const setupPeerConnection = useCallback(async (stream) => {
    if (!stream) return;
    
    const peerInstance = new Peer(roomId);
    
    peerInstance.on("open", (id) => {
      console.log(`Host peer opened with ID: ${id}`);
      peerRef.current = peerInstance;
      setConnectionStatus("Waiting for participants...");
      setIsConnecting(false);
    });
    
    peerInstance.on("error", (err) => {
      setIsConnecting(false); // Clear loading on any error
      if (err.type === 'unavailable-id') {
        // Already a host — join as guest
        setConnectionStatus("Joining as guest...");
        if (!peerInstance.destroyed) peerInstance.destroy();
        
        setTimeout(() => {
          const guestPeer = new Peer();
          guestPeer.on("open", () => {
            peerRef.current = guestPeer;
            setIsConnecting(false); 
            const dataConn = guestPeer.connect(roomId, { reliable: true });
            setupDataConnection(dataConn, true); 
            const call = guestPeer.call(roomId, stream);
            call.on("stream", (incomingStream) => {
              setRemoteStream(incomingStream);
              if (remoteVideoRef.current) remoteVideoRef.current.srcObject = incomingStream;
              setConnectionStatus("Connected");
            });
          });
          guestPeer.on("error", (e) => {
            console.error("Guest peer error:", e);
            setConnectionStatus(`Error: ${e.type}`);
            setIsConnecting(false);
          });
        }, 600);
      } else if (err.type === 'network') {
        setConnectionStatus("Network error. Retrying...");
      } else {
        console.warn("Peer error:", err.type);
        setConnectionStatus(`Connection issue: ${err.type}`);
      }
    });
    
    // Host: answer incoming media calls
    peerInstance.on("call", (call) => {
      call.answer(stream);
      call.on("stream", (incomingStream) => {
        setRemoteStream(incomingStream);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = incomingStream;
        setConnectionStatus("Connected");
      });
    });
    
    // Host: accept incoming data connections from guests
    peerInstance.on("connection", (conn) => {
      setupDataConnection(conn, true); 
    });
  }, [roomId, setupDataConnection]);
  
  // Initialize everything
  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      // Safety timeout: if it takes more than 15s, show the UI anyway
      const timeout = setTimeout(() => {
        if (isMounted) setIsConnecting(false);
      }, 15000);

      const stream = await initializeMedia();
      if (stream && isMounted) {
        setupPeerConnection(stream);
        setupSpeechRecognition();
      }
      clearTimeout(timeout);
    };
    init();
    
    return () => {
      isMounted = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        isRecognizingRef.current = false;
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Push to Talk functionality
  useEffect(() => {
    if (settings.pushToTalk && localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      
      const handleKeyDown = (e) => {
        if (e.code === 'Space' && !e.repeat) {
          e.preventDefault();
          if (audioTrack) audioTrack.enabled = true;
          setIsMicOn(true);
          if (pushToTalkTimeoutRef.current) clearTimeout(pushToTalkTimeoutRef.current);
        }
      };
      
      const handleKeyUp = (e) => {
        if (e.code === 'Space') {
          pushToTalkTimeoutRef.current = setTimeout(() => {
            if (audioTrack) audioTrack.enabled = false;
            setIsMicOn(false);
          }, 100);
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        if (pushToTalkTimeoutRef.current) clearTimeout(pushToTalkTimeoutRef.current);
      };
    }
  }, [settings.pushToTalk, localStream]);
  
  // Toggle Functions
  const toggleMic = useCallback(() => {
    if (settings.pushToTalk) {
      setSettings(prev => ({ ...prev, pushToTalk: false }));
    }
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
        setIsMicOn(!isMicOn);
      }
    }
  }, [localStream, isMicOn, settings.pushToTalk]);
  
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  }, [localStream, isVideoOn]);
  
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);
  
  const sendChatMessage = useCallback((e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const msg = {
      text: chatInput.trim(),
      sender: "You",
      timestamp: new Date().toISOString(),
      type: "chat"
    };
    
    addMessage(msg);
    if (dataConnectionRef.current?.open) {
      dataConnectionRef.current.send(JSON.stringify(msg));
    } else {
      messageQueueRef.current.push(msg);
    }
    setChatInput("");
  }, [chatInput, addMessage]);
  
  const handleChatKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage(e);
    }
  }, [sendChatMessage]);
  
  const toggleSetting = useCallback((settingId) => {
    setSettings(prev => ({ ...prev, [settingId]: !prev[settingId] }));
  }, []);
  
  const endMeeting = useCallback(async () => {
    setConnectionStatus("Analyzing meeting with AI...");
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      isRecognizingRef.current = false;
    }
    
    const fullTranscript = allMessagesRef.current.map(m => `${m.sender}: ${m.text}`).join("\n\n");
    
    if (fullTranscript.length < 20) {
      alert("Meeting too short to analyze. Please try again with more discussion.");
      router.push("/dashboard");
      return;
    }
    
    try {
      const res = await fetch("/api/summarize/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: fullTranscript }),
      });
      const data = await res.json();
      
      if (data._id) {
        router.push(`/dashboard/interview/${data._id}`);
      } else {
        // Guest mode: Show summary directly in the room since it's not saved in DB
        setSummaryData(data);
        setConnectionStatus("Analysis complete");
      }
    } catch (error) {
      console.error("Failed to analyze:", error);
      alert("Failed to analyze meeting. Please try again.");
      setConnectionStatus("Analysis failed");
    }
  }, [router]);
  
  // Loading and Error States
  if (isConnecting) return <LoadingOverlay />;
  if (permissionDenied) return <PermissionDenied onRetry={() => window.location.reload()} />;
  
  // Show Summary View if analysis is done but not saved to DB
  if (summaryData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-800 pb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{summaryData.title}</h1>
              <p className="text-gray-400 max-w-2xl">{summaryData.overview}</p>
            </div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
            >
              Exit to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sentiment */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wifi size={20} className="text-blue-400" />
                Sentiment Analysis
              </h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl font-bold text-blue-500">{summaryData.sentiment?.score}%</div>
                <div>
                  <div className="text-sm font-medium uppercase tracking-wider text-gray-500">Overall</div>
                  <div className="text-lg text-white capitalize">{summaryData.sentiment?.overall}</div>
                </div>
              </div>
              <div className="space-y-2">
                {summaryData.sentiment?.highlights?.map((h, i) => (
                  <div key={i} className="text-sm text-gray-300 bg-black/20 p-2 rounded-lg italic">"{h}"</div>
                ))}
              </div>
            </div>

            {/* Key Decisions / Keywords */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Grid size={20} className="text-purple-400" />
                Key Discussion Points
              </h3>
              <div className="flex flex-wrap gap-2">
                {summaryData.keyDecisions?.map((d, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-xs">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-green-500/5 rounded-2xl p-6 border border-green-500/10">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Strengths</h3>
              <ul className="space-y-3">
                {summaryData.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-red-500/5 rounded-2xl p-6 border border-red-500/10">
              <h3 className="text-lg font-semibold text-red-400 mb-4">Areas for Improvement</h3>
              <ul className="space-y-3">
                {summaryData.weaknesses?.map((w, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Note */}
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <p className="text-blue-400 text-sm">
              Note: This meeting was not saved to your history because you are not logged in.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Top Navigation Bar */}
      <div className="flex-shrink-0 p-2 sm:p-3 md:p-4 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-[#d94a4a] to-[#b83a3a] rounded-lg flex items-center justify-center font-bold text-white text-sm sm:text-base">
            M
          </div>
          <span className="font-semibold text-white text-sm sm:text-base hidden xs:inline">Meetlytics</span>
        </div>
        
        <ConnectionStatus status={connectionStatus} isConnected={!!remoteStream} />
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={() => setShowInviteModal(true)}
            className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Invite participants"
          >
            <Share2 size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button 
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors hidden sm:block"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Grid Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Videos */}
          <div className="flex-1 p-2 sm:p-3 md:p-4 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 h-full">
              <ParticipantVideo 
                stream={remoteStream} 
                isLocal={false}
                isMuted={false}
                isVideoOff={false}
                participantName="Participant"
              />
              <ParticipantVideo 
                stream={localStream} 
                isLocal={true}
                isMuted={!isMicOn}
                isVideoOff={!isVideoOn}
                participantName="You"
              />
            </div>
          </div>
          
          {/* Control Bar — always below video, never overlapping */}
          <div className="flex-shrink-0 flex items-center justify-center gap-2 sm:gap-3 md:gap-4 py-2 sm:py-3 px-4 bg-black/60 backdrop-blur-md border-t border-gray-800">
            {/* Mic */}
            <ControlButton onClick={toggleMic} icon={isMicOn ? Mic : MicOff} isActive={isMicOn} label={isMicOn ? "Mute" : "Unmute"} size="md" />
            {/* Camera */}
            <ControlButton onClick={toggleVideo} icon={isVideoOn ? Video : VideoOff} isActive={isVideoOn} label={isVideoOn ? "Turn off camera" : "Turn on camera"} size="md" />
            <div className="w-px h-8 bg-gray-700" />
            {/* Sidebar toggle (mobile only) */}
            <button
              onClick={() => setShowSidebar(s => !s)}
              className="md:hidden p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Toggle sidebar"
            >
              <MessageSquare size={16} />
            </button>
            <div className="w-px h-8 bg-gray-700" />
            {/* End meeting */}
            <button
              onClick={endMeeting}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs sm:text-sm font-medium transition-all active:scale-95"
            >
              <PhoneOff size={14} />
              <span className="hidden xs:inline">End & Analyze</span>
            </button>
          </div>
        </div>
        
        {/* Sidebar - Transcript & Chat */}
        <AnimatePresence>
          {(showSidebar || !isMobile) && (
            <motion.div
              initial={isMobile ? { x: '100%' } : false}
              animate={isMobile ? { x: 0 } : false}
              exit={isMobile ? { x: '100%' } : false}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute md:relative inset-y-0 right-0 z-30 w-full sm:w-80 md:w-80 lg:w-96 bg-gray-950 border-l border-gray-800 flex flex-col shadow-2xl"
            >
              {/* Sidebar Header Tabs */}
              <div className="flex border-b border-gray-800">
                <SidebarTab
                  isActive={sidebarTab === 'transcript'}
                  onClick={() => setSidebarTab('transcript')}
                  icon={Mic}
                  label="Transcript"
                  badge={transcriptMessages.length}
                  isRecording={isRecognizingRef.current}
                />
                <SidebarTab
                  isActive={sidebarTab === 'chat'}
                  onClick={() => setSidebarTab('chat')}
                  icon={MessageSquare}
                  label="Chat"
                  badge={chatMessages.length}
                  isRecording={false}
                />
                <button
                  onClick={() => setShowSidebar(false)}
                  className="md:hidden p-3 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              
              {/* Transcript Tab Content */}
              {sidebarTab === 'transcript' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {transcriptMessages.length === 0 ? (
                      <div className="text-center text-gray-500 py-10">
                        <Mic size={32} className="mx-auto mb-3 opacity-40" />
                        <p className="text-sm font-medium">No transcription yet</p>
                        <p className="text-xs mt-2 text-gray-600">Both sides' speech will appear here</p>
                      </div>
                    ) : (
                      <>
                        {transcriptMessages.map((msg, i) => (
                          <MessageBubble key={i} message={msg} isOwn={msg.sender === "You"} />
                        ))}
                        <div ref={transcriptEndRef} />
                      </>
                    )}
                  </div>
                  <div className="flex-shrink-0 p-2 sm:p-3 border-t border-gray-800 bg-gray-950">
                    <div className="flex items-center justify-center gap-1.5">
                      {settings.autoTranscribe ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <p className="text-[10px] text-green-400">Live transcription active</p>
                        </>
                      ) : (
                        <p className="text-[10px] text-gray-500">Transcription disabled in settings</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Chat Tab Content */}
              {sidebarTab === 'chat' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-gray-500 py-10">
                        <MessageSquare size={32} className="mx-auto mb-3 opacity-40" />
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-xs mt-2 text-gray-600">Send a message to start chatting</p>
                      </div>
                    ) : (
                      <>
                        {chatMessages.map((msg, i) => (
                          <MessageBubble key={i} message={msg} isOwn={msg.sender === "You"} />
                        ))}
                        <div ref={chatEndRef} />
                      </>
                    )}
                  </div>
                  
                  {/* Chat Input */}
                  <div className="flex-shrink-0 p-3 border-t border-gray-800 bg-gray-950">
                    <ChatInput
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onSend={sendChatMessage}
                      onKeyDown={handleChatKeyDown}
                      disabled={false}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Mobile Sidebar Backdrop — tap to close */}
        {showSidebar && isMobile && (
          <div
            className="absolute inset-0 bg-black/40 z-20 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </div>
      
      {/* Modals */}
      <AnimatePresence>
        {showInviteModal && (
          <InviteModal 
            isOpen={showInviteModal} 
            onClose={() => setShowInviteModal(false)} 
            roomUrl={typeof window !== 'undefined' ? window.location.href : ''}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showSettings && (
          <SettingsModal 
            isOpen={showSettings} 
            onClose={() => setShowSettings(false)}
            settings={settings}
            onToggle={toggleSetting}
          />
        )}
      </AnimatePresence>
      
      {/* Push to Talk Indicator */}
      <AnimatePresence>
        {settings.pushToTalk && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-xl z-50"
          >
            <Mic size={14} className="text-red-400 animate-pulse" />
            Hold Spacebar to talk
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}