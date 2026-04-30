"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Copy } from "lucide-react";
import Peer from "peerjs";

export default function MeetingRoom({ params }) {
  const unwrappedParams = use(params);
  const roomId = unwrappedParams.id;
  const router = useRouter();

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("Waiting for others to join...");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Transcription state
  const [messages, setMessages] = useState([]);
  const [recognition, setRecognition] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const dataConnectionRef = useRef(null);

  // Initialize Media and PeerJS
  useEffect(() => {
    // 1. Get Local Media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // 2. Initialize PeerJS
        const newPeer = new Peer();
        
        newPeer.on("open", (id) => {
          setPeer(newPeer);
          
          // Are we the host (creator) or guest?
          // For simplicity, let's just try to connect to the RoomID.
          // If connection fails, it means we ARE the room host and waiting for connections.
          const conn = newPeer.connect(roomId);
          
          conn.on("open", () => {
            // We are the GUEST
            setConnectionStatus("Connected to Host");
            dataConnectionRef.current = conn;
            setupDataConnection(conn);
            
            // Call the host
            const call = newPeer.call(roomId, stream);
            call.on("stream", (userVideoStream) => {
              setRemoteStream(userVideoStream);
              if (remoteVideoRef.current) remoteVideoRef.current.srcObject = userVideoStream;
            });
          });

          conn.on("error", () => {
            // We are the HOST, let's wait with our ID as RoomID
            // Actually, PeerJS doesn't let you set your ID easily after creation if it's taken.
            // Better logic: Host creates room with ID = their peer ID.
          });
        });

        // 3. Handle incoming calls (We are Host)
        newPeer.on("call", (call) => {
          setConnectionStatus("Connected to Guest");
          call.answer(stream); // Answer the call with an A/V stream.
          call.on("stream", (remoteStream) => {
            setRemoteStream(remoteStream);
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
          });
        });

        // Handle incoming data connections
        newPeer.on("connection", (conn) => {
          dataConnectionRef.current = conn;
          setupDataConnection(conn);
        });

        // 4. Setup Speech Recognition
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
          const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
          const rec = new SpeechRec();
          rec.continuous = true;
          rec.interimResults = false; // Send only final results for chat
          rec.lang = 'en-US';

          rec.onresult = (event) => {
            let finalTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              }
            }
            if (finalTranscript.trim()) {
              const msg = { text: finalTranscript, sender: "You" };
              addMessage(msg);
              // Send to peer
              if (dataConnectionRef.current && dataConnectionRef.current.open) {
                dataConnectionRef.current.send(msg);
              }
            }
          };

          rec.onend = () => {
            if (isRecognizing) rec.start(); // Auto-restart if stopped
          };

          setRecognition(rec);
          rec.start();
          setIsRecognizing(true);
        }

      })
      .catch((err) => {
        console.error("Failed to get local stream", err);
        setConnectionStatus("Microphone/Camera permission denied.");
      });

    return () => {
      if (recognition) recognition.stop();
      if (peer) peer.destroy();
      if (localStream) localStream.getTracks().forEach(track => track.stop());
    };
  }, [roomId]);

  // We need to re-initialize PeerJS with the specific ID if we are the host
  // To keep it robust, the dashboard will route to `/room/[peerId]`
  // The first person arriving registers the peerId. 
  // Let's refine the Peer connection logic:
  useEffect(() => {
    if (localStream && !peer) {
      // Try to register with roomId
      const newPeer = new Peer(roomId);
      
      newPeer.on("open", (id) => {
        // Successfully registered as HOST
        setPeer(newPeer);
        setConnectionStatus("Waiting for others to join... Send them this URL.");
      });

      newPeer.on("error", (err) => {
        if (err.type === "unavailable-id") {
          // Room ID is taken, we are the GUEST
          const guestPeer = new Peer();
          guestPeer.on("open", (id) => {
            setPeer(guestPeer);
            const conn = guestPeer.connect(roomId);
            setupDataConnection(conn);
            dataConnectionRef.current = conn;
            
            const call = guestPeer.call(roomId, localStream);
            call.on("stream", (userVideoStream) => {
              setRemoteStream(userVideoStream);
              if (remoteVideoRef.current) remoteVideoRef.current.srcObject = userVideoStream;
              setConnectionStatus("Connected!");
            });
          });
        }
      });

      newPeer.on("call", (call) => {
        call.answer(localStream);
        call.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
          setConnectionStatus("Connected!");
        });
      });

      newPeer.on("connection", (conn) => {
        setupDataConnection(conn);
        dataConnectionRef.current = conn;
      });
    }
  }, [localStream]);

  const setupDataConnection = (conn) => {
    conn.on("open", () => {
      conn.on("data", (data) => {
        // Receive message from remote
        addMessage({ text: data.text, sender: "Guest" });
      });
    });
  };

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !isMicOn;
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !isVideoOn;
      setIsVideoOn(!isVideoOn);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Invite link copied!");
  };

  const endMeeting = async () => {
    setConnectionStatus("Analyzing interview with Gemini AI...");
    if (recognition) recognition.stop();
    setIsRecognizing(false);
    
    // Combine chat
    const fullTranscript = messages.map(m => `${m.sender}: ${m.text}`).join("\n\n");
    
    if (fullTranscript.length < 20) {
      alert("Meeting too short to summarize.");
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
      // Route to new interview results page
      router.push(`/dashboard/interview/${data._id}`);
    } catch (error) {
      alert("Failed to analyze.");
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#111] text-white">
      {/* Topbar */}
      <div className="p-4 flex justify-between items-center bg-[#222]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#d94a4a] rounded-lg flex items-center justify-center font-bold">M</div>
          <span className="font-semibold">Live Room</span>
        </div>
        <div className="text-sm text-gray-400 bg-[#333] px-3 py-1 rounded-full flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${remoteStream ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
          {connectionStatus}
        </div>
        <button onClick={copyLink} className="text-sm bg-[#333] hover:bg-[#444] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Copy size={16} /> Invite
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 p-4 relative flex flex-col items-center justify-center">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-[#333] shadow-xl">
            {remoteStream ? (
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                <div className="w-20 h-20 bg-[#222] rounded-full flex items-center justify-center mb-4 text-3xl">👤</div>
                <p>Waiting for guest to join...</p>
              </div>
            )}
            
            {/* Local Pip */}
            <div className="absolute bottom-4 right-4 w-48 aspect-video bg-[#222] rounded-xl overflow-hidden shadow-lg border-2 border-[#444]">
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 flex items-center gap-4 bg-[#222]/80 backdrop-blur-md px-6 py-3 rounded-full border border-[#444]">
            <button onClick={toggleMic} className={`p-3 rounded-full ${isMicOn ? 'bg-[#333] hover:bg-[#444]' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}>
              {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button onClick={toggleVideo} className={`p-3 rounded-full ${isVideoOn ? 'bg-[#333] hover:bg-[#444]' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}>
              {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            <button onClick={endMeeting} className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full ml-4 shadow-lg flex items-center gap-2 px-6">
              <PhoneOff size={20} /> End & Analyze
            </button>
          </div>
        </div>

        {/* Live Transcript Area */}
        <div className="w-80 bg-[#1a1a1a] border-l border-[#333] flex flex-col">
          <div className="p-4 border-b border-[#333] flex items-center gap-2">
            <span className="text-red-500 animate-pulse">●</span>
            <span className="font-medium text-sm">Live Transcript</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm mt-10">Start speaking...</div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === "You" ? "items-end" : "items-start"}`}>
                  <span className="text-xs text-gray-500 mb-1">{msg.sender}</span>
                  <div className={`p-3 rounded-xl text-sm max-w-[85%] ${msg.sender === "You" ? "bg-[#d94a4a] text-white rounded-tr-sm" : "bg-[#333] text-gray-200 rounded-tl-sm"}`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
