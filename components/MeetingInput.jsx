"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, UploadCloud, FileText, Play } from "lucide-react";

export default function MeetingInput({ onAnalyze, isAnalyzing }) {
  const [activeTab, setActiveTab] = useState("paste"); // paste, record, upload
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Initialize Web Speech API for live transcription
    if (typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          currentTranscript += result[0].transcript;
        }
        setTranscript((prev) => prev + " " + currentTranscript);
        setCharCount((prev) => prev + currentTranscript.length);
      };

      rec.onerror = (event) => {
        if (event.error === 'network') {
          setError("Network error: Live dictation requires an active internet connection. Also ensure you are using Google Chrome.");
          setIsRecording(false);
        } else if (event.error !== 'no-speech') {
          setError("Microphone error: " + event.error);
          setIsRecording(false);
        }
      };

      setRecognition(rec);
    }
  }, []);

  const handleTranscriptChange = (e) => {
    const value = e.target.value;
    setTranscript(value);
    setCharCount(value.length);
    if (error) setError("");
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError("Please provide a meeting transcript first! 👋");
      return;
    }
    if (transcript.trim().length < 50) {
      setError("That's a bit short for a meeting. Provide more context so I can help you better!");
      return;
    }

    setError("");
    
    try {
      if (isRecording) stopRecording();
      await onAnalyze(transcript);
    } catch (err) {
      setError("Something went wrong. Give it another shot?");
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (!recognition) {
      setError("Your browser does not support live audio transcription. Try Chrome.");
      return;
    }
    setError("");
    setIsRecording(true);
    if (!transcript) setTranscript("Speaker: "); // Initial prompt
    recognition.start();
  };

  const stopRecording = () => {
    if (recognition) recognition.stop();
    setIsRecording(false);
  };

  const clearTranscript = () => {
    setTranscript("");
    setCharCount(0);
    setError("");
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-neutral-900 p-1 rounded-2xl shadow-sm border border-[#efe5db] dark:border-neutral-800 flex gap-1">
            <button
              onClick={() => setActiveTab("paste")}
              className={`px-5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === "paste" ? "bg-[#d94a4a]/10 text-[#d94a4a] dark:bg-[#d94a4a]/20" : "text-[#666] dark:text-neutral-400 hover:bg-[#faf6f0] dark:hover:bg-neutral-800"}`}
            >
              <FileText size={16} /> Paste Text
            </button>
            <button
              onClick={() => setActiveTab("record")}
              className={`px-5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === "record" ? "bg-[#d94a4a]/10 text-[#d94a4a] dark:bg-[#d94a4a]/20" : "text-[#666] dark:text-neutral-400 hover:bg-[#faf6f0] dark:hover:bg-neutral-800"}`}
            >
              <Mic size={16} /> Record Live
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === "upload" ? "bg-[#d94a4a]/10 text-[#d94a4a] dark:bg-[#d94a4a]/20" : "text-[#666] dark:text-neutral-400 hover:bg-[#faf6f0] dark:hover:bg-neutral-800"}`}
            >
              <UploadCloud size={16} /> Upload Audio/Video
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-[#efe5db] dark:border-neutral-800 overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8e0d5] dark:border-neutral-800 bg-[#fefcf9] dark:bg-neutral-950">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#d94a4a]/60" />
              <div className="w-3 h-3 rounded-full bg-[#e6a017]/60" />
              <div className="w-3 h-3 rounded-full bg-[#5a9e4e]/60" />
              <span className="ml-2 text-xs font-medium text-[#999] uppercase tracking-wide">Input Source</span>
            </div>
            <div className="flex items-center gap-3">
              {transcript && (
                <button onClick={clearTranscript} className="text-xs text-[#999] hover:text-[#d94a4a] transition-colors">
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Content Area */}
          {activeTab === "paste" || activeTab === "record" ? (
            <div className="relative">
              {activeTab === "record" && (
                <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                  <button 
                    onClick={toggleRecording}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse border border-red-200' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700'}`}
                  >
                    {isRecording ? <Square size={16} fill="currentColor" /> : <Mic size={16} />}
                    {isRecording ? "Stop Recording" : "Start Live Dictation"}
                  </button>
                  {isRecording && <span className="text-xs text-red-500 font-medium mr-2">Listening... Speak clearly</span>}
                </div>
              )}
              <textarea
                ref={textareaRef}
                value={transcript}
                onChange={handleTranscriptChange}
                placeholder={activeTab === "paste" ? "Paste your meeting transcript here..." : "Click 'Start Live Dictation' and begin speaking. Your words will appear here in real-time..."}
                className="w-full h-80 p-6 bg-transparent text-[#2c2c2c] dark:text-white focus:outline-none text-base leading-relaxed resize-none placeholder:text-[#bbb] dark:placeholder:text-neutral-600 font-mono"
              />
            </div>
          ) : (
            <div className="w-full h-80 flex flex-col items-center justify-center bg-[#faf6f0]/50 dark:bg-neutral-900/50 p-6">
              <div className="w-20 h-20 bg-white dark:bg-neutral-800 rounded-full shadow-sm border border-[#e0d6cc] dark:border-neutral-700 flex items-center justify-center mb-4 text-[#d94a4a]">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-lg font-semibold text-[#2c2c2c] dark:text-white mb-2">Upload Meeting Recording</h3>
              <p className="text-sm text-[#666] dark:text-neutral-400 text-center max-w-md mb-6">
                Upload your MP3, WAV, or MP4 file. Our AI will automatically transcribe the audio and generate a comprehensive summary.
              </p>
              <button className="px-6 py-2.5 bg-white dark:bg-neutral-800 border border-[#e0d6cc] dark:border-neutral-700 text-[#2c2c2c] dark:text-white rounded-xl text-sm font-medium hover:bg-[#faf6f0] dark:hover:bg-neutral-700 transition-colors shadow-sm">
                Browse Files
              </button>
              <p className="text-xs text-[#999] mt-4">Max file size: 25MB (Pro plan for larger files)</p>
            </div>
          )}

          {/* Footer with actions */}
          <div className="px-6 py-4 bg-[#fefcf9] dark:bg-neutral-950 border-t border-[#e8e0d5] dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-5 text-xs text-[#999] dark:text-neutral-500">
              <div className="flex items-center gap-1.5">
                <span className="text-[#5a9e4e]">✓</span>
                <span>{charCount} characters</span>
              </div>
              {charCount > 0 && charCount < 50 && (
                <div className="flex items-center gap-1.5 text-[#e6a017]">
                  <span>⚠️</span>
                  <span>A bit short — provide more for better results</span>
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (activeTab === "upload" && !transcript) || isRecording}
              className={`px-8 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${
                isAnalyzing || isRecording
                  ? "bg-[#e8e0d5] dark:bg-neutral-800 text-[#999] cursor-not-allowed" 
                  : "bg-[#d94a4a] text-white hover:bg-[#c13e3e] active:scale-95 shadow-sm"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#999] border-t-transparent rounded-full animate-spin"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Summarize meeting
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 rounded-xl bg-[#fef2f2] border border-[#fcd4d4] dark:bg-red-950/30 dark:border-red-900"
            >
              <p className="text-[#c73a3a] dark:text-red-400 text-sm flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}