"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, UploadCloud, FileText, Play, X, AlertCircle, CheckCircle } from "lucide-react";

// Custom components
const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`px-4 sm:px-5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
      active 
        ? "bg-[#d94a4a] text-white shadow-md" 
        : "text-[#666] dark:text-neutral-400 hover:bg-[#faf6f0] dark:hover:bg-neutral-800 hover:text-[#d94a4a]"
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const FileInfo = ({ file, onRemove }) => (
  <div className="mt-4 flex items-center gap-2 text-sm bg-[#e6f4ea] dark:bg-green-900/20 px-3 py-2 rounded-lg animate-in slide-in-from-bottom-2">
    <CheckCircle size={16} className="text-[#5a9e4e] flex-shrink-0" />
    <span className="font-semibold text-xs uppercase tracking-wide text-[#5a9e4e] dark:text-green-400">Selected</span>
    <span className="truncate max-w-[150px] sm:max-w-[200px] text-[#2c2c2c] dark:text-white">{file.name}</span>
    <span className="text-xs text-[#666] dark:text-neutral-400">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
    <button 
      onClick={onRemove} 
      className="ml-auto text-[#999] hover:text-red-500 transition-colors"
      aria-label="Remove file"
    >
      <X size={14} />
    </button>
  </div>
);

const RecordingStatus = ({ isRecording, onToggle, isAnalyzing }) => (
  <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
    <button 
      onClick={onToggle}
      disabled={isAnalyzing}
      className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-sm transition-all ${
        isRecording 
          ? 'bg-red-500 text-white shadow-lg animate-pulse' 
          : 'bg-[#f7f3ef] dark:bg-neutral-800 text-[#666] dark:text-neutral-300 hover:bg-[#e8e0d5] dark:hover:bg-neutral-700 border border-[#e0d6cc] dark:border-neutral-700'
      }`}
    >
      {isRecording ? <Square size={14} fill="currentColor" /> : <Mic size={14} />}
      <span className="hidden sm:inline">{isRecording ? "Stop" : "Record"}</span>
    </button>
    {isRecording && (
      <span className="text-xs text-red-500 font-medium bg-white/90 dark:bg-neutral-900/90 px-2 py-1 rounded-full shadow-sm">
        🔴 Recording...
      </span>
    )}
  </div>
);

const UploadZone = ({ onFileSelect, selectedFile, onRemoveFile }) => (
  <div className="w-full min-h-[320px] flex flex-col items-center justify-center p-4 sm:p-6 relative">
    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#d94a4a]/10 to-[#d94a4a]/5 rounded-full flex items-center justify-center mb-4">
      <UploadCloud size={28} className="text-[#d94a4a]" />
    </div>
    <h3 className="text-lg font-semibold text-[#2c2c2c] dark:text-white mb-2">Upload Meeting Recording</h3>
    <p className="text-sm text-[#666] dark:text-neutral-400 text-center max-w-md mb-6">
      Upload MP3, WAV, M4A, or MP4 files. AI will transcribe and analyze your meeting.
    </p>
    
    <label className="cursor-pointer px-6 py-2.5 bg-white dark:bg-neutral-800 border-2 border-dashed border-[#e0d6cc] dark:border-neutral-700 text-[#2c2c2c] dark:text-white rounded-xl text-sm font-medium hover:border-[#d94a4a] hover:bg-[#faf6f0] dark:hover:bg-neutral-700 transition-all">
      Browse Files
      <input 
        type="file" 
        accept="audio/*,video/*" 
        className="hidden" 
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            onFileSelect(file);
          }
        }} 
      />
    </label>
    
    {selectedFile && (
      <FileInfo file={selectedFile} onRemove={onRemoveFile} />
    )}
    
    <p className="text-xs text-[#999] mt-6 pt-2 border-t border-[#e8e0d5] dark:border-neutral-800">
      Max file size: 20MB
    </p>
  </div>
);

