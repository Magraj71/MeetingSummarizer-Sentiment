"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, Copy, 
  Users, ChevronUp, ChevronDown, Wifi, WifiOff,
  Share2, Maximize2, Minimize2, Settings, AlertCircle,
  Send, MessageSquare
} from "lucide-react";
import Peer from "peerjs";

// Custom Components
const ConnectionStatus = ({ status, isConnected }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-xs sm:text-sm">
    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`}></div>
    <span className="text-gray-300">{status}</span>
  </div>
);

const ControlButton = ({ onClick, icon: Icon, isActive, label, color = "default" }) => (
  <button
    onClick={onClick}
    className={`relative p-2.5 sm:p-3 rounded-full transition-all duration-200 group ${
      isActive 
        ? 'bg-white/10 hover:bg-white/20 text-white' 
        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
    } ${color === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
    title={label}
  >
    <Icon size={18} className="sm:w-5 sm:h-5" />
    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
      {label}
    </span>
  </button>
);

const ParticipantVideo = ({ stream, isLocal, isMuted, isVideoOff, participantName }) => {
  const videoRef = useRef(null);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  return (
    <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden aspect-video">
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
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-800 rounded-full flex items-center justify-center text-3xl sm:text-4xl mb-3">
            👤
          </div>
          <p className="text-xs sm:text-sm">Waiting for video...</p>
        </div>
      )}
      
      {/* Video off overlay */}
      {isVideoOff && stream && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <VideoOff size={24} className="text-gray-500" />
        </div>
      )}
      
      {/* Participant info */}
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs flex items-center gap-1.5">
        {!isLocal && !isMuted && <Mic size={10} className="text-green-400" />}
        {!isLocal && isMuted && <MicOff size={10} className="text-red-400" />}
        <span className="text-white text-xs">{participantName}</span>
        {isLocal && <span className="text-gray-400 text-[10px]">(You)</span>}
      </div>
      
      {/* Recording indicator */}
      {!isLocal && (
        <div className="absolute top-2 right-2 bg-red-500/80 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
          LIVE
        </div>
      )}
    </div>
  );
};

const TranscriptMessage = ({ message, isOwn }) => {
  const isChat = message.type === 'chat';
  const time = message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col ${isOwn ? "items-end" : "items-start"} w-full group`}
    >
      <div className={`flex items-center gap-1.5 mb-1 px-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
        <span className="text-[10px] font-medium text-gray-500">
          {isOwn ? "You" : "Participant"}
        </span>
        <span className="text-[10px] text-gray-600">•</span>
        <span className="text-[10px] text-gray-600">
          {isChat ? (isOwn ? "chat" : "sent a message") : (isOwn ? "spoke" : "speaking")}
        </span>
        <span className="text-[9px] text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
          {time}
        </span>
      </div>

      <div className={`px-3 py-2 rounded-2xl text-xs sm:text-sm max-w-[85%] break-words shadow-sm relative ${
        isOwn 
          ? (isChat ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm" : "bg-gradient-to-br from-[#d94a4a] to-[#b83a3a] text-white rounded-tr-sm")
          : (isChat ? "bg-gray-800 text-gray-100 border border-gray-700/50 rounded-tl-sm" : "bg-gray-800 text-gray-200 border border-gray-700/50 rounded-tl-sm")
      }`}>
        {message.text}
      </div>
    </motion.div>
  );
};

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-[#d94a4a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg font-medium">Initializing Meeting Room...</p>
      <p className="text-gray-400 text-sm mt-2">Setting up camera & microphone</p>
    </div>
  </div>
);