const TextArea = ({ value, onChange, placeholder, isRecording, isAnalyzing }) => (
  <div className="relative">
    {isRecording && <RecordingStatus isRecording={isRecording} isAnalyzing={isAnalyzing} />}
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={isAnalyzing}
      className="w-full min-h-[280px] sm:min-h-[320px] p-4 sm:p-6 bg-transparent text-[#2c2c2c] dark:text-white focus:outline-none text-sm sm:text-base leading-relaxed resize-none placeholder:text-[#bbb] dark:placeholder:text-neutral-600"
    />
  </div>
);

const CharacterCounter = ({ count, showWarning }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-[#5a9e4e]">✓</span>
    <span className="text-xs text-[#666] dark:text-neutral-400">
      {count.toLocaleString()} characters
    </span>
    {showWarning && (
      <div className="flex items-center gap-1.5 text-[#e6a017]">
        <AlertCircle size={12} />
        <span className="text-xs">Add more context</span>
      </div>
    )}
  </div>
);

const ErrorMessage = ({ message, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
  >
    <div className="flex items-start justify-between gap-3">
      <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
        <AlertCircle size={16} className="flex-shrink-0" />
        <span>{message}</span>
      </p>
      <button onClick={onDismiss} className="text-red-400 hover:text-red-600 flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  </motion.div>
);

export default function MeetingInput({ onAnalyze, isAnalyzing }) {
  const [activeTab, setActiveTab] = useState("paste"); // paste, record, upload
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const textareaRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              currentTranscript += result[0].transcript;
            }
          }
          if (currentTranscript) {
            setTranscript((prev) => {
              const newText = prev + (prev ? " " : "") + currentTranscript;
              setCharCount(newText.length);
              return newText;
            });
          }
        };

        rec.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === 'network') {
            setError("Network error: Live dictation requires an active internet connection. Please use Google Chrome for best results.");
          } else if (event.error === 'not-allowed') {
            setError("Microphone access denied. Please allow microphone permissions to use live recording.");
          } else if (event.error !== 'no-speech') {
            setError(`Recording error: ${event.error}`);
          }
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        setRecognition(rec);
      } else {
        setError("Your browser doesn't support speech recognition. Try Google Chrome for live recording.");
      }
    }
  }, []);

  const handleTranscriptChange = useCallback((e) => {
    const value = e.target.value;
    setTranscript(value);
    setCharCount(value.length);
    if (error) setError("");
  }, [error]);

  const handleAnalyze = async () => {
    if (activeTab === "upload") {
      if (!selectedFile) {
        setError("Please select an audio or video file first! 📁");
        return;
      }
      if (selectedFile.size > 20 * 1024 * 1024) {
        setError("File is too large. Please upload a file smaller than 20MB.");
        return;
      }
      
      setError("");
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        await onAnalyze(null, formData);
      } catch (err) {
        setError("Something went wrong with the upload. Please try again.");
      }
      return;
    }

    if (!transcript.trim()) {
      setError("Please provide a meeting transcript first! 👋");
      return;
    }
    if (transcript.trim().length < 50) {
      setError("That's a bit short for a meeting. Provide more context for better insights!");
      return;
    }

    setError("");
    
    try {
      if (isRecording) stopRecording();
      await onAnalyze(transcript);
    } catch (err) {
      setError("Something went wrong. Please give it another shot!");
    }
  };

  const startRecording = useCallback(() => {
    if (!recognition) {
      setError("Speech recognition not supported. Please use Google Chrome for live recording.");
      return;
    }
    
    setError("");
    setIsRecording(true);
    
    try {
      recognition.start();
    } catch (err) {
      // Handle case where recognition is already started
      if (err.error !== 'invalidstate') {
        setError("Failed to start recording. Please try again.");
        setIsRecording(false);
      }
    }
  }, [recognition]);

  const stopRecording = useCallback(() => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (err) {
        console.error("Error stopping recording:", err);
      }
    }
    setIsRecording(false);
  }, [recognition]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setCharCount(0);
    setError("");
    if (isRecording) stopRecording();
  }, [isRecording, stopRecording]);

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
    setError("");
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setError("");
  }, []);

  const dismissError = useCallback(() => {
    setError("");
  }, []);

  const tabs = [
    { id: "paste", icon: <FileText size={16} />, label: "Paste Text" },
    { id: "record", icon: <Mic size={16} />, label: "Record Live" },
    { id: "upload", icon: <UploadCloud size={16} />, label: "Upload File" }
  ];

  const getPlaceholder = () => {
    if (activeTab === "paste") {
      return "Paste your meeting transcript here...\n\nExample:\nMeeting: Q1 Planning\nAttendees: Sarah, John, Mike\n- Discussed quarterly goals\n- Assigned action items\n- Set deadlines for next sprint";
    }
    return "Click 'Start Recording' and begin speaking. Your words will appear here in real-time...";
  };

  const showCharWarning = charCount > 0 && charCount < 50 && activeTab !== "upload";

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {/* Tabs */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="bg-white dark:bg-neutral-900 p-1 rounded-2xl shadow-sm border border-[#efe5db] dark:border-neutral-800 flex flex-wrap justify-center gap-1">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (isRecording) stopRecording();
                  setError("");
                }}
                icon={tab.icon}
                label={tab.label}
              />
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-[#efe5db] dark:border-neutral-800 overflow-hidden transition-all duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[#e8e0d5] dark:border-neutral-800 bg-gradient-to-r from-[#fefcf9] to-white dark:from-neutral-950 dark:to-neutral-900">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#d94a4a]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#e6a017]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#5a9e4e]/60" />
              </div>
              <span className="ml-2 text-xs font-medium text-[#999] uppercase tracking-wide">
                {activeTab === "paste" ? "Text Input" : activeTab === "record" ? "Live Recording" : "File Upload"}
              </span>
            </div>
            {transcript && activeTab !== "upload" && (
              <button 
                onClick={clearTranscript} 
                className="text-xs text-[#999] hover:text-[#d94a4a] transition-colors flex items-center gap-1"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>

          {/* Content Area */}
          <AnimatePresence mode="wait">
            {activeTab === "upload" ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <UploadZone 
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  onRemoveFile={handleRemoveFile}
                />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TextArea
                  value={transcript}
                  onChange={handleTranscriptChange}
                  placeholder={getPlaceholder()}
                  isRecording={isRecording}
                  isAnalyzing={isAnalyzing}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#fefcf9] dark:bg-neutral-950 border-t border-[#e8e0d5] dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-5 text-xs">
              {activeTab !== "upload" && (
                <CharacterCounter 
                  count={charCount} 
                  showWarning={showCharWarning} 
                />
              )}
              {activeTab === "upload" && selectedFile && (
                <div className="flex items-center gap-1.5 text-[#5a9e4e]">
                  <CheckCircle size={12} />
                  <span className="text-xs">Ready to upload</span>
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (activeTab === "upload" && !selectedFile) || (activeTab === "record" && isRecording)}
              className={`w-full sm:w-auto px-6 sm:px-8 py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                isAnalyzing || (activeTab === "upload" && !selectedFile) || (activeTab === "record" && isRecording)
                  ? "bg-[#e8e0d5] dark:bg-neutral-800 text-[#999] cursor-not-allowed" 
                  : "bg-[#d94a4a] text-white hover:bg-[#c13e3e] active:scale-95 shadow-md hover:shadow-lg"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Summarize Meeting
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-4 p-3 bg-[#faf6f0] dark:bg-neutral-900/50 rounded-xl border border-[#efe5db] dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs text-[#666] dark:text-neutral-400">
            <span className="font-medium text-[#2c2c2c] dark:text-white">💡 Pro tip:</span>
            {activeTab === "paste" && "Paste a complete meeting transcript with speaker labels for best results"}
            {activeTab === "record" && "Speak clearly and pause between sentences for accurate transcription"}
            {activeTab === "upload" && "Upload recordings in MP3 or WAV format with clear audio quality"}
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <ErrorMessage message={error} onDismiss={dismissError} />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}