const PermissionDenied = ({ onRetry }) => (
  <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={40} className="text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Camera & Microphone Access Required</h2>
      <p className="text-gray-400 mb-6">
        Please allow access to your camera and microphone to join the meeting.
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-[#d94a4a] text-white rounded-xl font-medium hover:bg-[#c13e3e] transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

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
        className="bg-gray-900 rounded-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-2">Invite Participants</h3>
        <p className="text-gray-400 text-sm mb-4">Share this link to invite others to join the meeting</p>
        
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={roomUrl}
            readOnly
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#d94a4a]"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-[#d94a4a] text-white rounded-lg hover:bg-[#c13e3e] transition-colors flex items-center gap-2"
          >
            <Copy size={16} />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const SettingsPanel = ({ isOpen, onClose, settings, onToggle }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Meeting Settings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
            <div>
              <p className="text-white text-sm font-medium">Push to Talk</p>
              <p className="text-gray-400 text-xs">Hold spacebar to unmute</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.pushToTalk} 
                onChange={() => onToggle("pushToTalk")} 
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d94a4a]"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
            <div>
              <p className="text-white text-sm font-medium">Noise Suppression</p>
              <p className="text-gray-400 text-xs">Filter background noise</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.noiseSuppression} 
                onChange={() => onToggle("noiseSuppression")} 
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d94a4a]"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
            <div>
              <p className="text-white text-sm font-medium">Auto-transcribe</p>
              <p className="text-gray-400 text-xs">Automatically transcribe speech</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.autoTranscribe} 
                onChange={() => onToggle("autoTranscribe")} 
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d94a4a]"></div>
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function MeetingRoom() {
  const params = useParams();
  const roomId = params.id;
  const router = useRouter();
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");
  const [isConnecting, setIsConnecting] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [sidebarTab, setSidebarTab] = useState("transcript"); // 'transcript' | 'chat'
  const [transcriptMessages, setTranscriptMessages] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const chatEndRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const [settings, setSettings] = useState({
    pushToTalk: false,
    noiseSuppression: true,
    autoTranscribe: true,
  });
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  
  // Transcription & chat state
  const [messages, setMessages] = useState([]);
  const [recognition, setRecognition] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const dataConnectionRef = useRef(null);
  const pushToTalkTimeoutRef = useRef(null);
  
  // Initialize Media and PeerJS
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
  
  const setupSpeechRecognition = useCallback(() => {
    if (!settings.autoTranscribe) return;
    
    if (typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = false;
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
            text: finalTranscript, 
            sender: "You",
            timestamp: new Date().toISOString(),
            type: "transcript"
          };
          addMessage(msg);
          // Send to peer
          if (dataConnectionRef.current && dataConnectionRef.current.open) {
            dataConnectionRef.current.send(msg);
          }
        }
      };
      
      rec.onerror = (event) => {
        // Silencing non-critical errors to keep console clean
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        
        console.warn("Speech recognition error:", event.error);
        if (event.error === 'network') {
          console.warn("Network error in speech recognition. Will attempt auto-restart...");
        } else if (event.error === 'not-allowed') {
          setIsRecognizing(false);
        }
      };
      
      rec.onend = () => {
        if (isRecognizing && settings.autoTranscribe) {
          try {
            rec.start();
          } catch (err) {
            console.log("Failed to restart recognition:", err);
          }
        }
      };
      
      setRecognition(rec);
      try {
        rec.start();
        setIsRecognizing(true);
      } catch (err) {
        console.log("Failed to start recognition:", err);
      }
    }
  }, [settings.autoTranscribe, isRecognizing]);
  
  const setupPeerConnection = useCallback(async (stream) => {
    if (!stream) return;
    
    // First, try to be the host by using roomId as our peer ID
    const peerInstance = new Peer(roomId);
    
    const setupHandlers = (p, isHost) => {
      p.on("open", (id) => {
        console.log(`Peer opened as ${isHost ? 'Host' : 'Guest'} with ID: ${id}`);
        peerRef.current = p;
        setPeer(p);
        setConnectionStatus(isHost ? "Waiting for participants..." : "Connecting to host...");
        setIsConnecting(false);
        
        if (!isHost) {
          // If we are a guest, initiate connection and call to the host
          const conn = p.connect(roomId);
          handleConnection(conn);
          
          const call = p.call(roomId, stream);
          handleCall(call);
        }
      });

      p.on("disconnected", () => {
        if (!p.destroyed) {
          console.warn("Peer disconnected from signaling server. Reconnecting...");
          setConnectionStatus("Reconnecting to server...");
          try {
            // Only reconnect if not already trying or destroyed
            p.reconnect();
          } catch (e) {
            console.error("Reconnect failed:", e);
          }
        }
      });

      p.on("error", (err) => {
        // Only log serious errors, not the ones we're handling or expect
        if (err.type !== 'unavailable-id' && err.type !== 'peer-unavailable') {
          console.error("Peer error:", err.type, err.message);
        }
        
        if (err.type === 'unavailable-id' && isHost) {
          console.log("Room ID taken (already a host). Joining as guest...");
          // Ensure we don't try to reconnect to this doomed peer
          if (!p.destroyed) {
            p.destroy();
          }
          
          setTimeout(() => {
            const guestPeer = new Peer();
            setupHandlers(guestPeer, false);
          }, 500);
          return;
        }

        if (err.type === 'network') {
          setConnectionStatus("Network error. Retrying...");
          if (!p.destroyed) setTimeout(() => p.reconnect(), 2000);
        } else if (err.type !== 'peer-unavailable') {
          setConnectionStatus("Connection error: " + err.type);
        }
      });

      p.on("call", (call) => {
        console.log("Incoming call...");
        call.answer(stream);
        handleCall(call);
      });

      p.on("connection", (conn) => {
        console.log("Incoming data connection...");
        handleConnection(conn);
      });
    };

    const handleConnection = (conn) => {
      const onOpen = () => {
        console.log("Data connection established");
        setConnectionStatus("Connected");
        dataConnectionRef.current = conn;
        setupDataConnection(conn);
      };

      if (conn.open) {
        onOpen();
      } else {
        conn.on("open", onOpen);
      }
      
      conn.on("error", (err) => console.error("Data connection error:", err));
    };

    const handleCall = (call) => {
      call.on("stream", (remoteStream) => {
        console.log("Received remote stream");
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
        setConnectionStatus("Connected");
      });
      call.on("error", (err) => console.error("Call error:", err));
    };

    setupHandlers(peerInstance, true);
    
  }, [roomId]);
  
  const addMessage = useCallback((msg) => {
    if (msg.type === 'chat') {
      setChatMessages(prev => [...prev, msg]);
    } else {
      setTranscriptMessages(prev => [...prev, msg]);
    }
    // keep combined list for end-meeting analysis
    setMessages(prev => [...prev, msg]);
  }, []);

  const setupDataConnection = useCallback((conn) => {
    // Listener for incoming data (chat or transcript)
    conn.on("data", (data) => {
      console.log("Received data:", data);
      addMessage({ 
        text: data.text, 
        sender: "Participant", 
        timestamp: data.timestamp,
        type: data.type 
      });
    });
  }, [addMessage]);
  
  // Auto-scroll effects
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptMessages]);
  
  // Initialize everything
  useEffect(() => {
    const init = async () => {
      const stream = await initializeMedia();
      if (stream) {
        setupPeerConnection(stream);
        setupSpeechRecognition();
      }
    };
    init();
    
    return () => {
      if (recognition) {
        recognition.stop();
        setIsRecognizing(false);
      }
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Push to talk functionality
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
          if (pushToTalkTimeoutRef.current) clearTimeout(pushToTalkTimeoutRef.current);
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
  
  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setShowInviteModal(false);
    // Could add a toast notification here
  }, []);
  
  const endMeeting = useCallback(async () => {
    setConnectionStatus("Analyzing meeting with AI...");
    if (recognition) {
      recognition.stop();
      setIsRecognizing(false);
    }
    
    const fullTranscript = messages.map(m => `${m.sender}: ${m.text}`).join("\n\n");
    
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
      router.push(`/dashboard/interview/${data._id}`);
    } catch (error) {
      console.error("Failed to analyze:", error);
      alert("Failed to analyze meeting. Please try again.");
      router.push("/dashboard");
    }
  }, [messages, recognition, router]);
  
  const toggleSetting = useCallback((settingId) => {
    setSettings(prev => ({ ...prev, [settingId]: !prev[settingId] }));
  }, []);
  
  const sendMessage = useCallback((e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const msg = {
      text: chatInput,
      sender: "You",
      timestamp: new Date().toISOString(),
      type: "chat"
    };
    
    addMessage(msg);
    if (dataConnectionRef.current && dataConnectionRef.current.open) {
      dataConnectionRef.current.send(msg);
    }
    setChatInput("");
  }, [chatInput, addMessage]);

  const handleChatKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  }, [sendMessage]);
  
  // Loading state
  if (isConnecting) {
    return <LoadingOverlay />;
  }
  
  // Permission denied
  if (permissionDenied) {
    return <PermissionDenied onRetry={() => window.location.reload()} />;
  }
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Topbar */}
      <div className="p-3 sm:p-4 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#d94a4a] to-[#b83a3a] rounded-lg flex items-center justify-center font-bold text-white">
            M
          </div>
          <span className="font-semibold text-white text-sm sm:text-base hidden sm:inline">Meetlytics</span>
        </div>
        
        <ConnectionStatus status={connectionStatus} isConnected={!!remoteStream} />
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowInviteModal(true)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Invite participants"
          >
            <Share2 size={16} className="sm:w-4 sm:h-4" />
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={16} className="sm:w-4 sm:h-4" />
          </button>
          <button 
            onClick={toggleFullscreen}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors hidden sm:block"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Video Area */}
        <div className="flex-1 p-2 sm:p-4 relative flex flex-col">
          <div className="relative flex-1 min-h-0">
            {/* Main Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 h-full pb-20 sm:pb-0">
              {/* Remote Video */}
              <ParticipantVideo 
                stream={remoteStream} 
                isLocal={false}
                isMuted={false}
                isVideoOff={false}
                participantName="Participant"
              />
              
              {/* Local Video */}
              <ParticipantVideo 
                stream={localStream} 
                isLocal={true}
                isMuted={!isMicOn}
                isVideoOff={!isVideoOn}
                participantName="You"
              />
            </div>
          </div>
          
          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 sm:gap-3 bg-black/80 backdrop-blur-md px-3 sm:px-5 py-2 sm:py-3 rounded-full border border-gray-700 shadow-xl z-20 w-[90%] sm:w-auto justify-center">
            <ControlButton 
              onClick={toggleMic} 
              icon={isMicOn ? Mic : MicOff} 
              isActive={isMicOn}
              label={isMicOn ? "Mute" : "Unmute"}
            />
            <ControlButton 
              onClick={toggleVideo} 
              icon={isVideoOn ? Video : VideoOff} 
              isActive={isVideoOn}
              label={isVideoOn ? "Turn off camera" : "Turn on camera"}
            />
            <div className="w-px h-8 bg-gray-700 mx-1 sm:mx-2" />
            <ControlButton 
              onClick={endMeeting} 
              icon={PhoneOff} 
              isActive={true}
              label="End & Analyze"
              color="danger"
            />
          </div>
        </div>
        
        {/* Right Sidebar: Transcript + Chat with tabs */}
        <div className={`
          absolute right-0 top-0 h-full z-30 sm:relative sm:z-0
          ${showTranscript ? 'w-full sm:w-96' : 'w-0'} 
          bg-gray-950 sm:border-l border-gray-800 flex flex-col transition-all duration-300 overflow-hidden shadow-2xl sm:shadow-none
        `}>
          {/* Tab Header */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setSidebarTab('transcript')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors border-b-2 ${
                sidebarTab === 'transcript'
                  ? 'border-red-500 text-white bg-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-900/50'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isRecognizing ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} />
              Live Transcript
              {transcriptMessages.length > 0 && (
                <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
                  {transcriptMessages.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setSidebarTab('chat')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors border-b-2 ${
                sidebarTab === 'chat'
                  ? 'border-blue-500 text-white bg-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-900/50'
              }`}
            >
              <MessageSquare size={14} />
              Chat
              {chatMessages.length > 0 && (
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">
                  {chatMessages.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowTranscript(false)}
              className="sm:hidden px-3 text-gray-400 hover:text-white"
            >
              <ChevronDown size={18} className="-rotate-90" />
            </button>
          </div>

          {/* Transcript Tab */}
          {sidebarTab === 'transcript' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                {transcriptMessages.length === 0 ? (
                  <div className="text-center text-gray-500 text-xs sm:text-sm mt-10">
                    <Mic size={28} className="mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No transcription yet</p>
                    <p className="text-[10px] mt-2 text-gray-600">Your speech will appear here in real-time as you talk</p>
                  </div>
                ) : (
                  transcriptMessages.map((msg, i) => (
                    <TranscriptMessage 
                      key={i} 
                      message={msg} 
                      isOwn={msg.sender === "You"} 
                    />
                  ))
                )}
                <div ref={transcriptEndRef} />
              </div>
              <div className="p-3 border-t border-gray-800 bg-gray-950">
                <p className="text-[10px] text-center text-gray-500">
                  {isRecognizing ? (
                    <span className="text-green-400">● Listening... speak now</span>
                  ) : (
                    'AI transcription • End meeting to analyze'
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {sidebarTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 text-xs sm:text-sm mt-10">
                    <MessageSquare size={28} className="mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No messages yet</p>
                    <p className="text-[10px] mt-2 text-gray-600">Send a message to your participant below</p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <TranscriptMessage 
                      key={i} 
                      message={msg} 
                      isOwn={msg.sender === "You"} 
                    />
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-gray-800 bg-gray-950">
                <form onSubmit={sendMessage} className="flex items-end gap-2">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    placeholder="Type a message... (Enter to send)"
                    rows={1}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-2xl px-4 py-2.5 text-sm text-white resize-none focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-500 max-h-24 overflow-y-auto"
                    style={{ minHeight: '42px' }}
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center flex-shrink-0 shadow-lg"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Mobile toggle button to re-open sidebar */}
        {!showTranscript && (
          <button
            onClick={() => setShowTranscript(true)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800/80 backdrop-blur-sm p-3 rounded-l-xl shadow-lg sm:hidden z-20 border border-r-0 border-gray-700 flex flex-col items-center gap-1"
          >
            <MessageSquare size={16} className="text-blue-400" />
            <Mic size={14} className="text-red-400" />
          </button>
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
          <SettingsPanel 
            isOpen={showSettings} 
            onClose={() => setShowSettings(false)}
            settings={settings}
            onToggle={toggleSetting}
          />
        )}
      </AnimatePresence>
      
      {/* Push to talk indicator */}
      {settings.pushToTalk && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 animate-pulse">
          <Mic size={14} />
          Hold Spacebar to talk
        </div>
      )}
    </div>
  );
}